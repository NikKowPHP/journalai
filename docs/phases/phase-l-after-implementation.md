Of course. Here is the complete, finalized, and consolidated step-by-step plan to fully internationalize the LinguaScribe application.

This plan incorporates the best-practice `RootLayout` pattern you provided, includes the foundational setup for `next-intl` with the Next.js App Router, and details every component and page that needs refactoring in an atomic, easy-to-follow format.

---

# LinguaScribe: Final Internationalization (i18n) Plan

This document outlines the complete, step-by-step plan to refactor the LinguaScribe application for internationalization using the `next-intl` library. The initial implementation will focus on providing English (`en`) messages, establishing a scalable foundation for future languages.

## Phase 0: Foundational i18n Setup

This phase is critical. It configures the core of `next-intl` for the Next.js App Router, handling routing, message loading, and navigation.

*   [ ] **1. Create `i18n.ts` Configuration:**
    Create `src/i18n.ts` as the single source of truth for locale configuration.

    ```typescript
    // src/i18n.ts
    import { getRequestConfig } from 'next-intl/server';
    import { notFound } from 'next/navigation';

    export const locales = ['en', 'pl'];
    export type Locale = (typeof locales)[number];
    export const defaultLocale = 'en' as const;

    export default getRequestConfig(async ({ locale }) => {
      if (!locales.includes(locale as any)) notFound();

      return {
        messages: (await import(`./messages/${locale}.json`)).default,
      };
    });
    ```

*   [ ] **2. Create Locale-Aware Navigation:**
    Create `src/navigation.ts` to export navigation components that automatically handle locale prefixes in URLs.

    ```typescript
    // src/navigation.ts
    import { createSharedPathnamesNavigation } from 'next-intl/navigation';
    import { locales } from './i18n';

    export const { Link, redirect, usePathname, useRouter } =
      createSharedPathnamesNavigation({ locales });
    ```

*   [ ] **3. Update Middleware:**
    Replace the content of `src/middleware.ts` with the `next-intl` middleware. This will manage locale detection and routing.

    ```typescript
    // src/middleware.ts
    import createMiddleware from 'next-intl/middleware';
    import { locales, defaultLocale } from './i18n';

    export default createMiddleware({
      locales,
      defaultLocale,
    });

    export const config = {
      // Skip all paths that should not be internationalized
      matcher: ['/((?!api|_next|.*\\..*).*)']
    };
    ```

*   [ ] **4. Restructure `app` Directory:**
    Create a dynamic route for locales by moving all UI-related folders and files from `src/app` into a new `src/app/[locale]` directory.
    *   **Move:** `about`, `admin`, `auth`, `cookies`, `dashboard`, `forgot-password`, `journal`, `login`, `pricing`, `privacy`, `reset-password`, `settings`, `signup`, `study`, `translator`, `verify-email`, `layout.tsx`, `page.tsx`.
    *   **Into:** `src/app/[locale]/`
    *   **Do Not Move:** `globals.css` and the `api/` directory.

*   [ ] **5. Update Root Layout (`src/app/[locale]/layout.tsx`):**
    Implement the correct pattern for loading messages and providing them to client components.

    ```typescript
    // src/app/[locale]/layout.tsx
    import { notFound } from 'next/navigation';
    import { NextIntlClientProvider } from 'next-intl';
    import { unstable_setRequestLocale } from 'next-intl/server';
    import { Locale, locales } from '@/i18n';
    import React from "react";
    // ... your other layout imports (Providers, AppShell, etc.)

    interface LocaleLayoutProps {
      children: React.ReactNode;
      params: { locale: Locale };
    }

    export function generateStaticParams() {
      return locales.map((locale) => ({ locale }));
    }

    export default async function RootLayout({
      children,
      params: { locale },
    }: LocaleLayoutProps) {
      unstable_setRequestLocale(locale);

      let messages;
      try {
        messages = (await import(`../../messages/${locale}.json`)).default;
      } catch (error) {
        notFound();
      }

      return (
        <html lang={locale} suppressHydrationWarning>
          <body>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <Providers>
                <PostHogProvider>
                  <StoreInitializer />
                  <AppShell>{children}</AppShell>
                  <CookieBanner />
                  <Toaster />
                </PostHogProvider>
              </Providers>
            </NextIntlClientProvider>
          </body>
        </html>
      );
    }
    ```

*   [ ] **6. Implement Dynamic Metadata:**
    In `src/app/[locale]/layout.tsx`, replace the static `metadata` export with the `generateMetadata` function.

    ```typescript
    // src/app/[locale]/layout.tsx
    import { getTranslator } from 'next-intl/server';
    // ...

    export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
      const t = await getTranslator(locale, 'Metadata');
      return {
        title: t('title'),
        description: t('description'),
        // ... keep other metadata fields like manifest, icons, etc.
      };
    }
    // ... rest of the layout component
    ```

*   [ ] **7. Create `LocaleSwitcher` Component:**
    Add a component for changing languages and place it in your `AppShell` or `Footer`.

    ```typescript
    // src/components/LocaleSwitcher.tsx
    'use client';
    import { usePathname, useRouter } from '@/navigation';
    import { useLocale } from 'next-intl';
    // ...

    export function LocaleSwitcher() {
      const router = useRouter();
      const pathname = usePathname();
      const locale = useLocale();

      const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.replace(pathname, { locale: e.target.value });
      };

      return (
        <select value={locale} onChange={handleChange} className="bg-background border border-border rounded-md p-1">
          <option value="en">English</option>
          <option value="pl">Polski</option>
        </select>
      );
    }
    ```

*   [ ] **8. Populate `en.json`:**
    Add the initial metadata keys to `src/messages/en.json`.

    ```json
    {
      "Metadata": {
        "title": "LinguaScribe - AI Language Learning",
        "description": "Master a new language by shifting from passive learning to active creation through AI-powered writing feedback."
      }
    }
    ```

## Phase 1: Internalize Core UI & Layout Components

*   [ ] **`src/components/layout/DesktopSidebar.tsx`**
    *   [ ] Import `useTranslations`.
    *   [ ] Replace "LinguaScribe", "Dashboard", "Journal", "Study", "Translator", "Settings", "Logout".
    *   [ ] Update `en.json` with a `DesktopSidebar` section.
*   [ ] **`src/components/layout/BottomTabBar.tsx`**
    *   [ ] Import `useTranslations`.
    *   [ ] Replace "Home", "Journal", "Study", "Translator", "Settings".
    *   [ ] Update `en.json` with a `BottomTabBar` section.
*   [ ] **`src/components/layout/AppShell.tsx`**
    *   [ ] Import `useTranslations`.
    *   [ ] **Footer:** Replace copyright text and links: "About Us", "Privacy Policy", etc.
    *   [ ] **Onboarding Overlays:** Externalize all static text from the `OnboardingOverlay` dialogs.
    *   [ ] Update `en.json` with `AppShell`, `Footer`, and `Onboarding` sections.
*   [ ] **`src/components/CookieBanner.tsx`**
    *   [ ] Import `useTranslations`.
    *   [ ] Replace banner text and button labels: "Decline", "Accept".
    *   [ ] Update `en.json` with a `CookieBanner` section.

## Phase 2: Internalize Authentication & User Forms

*   [ ] **`src/components/SignInForm.tsx`**
    *   [ ] Import `useTranslations`.
    *   [ ] Replace title, labels, links, and button text ("Sign In", "Signing in...", "Forgot your password?").
    *   [ ] Update `en.json` with a `SignInForm` section.
*   [ ] **`src/components/SignUpForm.tsx`**
    *   [ ] Import `useTranslations`.
    *   [ ] Replace title, verification message, labels, and button text.
    *   [ ] Update `en.json` with a `SignUpForm` section.
*   [ ] **`src/components/ForgotPasswordForm.tsx`**
    *   [ ] Import `useTranslations`.
    *   [ ] Replace success message, labels, buttons, and links.
    *   [ ] Update `en.json` with a `ForgotPasswordForm` section.
*   [ ] **`src/app/[locale]/reset-password/page.tsx`**
    *   [ ] Import `useTranslations`.
    *   [ ] Replace all static text and messages.
    *   [ ] Update `en.json` with a `ResetPasswordPage` section.
*   [ ] **`src/components/ProfileForm.tsx`**
    *   [ ] Import `useTranslations`.
    *   [ ] Replace all labels, buttons, dialog text, and placeholders.
    *   [ ] Update `en.json` with a `ProfileForm` section.
*   [ ] **`src/components/AccountDeletion.tsx`**
    *   [ ] Import `useTranslations`.
    *   [ ] Replace all button and dialog text.
    *   [ ] Update `en.json` with an `AccountDeletion` section.

## Phase 3: Internalize Core Feature Pages & Components

*   [ ] **`src/app/[locale]/dashboard/page.tsx`**
    *   [ ] Import `useTranslations`.
    *   [ ] Replace all titles, button texts, and empty-state messages.
    *   [ ] Update `en.json` with a `DashboardPage` section.
*   [ ] **`src/components/DashboardSummary.tsx`**
    *   [ ] Import `useTranslations`.
    *   [ ] Replace card titles: "Total Entries", "Avg. Proficiency", "Focus Area".
    *   [ ] Update `en.json` with a `DashboardSummary` section.
*   [ ] **`src/app/[locale]/journal/page.tsx`**
    *   [ ] Import `useTranslations`.
    *   [ ] Replace titles, button text, and all static messages.
    *   [ ] Update `en.json` with a `JournalPage` section.
*   [ ] **`src/components/JournalEditor.tsx`**
    *   [ ] Import `useTranslations`.
    *   [ ] Replace all placeholder text, status messages, button labels, and helper UI text.
    *   [ ] Update `en.json` with a `JournalEditor` section.
*   [ ] **`src/app/[locale]/journal/[id]/page.tsx`**
    *   [ ] Import `useTranslations`.
    *   [ ] Replace all titles, status messages, and button text.
    *   [ ] Update `en.json` with a `JournalAnalysisPage` section.
*   [ ] **`src/components/FeedbackCard.tsx`**
    *   [ ] Import `useTranslations`.
    *   [ ] Replace section titles and button text variants ("Adding...", "Added to Deck!").
    *   [ ] Update `en.json` with a `FeedbackCard` section.
*   [ ] **`src/app/[locale]/study/page.tsx`**
    *   [ ] Import `useTranslations`.
    *   [ ] Replace titles, static messages (e.g., "No cards are due..."), and `GuidedPopover` text.
    *   [ ] Update `en.json` with a `StudyPage` section.
*   [ ] **`src/components/Flashcard.tsx`**
    *   [ ] Import `useTranslations`.
    *   [ ] Replace helper text and review button labels ("Forgot", "Good", "Easy").
    *   [ ] Update `en.json` with a `Flashcard` section.
*   [ ] **`src/components/StudySession.tsx`**
    *   [ ] Import `useTranslations`.
    *   [ ] Replace progress text ("Card {current} of {total}") and completion messages.
    *   [ ] Update `en.json` with a `StudySession` section.
*   [ ] **`src/app/[locale]/translator/page.tsx`** & Sub-components
    *   [ ] Import `useTranslations`.
    *   [ ] Replace all titles, placeholders, and button texts in the page and in `LanguageSelectorPanel`, `TranslationInput`, and `TranslationOutput`.
    *   [ ] Update `en.json` with `TranslatorPage` and related component sections.

## Phase 4: Internalize Static Pages & Advanced Logic

*   [ ] **`src/app/[locale]/page.tsx` (Landing Page)**
    *   [ ] Use `getTranslator` as it's a Server Component.
    *   [ ] Externalize all marketing copy, feature descriptions, and CTAs.
    *   [ ] Update `en.json` with a `LandingPage` section.
*   [ ] **`src/app/[locale]/about/page.tsx`** & **`src/app/[locale]/pricing/page.tsx`**
    *   [ ] Use `getTranslator`.
    *   [ ] Externalize all static content.
*   [ ] **`src/lib/config/pricing.ts`**
    *   [ ] Refactor `PricingTable.tsx` to source tier names, features, and CTAs from `en.json` using `useTranslations`.
    *   [ ] Move all display text from `pricing.ts` to a `PricingTiers` section in `en.json`.
*   [ ] **Refactor `use-toast` Hooks:**
    *   [ ] In UI components that use mutation hooks, handle `onSuccess` and `onError` callbacks.
    *   [ ] Use `useTranslations` inside the component to get the toast messages and pass them to `toast()`.
    *   [ ] Remove hardcoded strings from all `use...` hooks in `src/lib/hooks/data/`.
    *   [ ] Create a `Toasts` section in `en.json`.
*   [ ] **Refactor `src/lib/validation.ts`:**
    *   [ ] Modify validation functions to return message keys (e.g., `'ValidationErrors.email.invalid'`).
    *   [ ] In UI components (`SignUpForm`, etc.), use `useTranslations` to translate the returned key into a user-facing message.
    *   [ ] Create a `ValidationErrors` section in `en.json`.

## Phase 5: Finalization & Quality Assurance

*   [ ] **Convert All Links:**
    *   [ ] Perform a project-wide search for `import Link from 'next/link'`.
    *   [ ] Replace every instance with `import { Link } from '@/navigation';`.
    *   [ ] Do the same for `useRouter` and `usePathname` from `next/navigation`.
*   [ ] **Code Review:**
    *   [ ] Manually inspect every `.tsx` file in `src/app/[locale]` and `src/components` for any remaining hardcoded English strings. Pay close attention to error messages, placeholders, and aria-labels.
*   [ ] **Testing:**
    *   [ ] Navigate through the entire application in English.
    *   [ ] Use the `LocaleSwitcher` to change to Polish (even with an empty `pl.json`) to ensure routing works without errors.
    *   [ ] Verify that all links, forms, and dynamic content function correctly with the new i18n routing.