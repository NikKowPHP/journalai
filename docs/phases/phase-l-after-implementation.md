# Todo List: UI/UX Overhaul for Apple Look & Feel (PWA Edition)

This plan outlines the steps to transform the application into a high-fidelity PWA. The goal is an Apple iOS-native look and feel on mobile (with a bottom tab bar) and a macOS-native application look on desktop.

---

## Phase 1: Foundation & Design System Definition

This phase establishes the global design tokens and foundational styles that will be used across the entire application.

- [x] **1.1. Research and Define Design Principles:**
    - [x] Analyze Apple's Human Interface Guidelines (HIG) for iOS and macOS.
    - [x] Create a brief document summarizing key principles for typography, spacing, color, iconography, and layout for both platforms.

- [x] **1.2. Typography Setup:**
    - [x] Choose and integrate a font that mimics Apple's San Francisco (SF) font, such as "Inter".
    - [x] Update `tailwind.config.ts` and `src/app/globals.css` to use the new font family by default.
    - [x] Define text styles (Large Title, Title 1, Body, etc.) in `globals.css` that map to Apple's HIG, with responsive adjustments.

- [x] **1.3. Color Palette & Theming:**
    - [x] Define the primary color palette based on Apple's vibrant blues and neutral grays for both light and dark modes.
    - [x] Update `--background`, `--foreground`, `--primary`, `--secondary`, etc., CSS variables in `src/app/globals.css`.
    - [x] Ensure the dark mode palette aligns with macOS/iOS dark themes (true black for iOS, dark gray for macOS).

- [x] **1.4. Layout, Spacing & Radius:**
    - [x] Update Tailwind's spacing scale in `tailwind.config.ts` to reflect Apple's 8pt grid system.
    - [x] Modify the base `--radius` variable in `globals.css` to match the rounded corners on iOS/macOS elements.

- [x] **1.5. Iconography:**
    - [x] Review `lucide-react` icons against Apple's SF Symbols. Replace any icons that feel out of place to maintain a consistent aesthetic.

---

## Phase 2: Core UI Component Redesign (`src/components/ui`)

This phase focuses on restyling the base-level, reusable components for both mobile (iOS) and desktop (macOS) contexts.

- [x] **2.1. Button (`button.tsx`):**
    - [x] **Mobile (iOS):** Style buttons to have a "pill" shape or standard rounded rectangle.
    - [x] **Desktop (macOS):** Style buttons to be flatter with a subtle border and a vibrant blue for the primary action.
    - [x] Add a `glass` or `translucent` variant for a frosted glass effect.

- [x] **2.2. Input (`input.tsx`):**
    - [x] **Mobile (iOS):** Style inputs to appear inset within a grouped list format.
    - [x] **Desktop (macOS):** Style inputs with a flatter appearance and subtle focus shadows.

- [x] **2.3. Card (`card.tsx`):**
    - [x] **Mobile (iOS):** Restyle cards to emulate iOS grouped table view cells (inset, with separators).
    - [x] **Desktop (macOS):** Give cards a lighter, translucent background (frosted glass effect) with a very thin border, removing heavy shadows.

- [x] **2.4. Dialog (`dialog.tsx`):**
    - [x] **Mobile (iOS):** Use media queries to transform the dialog into a **bottom sheet** that slides up from the screen's bottom.
    - [x] **Desktop (macOS):** Restyle the dialog to resemble a native macOS window, adding a header/title bar area and non-functional "traffic light" dots. The `DialogOverlay` should provide a background blur effect.

- [x] **2.5. Select (`select.tsx`):**
    - [x] **Mobile (iOS):** Trigger a native-style "wheel" picker that covers the bottom half of the screen.
    - [x] **Desktop (macOS):** Style the trigger like a macOS pop-up button. Style the dropdown `SelectContent` with a translucent appearance.

- [x] **2.6. Table (`table.tsx`):**
    - [x] **Mobile (iOS):** Transform tables into a list of cards, where each row is a tappable card item.
    - [x] **Desktop (macOS):** Style the table with alternating row colors (zebra-striping) and a distinct header row.

---

## Phase 3: Page Layout & Navigation Overhaul

This phase re-imagines the application structure to align with platform-specific navigation patterns, **including the mobile bottom tab bar**.

- [x] **3.1. Create Bottom Tab Bar Component:**
    - [x] Create a new component `src/components/layout/BottomTabBar.tsx`.
    - [x] Style the bar with a translucent, blurry background (backdrop-filter).
    - [x] Add icons and labels for primary navigation links (Dashboard, Journal, Study, Analytics, Settings).
    - [x] Use the `usePathname` hook from `next/navigation` to apply an "active" style to the current route's tab.

- [x] **3.2. Main Layout (`src/app/layout.tsx`):**
    - [x] **Conditional Rendering Logic:**
        - [x] Hide the existing top `<nav>` on mobile viewports.
        - [x] Render the new `<BottomTabBar />` component only on mobile viewports.
        - [x] Implement a desktop-only **Sidebar** for navigation, which will be hidden on mobile.
    - [x] The main page content should have appropriate padding (`padding-bottom`) on mobile to avoid being obscured by the bottom tab bar.

- [x] **3.3. Update Public & Auth Pages (`/`, `/login`, `/signup`, etc.):**
    - [x] Restyle landing page (`/page.tsx`) and auth forms (`SignInForm.tsx`, `SignUpForm.tsx`) to match the new Apple aesthetic.
    - [x] Ensure form elements use the newly styled `Input` and `Button` components.

- [x] **3.4. Update Authenticated Pages (`/dashboard`, `/journal`, `/settings`, etc.):**
    - [x] **Dashboard (`/dashboard`):** Use a `UITableView`-style list for `SuggestedTopics` on mobile.
    - [x] **Journal (`/journal`):** Redesign `JournalHistoryList` to use the new card-based list on mobile.
    - [x] **Settings (`/settings`):** Structure the page like the iOS Settings app, using grouped, inset lists.

---

## Phase 4: Progressive Web App (PWA) Implementation

This phase adds the necessary components to make the site installable and feel like a native application.

- [ ] **4.1. Add PWA Dependency:**
    - [ ] Install `next-pwa`: `npm install next-pwa`.

- [ ] **4.2. Create Web App Manifest:**
    - [ ] Create a `public/manifest.json` file.
    - [ ] Populate the manifest with app details: `name`, `short_name`, `description`, `start_url`, `display: 'standalone'`, `background_color`, `theme_color`.

- [ ] **4.3. Generate App Icons:**
    - [ ] Create a set of app icons in various sizes (e.g., 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512).
    - [ ] Place the icons in the `public/icons` directory.
    - [ ] Reference these icons in the `manifest.json` file.

- [ ] **4.4. Configure Service Worker:**
    - [ ] Modify `next.config.ts` to use the `next-pwa` plugin.
    - [ ] Configure the PWA options, setting `dest: 'public'` and defining runtime caching strategies for pages, assets, and images. Ensure API calls (`/api/**`) are configured to be network-first.

- [ ] **4.5. Update Root Layout for PWA:**
    - [ ] In `src/app/layout.tsx`, add the necessary `<meta>` tags and `<link>` tags to the document `<head>`.
    - [ ] Link to the `manifest.json`: `<link rel="manifest" href="/manifest.json" />`.
    - [ ] Add `theme-color` meta tag.
    - [ ] Add Apple-specific meta tags for PWA behavior: `<meta name="apple-mobile-web-app-capable" content="yes" />` and `<meta name="apple-mobile-web-app-status-bar-style" content="default">`.
    - [ ] Add Apple touch icons: `<link rel="apple-touch-icon" href="/icons/icon-192x192.png">`.

---

## Phase 5: Final Polish & Interaction

This final phase adds the micro-interactions and details that complete the native experience.

- [ ] **5.1. Animations & Transitions:**
    - [ ] Add subtle, physics-based transitions for page navigation and modal presentations.
    - [ ] Animate button presses and list item taps.

- [ ] **5.2. State Refinement & Haptics:**
    - [ ] Review and refine all `:hover`, `:focus-visible`, and `:active` states for all interactive components.
    - [ ] Style the `Spinner.tsx` to look like the native iOS/macOS activity indicator.
    - [ ] (Optional) Implement subtle haptic feedback on button taps for a more native feel on supported mobile devices.

- [ ] **5.3. Final Review & Cleanup:**
    - [ ] Do a full visual review of every page on both mobile and desktop.
    - [ ] Test the PWA installation flow on Android and iOS (via "Add to Home Screen").
    - [ ] Verify offline functionality for cached pages.
    - [ ] Remove any unused CSS or component styles from the old design system.