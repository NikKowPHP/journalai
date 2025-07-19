I've identified the root cause of the widespread test failures. It's a race condition in the application's routing logic. Currently, both the `AppShell` component and the `SignInForm` component attempt to handle redirection after a successful login. This creates unpredictable behavior, especially in a fast automated test environment, causing the login process to fail and all subsequent authenticated tests to time out.

To resolve this, I will refactor the routing logic to establish a clear separation of concerns:

1.  **`AppShell.tsx`**: I will simplify this component significantly. It will now only be responsible for two things: showing a global spinner during the initial authentication check, and guarding client-side navigation (e.g., if a user logs out, it will redirect them from a protected page to the login page). It will no longer handle redirecting users *away* from the login page.
2.  **`SignInForm.tsx` & `SignUpForm.tsx`**: These components will now be solely responsible for redirecting the user to the dashboard immediately after a successful sign-in or sign-up. This makes the redirect an explicit result of a user action, which is more robust.
3.  **`auth.spec.ts`**: I will make the test for unauthenticated users more stable by explicitly waiting for the URL to change before asserting that the error message is visible.

This refactoring will eliminate the race condition, making the authentication flow predictable and reliable, which will fix the entire suite of failing E2E tests.

--------------------------------------------------------------------------------
### src/components/layout/AppShell.tsx
```typescript
```
--------------------------------------------------------------------------------
### e2e/auth.spec.ts
```typescript
```