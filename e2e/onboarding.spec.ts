
import { test, expect } from "@playwright/test";

test("should guide a new user through the entire onboarding process", async ({
  page,
}) => {
  // This test requires a fresh, un-onboarded user for each run.
  // For this to work, email verification should be disabled in the test environment for Supabase.
  const email = `onboarding-user-${Date.now()}@example.com`;
  const password = "PasswordForTesting123!";

  // 1. Sign up
  await page.goto("/signup");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page.getByText("Verification Email Sent")).toBeVisible({
    timeout: 10000,
  });

  // 2. Log in
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();

  // 3. Complete Onboarding Wizard
  // After login, the onboarding wizard should appear.
  await expect(
    page.getByRole("dialog", { name: "Welcome to LinguaScribe!" }),
  ).toBeVisible({ timeout: 10000 });

  // Step 1: Welcome
  await page.getByRole("button", { name: "Next" }).click();

  // Step 2: Native Language
  await expect(page.getByText("What is your native language?")).toBeVisible();
  await page.locator('[data-slot="select-trigger"]').first().click();
  await page.getByRole("option", { name: "English" }).click();
  await page.getByRole("button", { name: "Next" }).click();

  // Step 3: Target Language
  await expect(
    page.getByText("What language do you want to master?"),
  ).toBeVisible();
  await page.locator('[data-slot="select-trigger"]').first().click();
  await page.getByRole("option", { name: "Spanish" }).click();
  await page.getByRole("button", { name: "Finish Setup" }).click();

  // 4. Verify onboarding is complete
  // Wizard should close.
  await expect(page.getByRole("dialog")).not.toBeVisible();

  // The AppShell redirects to dashboard after login.
  await expect(page).toHaveURL(/.*dashboard/);

  // And that we can now access the journal editor (no blur)
  await page.goto("/journal");
  const editor = page.locator(".ProseMirror");
  await expect(editor).toBeVisible();
  await expect(editor).toBeEnabled();
});