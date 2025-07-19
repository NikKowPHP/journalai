
import { test as setup, expect } from "@playwright/test";

const authFile = ".auth/user.json";

setup("authenticate", async ({ page }) => {
  // This setup assumes a test user exists in the database.
  // For a real-world scenario, you would seed this user in a test-specific database.
  // The credentials should be stored in environment variables, not hardcoded.
  const testUserEmail = process.env.TEST_USER_EMAIL || "test@example.com";
  const testUserPassword =
    process.env.TEST_USER_PASSWORD || "PasswordForTesting123!";

  await page.goto("/login");
  await page.getByLabel("Email address").fill(testUserEmail);
  await page.getByLabel("Password").fill(testUserPassword);
  await page.getByRole("button", { name: "Sign In" }).click();

  // Wait for the page to redirect to the dashboard, confirming successful login.
  await expect(page).toHaveURL("/dashboard", { timeout: 15000 });

  // Save the authentication state to a file.
  await page.context().storageState({ path: authFile });
});