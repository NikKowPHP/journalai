
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should redirect unauthenticated user to login for protected routes", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    // Check for redirection to the login page with appropriate query parameters
    await expect(page).toHaveURL(
      /\/login.*error=Please\+log\+in\+to\+access\+this\+page/,
    );
    // Check that an error message is displayed to the user
    await expect(
      page.getByText("Please log in to access this page."),
    ).toBeVisible();
  });

  test("should allow a logged-in user to log out", async ({
    page,
    isMobile,
  }) => {
    // This test uses the authenticated state from auth.setup.ts
    test.use({ storageState: ".auth/user.json" });
    await page.goto("/dashboard");

    if (isMobile) {
      // Mobile flow: navigate to settings, then log out
      await page.getByRole("link", { name: "Settings" }).click();
      await expect(page).toHaveURL("/settings");
      await page.getByRole("button", { name: "Logout" }).click();
    } else {
      // Desktop flow: log out directly from the sidebar
      await page.getByRole("button", { name: "Logout" }).click();
    }

    // After logout, user should be on the homepage
    await expect(page).toHaveURL("/");

    // Verify that accessing a protected route now redirects to login
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*login/);
  });

  // Note: Sign-up and password reset flows are not tested E2E due to the
  // complexity of programmatically handling email verification links.
  // The onboarding.spec.ts file covers a successful sign-up flow.
});