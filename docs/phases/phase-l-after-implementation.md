### Executive Summary of Work Plan

This document outlines the implementation plan to bring the LinguaScribe codebase into 100% compliance with its technical specification (`app_description.md`). The plan is derived directly from the findings of the SpecCheck Audit Report and is structured to be executed by an AI developer agent.

The plan is prioritized into three tiers:
1.  **P1 - Missing Feature Implementation:** Focuses on creating the features and functionalities that are specified but entirely absent from the code. This includes AI-powered title generation, adaptive topic suggestions, progress reports, and completing the admin dashboard.
2.  **P2 - Mismatches & Corrections:** Addresses partially implemented or incorrect features. This involves updating existing code to match the specification's requirements, such as refining the AI's feedback depth and improving error handling for analysis jobs.
3.  **P3 - Documentation Updates:** Ensures the `app_description.md` is updated to reflect the existing, undocumented realities of the codebase, such as the Docker and Jest configurations.

Each task is atomic, traceable to a specific audit finding, and provides clear, imperative instructions for the developer agent.

---

### **P1 - Missing Feature Implementation**

- [x] **CREATE**: [LS-022]: Add a new function to the Gemini service for title generation.
    - **File(s)**: `src/lib/ai/gemini-service.ts`
    - **Action**: In the `GeminiQuestionGenerationService` class, create a new public async function `generateTitleForEntry(journalContent: string): Promise<string>`. The prompt should instruct the AI to generate a concise, relevant title (4-6 words) for the given journal entry and to return only the raw text of the title.
    - **Reason**: Audit Finding: "[❌ Unverified] LS-022: AI-Generated Titles for Free-Writes." This is the first step to implementing the feature.

- [x] **UPDATE**: [LS-022]: Integrate AI title generation for journal entries.
    - **File(s)**: `src/app/api/analyze/route.ts`
    - **Action**: In the `POST` handler, after a new `Analysis` is created, check if the associated `JournalEntry`'s topic title is a generic placeholder (like "Free Write"). If so, call the new `aiService.generateTitleForEntry` function and update the `Topic`'s title with the result.
    - **Reason**: Audit Finding: "[❌ Unverified] LS-022: AI-Generated Titles for Free-Writes." This task connects the AI service to the analysis workflow.

- [x] **CREATE**: [LS-020]: Create an API endpoint for suggesting topics.
    - **File(s)**: `src/app/api/user/suggested-topics/route.ts`
    - **Action**: Create a new `GET` route handler that retrieves the current user. The handler should fetch the user's proficiency score and SRS items. Based on this data (e.g., topics of items with low easeFactor or proficiency below a certain threshold), it should formulate a list of suggested topics to review. Return a JSON array of topic titles.
    - **Reason**: Audit Finding: "[❌ Unverified] LS-020: Adaptive Topic Suggestion." This task creates the necessary backend API.

- [ ] **CREATE**: [LS-020]: Create a UI component to display suggested topics.
    - **File(s)**: `src/components/SuggestedTopics.tsx`
    - **Action**: Create a new React component that accepts an array of topic strings as a prop. The component should render a list of these topics, with each item being a link to start a new journal entry for that topic.
    - **Reason**: Audit Finding: "[❌ Unverified] LS-020: Adaptive Topic Suggestion." This creates the UI element for the feature.

- [ ] **UPDATE**: [LS-020]: Display adaptive topic suggestions on the dashboard.
    - **File(s)**: `src/app/dashboard/page.tsx`
    - **Action**: In the `DashboardPage` component, use `useQuery` to fetch data from the new `/api/user/suggested-topics` endpoint. Pass the resulting data to the new `SuggestedTopics` component to render it on the dashboard.
    - **Reason**: Audit Finding: "[❌ Unverified] LS-020: Adaptive Topic Suggestion." This integrates the feature into the user-facing dashboard.

- [ ] **SETUP**: [LS-021]: Install a dependency for sending emails.
    - **File(s)**: `package.json`
    - **Action**: Run `npm install resend`. This will add the Resend SDK for sending transactional emails for progress reports.
    - **Reason**: Audit Finding: "[❌ Unverified] LS-021: Periodic Progress Reports." The project lacks an email sending capability, which is a prerequisite.

- [ ] **CREATE**: [LS-021]: Implement a service for sending progress report emails.
    - **File(s)**: `src/lib/services/email.service.ts`
    - **Action**: Create a new file and implement a function `sendProgressReport(userId: string)`. This function should fetch the user's analytics data for the past week, render a simple HTML email body summarizing the progress, and use the Resend SDK to send the email.
    - **Reason**: Audit Finding: "[❌ Unverified] LS-021: Periodic Progress Reports." This creates the core logic for the feature.

- [ ] **CREATE**: [LS-021]: Configure a cron job for weekly progress reports.
    - **File(s)**: `vercel.json`
    - **Action**: Create a `vercel.json` file in the root directory. Add a `crons` configuration to trigger a new API route (e.g., `/api/cron/weekly-report`) once a week. Example: `{"path": "/api/cron/weekly-report", "schedule": "0 0 * * 0"}`. Then, create the corresponding API route that will fetch all users and queue the `sendProgressReport` for each.
    - **Reason**: Audit Finding: "[❌ Unverified] LS-021: Periodic Progress Reports." This task sets up the automated, scheduled execution of the feature.

- [ ] **UPDATE**: [LS-ADM-002]: Make user rows in admin dashboard link to detail page.
    - **File(s)**: `src/components/AdminDashboard.tsx`
    - **Action**: Wrap the `TableRow` component in a router Link or add an `onClick` handler that navigates to `/admin/users/[id]`, passing the user's ID. You will need to fetch the user ID in `api/admin/users/route.ts` and pass it to the component.
    - **Reason**: Audit Finding: "[🟡 Partial] LS-ADM-002: View User Entries & Analyses." Admins cannot navigate to the user detail view.

- [ ] **UPDATE**: [LS-ADM-002]: Enhance user detail page to show journal entries.
    - **File(s)**: `src/app/admin/users/[id]/page.tsx`
    - **Action**: In the `UserDetailPage`, fetch the user's journal entries from a new admin-only API endpoint. Display these entries in a simple table, showing the entry date, topic, and a link to view the full analysis.
    - **Reason**: Audit Finding: "[🟡 Partial] LS-ADM-002: View User Entries & Analyses." The detail page currently only shows subscription data.

---

### **P2 - Mismatches & Corrections**

- [ ] **UPDATE**: [LS-SYS-002]: Refine AI prompt to provide adaptive feedback.
    - **File(s)**: `src/lib/ai/gemini-service.ts`
    - **Action**: In the `analyzeJournalEntry` function, modify the prompt string. Add a sentence that incorporates the `proficiencyScore` variable. For example: "The user's current proficiency score is ${proficiencyScore} out of 100. Tailor the depth and complexity of your 'explanation' for each mistake to this level. For lower scores, provide simpler explanations; for higher scores, provide more nuanced and advanced feedback."
    - **Reason**: Audit Finding: "[🟡 Partial] LS-SYS-002: Adaptive Feedback Depth." The AI prompt does not currently use the proficiency score to adjust its feedback.

- [ ] **UPDATE**: [LS-SYS-005]: Improve analysis submission UI feedback.
    - **File(s)**: `src/components/JournalEditor.tsx`
    - **Action**: Remove the `alert()` calls in the `handleSubmit` function. Add a new state variable, `[analysisStatus, setAnalysisStatus]`, to track the submission status ('idle', 'pending', 'success', 'error'). Display a message to the user within the component based on this state instead of using `alert()`.
    - **Reason**: Audit Finding: "[🟡 Partial] LS-SYS-005 & LS-SYS-006." The current user notification for analysis status is a blocking `alert`, which is poor UX.

---

### **P3 - Documentation Updates**

- [ ] **DOCS**: Document the Dockerized development environment.
    - **File(s)**: `docs/app_description.md`
    - **Action**: Add a new sub-section to "8. Development & Compliance Practices" titled "Local Development Environment". Briefly describe the provided `Dockerfile` and `docker-compose.yml` and explain that they can be used to run the application and database in a containerized environment.
    - **Reason**: Audit Finding: A Docker setup exists in the codebase but is not mentioned in the specification.

- [ ] **DOCS**: Update the specification to reflect the existing testing framework.
    - **File(s)**: `docs/app_description.md`
    - **Action**: In section "8. Development & Compliance Practices", find the "Testing Strategy" bullet point. Change the text from "Initial development will rely on rigorous manual testing... will be defined and implemented post-MVP" to "The project is configured with Jest for automated unit and integration testing to ensure long-term stability. A formal end-to-end testing strategy using a framework like Cypress may be defined post-MVP."
    - **Reason**: Audit Finding: A Jest testing framework is already configured, which contradicts the current documentation.