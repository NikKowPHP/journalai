
### Feature 1: Early Adopter Mode (New Users are "Pro")

This feature allows an admin to enable a mode where all newly registered users automatically get a "PRO" subscription.

*   [ ] **1. Create Database Migration for System Settings**
    *   [ ] Create a new Prisma migration file to add a `SystemSetting` table.
        *   **File:** `prisma/migrations/xxxxxxxx_add_system_settings/migration.sql`
        *   **Content:**
            ```sql
            -- CreateTable
            CREATE TABLE "SystemSetting" (
                "key" TEXT NOT NULL,
                "value" JSONB NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,

                CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
            );
            ```
    *   [ ] Update the `prisma/schema.prisma` file to include the new model.
        *   **File:** `prisma/schema.prisma`
        *   **Add Model:**
            ```prisma
            model SystemSetting {
              key       String   @id
              value     Json
              createdAt DateTime @default(now())
              updatedAt DateTime @updatedAt
            }
            ```
    *   [ ] Run `npx prisma migrate dev --name add_system_settings` to apply the migration.
    *   [ ] Seed the initial value for the setting.
        *   **File:** `prisma/seed.ts`
        *   **Add Logic:** Inside the `main` function, add:
            ```typescript
            await prisma.systemSetting.upsert({
              where: { key: 'earlyAdopterModeEnabled' },
              update: {},
              create: {
                key: 'earlyAdopterModeEnabled',
                value: { enabled: false }
              },
            });
            console.log("Seeded initial system settings.");
            ```

*   [ ] **2. Implement Backend Logic**
    *   [ ] Create a new API route for admin settings.
        *   **File:** `src/app/api/admin/settings/route.ts`
        *   **Action:** Implement `GET` and `PUT` methods. `GET` will fetch all settings. `PUT` will update a setting. Protect both with `authMiddleware` to ensure only admins can access them.
    *   [ ] Modify the user creation logic to check the new setting.
        *   **File:** `src/lib/user.ts`
        *   **Action:** In the `ensureUserInDb` function, when creating a `newUser`, first query the `SystemSetting` table for `earlyAdopterModeEnabled`. If it's `true`, create the user with `subscriptionTier: 'PRO'`.

*   [ ] **3. Update API Client and Data Hooks**
    *   [ ] Add methods for admin settings to the API client.
        *   **File:** `src/lib/services/api-client.service.ts`
        *   **Action:** Inside the `admin` object, add `getSettings` and `updateSettings` methods.
    *   [ ] Create new data hooks for admin settings.
        *   **File:** `src/lib/hooks/admin-hooks.ts`
        *   **Action:** Create `useAdminSettings` (query) and `useUpdateAdminSettings` (mutation).

*   [ ] **4. Build Frontend UI in Admin Panel**
    *   [ ] Create a new component for managing system settings.
        *   **File:** `src/components/AdminSettings.tsx`
        *   **Action:** Build a component with a `Switch` (from shadcn/ui) for the "Early Adopter Mode". It will use the `useAdminSettings` hook to get the current state and `useUpdateAdminSettings` to change it.
    *   [ ] Integrate the new component into the admin dashboard.
        *   **File:** `src/app/admin/page.tsx`
        *   **Action:** Import and render the `AdminSettings` component within the main admin page, likely above the user list.

---

### Feature 2: Topic Generator in Journal Tab

This feature adds the "Suggest New Topics" functionality, currently on the dashboard, to the journal page.

*   [ ] **1. Update Journal Page UI and Logic**
    *   [ ] Open the journal page component file.
        *   **File:** `src/app/journal/page.tsx`
    *   [ ] Import `useState`, `useGenerateTopics` hook, and `SuggestedTopics` component.
    *   [ ] Copy the state and mutation logic for topic generation from `src/app/dashboard/page.tsx`:
        ```typescript
        const [generatedTopics, setGeneratedTopics] = useState<string[]>([]);
        const generateTopicsMutation = useGenerateTopics();

        const handleGenerateTopics = () => {
          generateTopicsMutation.mutate(undefined, {
            onSuccess: (data) => {
              if (data.topics) {
                setGeneratedTopics(data.topics);
              }
            },
          });
        };
        ```
    *   [ ] Add the topic generator UI elements to the page's render method. A good location is below the `<h1>My Journal</h1>` and before the main grid layout.
        ```tsx
        <div className="space-y-4">
          <Button
            onClick={handleGenerateTopics}
            disabled={generateTopicsMutation.isPending}
          >
            {generateTopicsMutation.isPending
              ? "Generating..."
              : "Suggest New Topics"}
          </Button>
          {generatedTopics.length > 0 && (
            <SuggestedTopics topics={generatedTopics} />
          )}
        </div>
        ```

---

### Feature 3: Fix Autocomplete Functionality

This feature involves implementing the client-side logic to call the existing autocomplete API and display the results in the `JournalEditor`.

*   [ ] **1. Update API Client and Data Hooks for Autocomplete**
    *   [ ] Add an `autocomplete` method to the API client.
        *   **File:** `src/lib/services/api-client.service.ts`
        *   **Action:** Inside the `apiClient` object, add a new `ai` section if it doesn't exist, and add the `autocomplete` method:
            ```typescript
            ai: {
              autocomplete: async (payload: { text: string }) => {
                const { data } = await axios.post('/api/ai/autocomplete', payload);
                return data;
              },
            },
            ```
    *   [ ] Create a `useAutocomplete` mutation hook.
        *   **File:** `src/lib/hooks/data-hooks.ts`
        *   **Action:** Add the following mutation hook:
            ```typescript
            export const useAutocomplete = () => {
              return useMutation({
                mutationFn: apiClient.ai.autocomplete,
              });
            };
            ```

*   [ ] **2. Implement Autocomplete Logic in the Editor**
    *   [ ] Open the journal editor component.
        *   **File:** `src/components/JournalEditor.tsx`
    *   [ ] Import `useEffect`, `useRef`, `useAutocomplete` hook, and `FloatingMenu` from TipTap.
    *   [ ] Add state to manage the suggestion and the mutation logic.
        ```typescript
        const [suggestion, setSuggestion] = useState<string | null>(null);
        const autocompleteMutation = useAutocomplete();
        const debounceTimer = useRef<NodeJS.Timeout | null>(null);
        ```
    *   [ ] Add a `useEffect` to trigger the autocomplete on user input pause.
        ```typescript
        useEffect(() => {
          if (!editor) return;

          const handleUpdate = () => {
            setSuggestion(null); // Clear suggestion on new input
            if (debounceTimer.current) {
              clearTimeout(debounceTimer.current);
            }

            debounceTimer.current = setTimeout(() => {
              const text = editor.getText();
              if (text.trim().length > 10) { // Only trigger if there's enough content
                autocompleteMutation.mutate({ text }, {
                  onSuccess: (data) => setSuggestion(data.completedText),
                });
              }
            }, 1500); // 1.5-second delay
          };

          editor.on('update', handleUpdate);

          return () => {
            editor.off('update', handleUpdate);
            if (debounceTimer.current) {
              clearTimeout(debounceTimer.current);
            }
          };
        }, [editor, autocompleteMutation]);
        ```
    *   [ ] Use TipTap's `FloatingMenu` to display the suggestion.
        *   **Action:** Add the `FloatingMenu` inside the main `div` of the component, alongside `EditorContent`.
        ```tsx
        {editor && suggestion && (
          <FloatingMenu
            editor={editor}
            shouldShow={() => suggestion !== null}
            tippyOptions={{ duration: 100, placement: 'bottom-start' }}
          >
            <div className="bg-background border rounded-lg p-2 shadow-lg text-sm">
              <span className="text-muted-foreground">{suggestion}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => {
                  editor.chain().focus().insertContent(suggestion).run();
                  setSuggestion(null);
                }}
              >
                Accept (Tab)
              </Button>
            </div>
          </FloatingMenu>
        )}
        ```
    *   [ ] Add a keyboard shortcut to accept the suggestion.
        *   **File:** `src/components/JournalEditor.tsx`
        *   **Action:** In the `useEditor` configuration, add a new extension for handling the 'Tab' key.
            ```typescript
            // Inside useEditor extensions array:
            StarterKit.configure({
              // ... other starter kit config
            }).extend({
              addKeyboardShortcuts() {
                return {
                  'Tab': () => {
                    if (suggestion) {
                      this.editor.chain().focus().insertContent(suggestion).run();
                      setSuggestion(null);
                      return true; // prevent default tab behavior
                    }
                    return false;
                  },
                };
              },
            }),
            ```