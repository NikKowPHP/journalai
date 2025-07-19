
import { test, expect } from "@playwright/test";

test("should guide a new user through the initial profile setup", async ({
  page,
}) => {
  // This test requires a fresh, un-onboarded user for each run.
  // For this to work, email verification MUST be disabled in the test Supabase project.
  const email = `onboarding-user-${Date.now()}@example.com`;
  const password = "PasswordForTesting123!";

  // 1. Sign up. With email verification disabled, this will also log the user in.
  await page.goto("/signup");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign up" }).click();

  // 2. Complete Onboarding Wizard
  // After a successful sign-up, the user is redirected and the onboarding wizard should appear.
  await expect(
    page.getByRole("dialog", { name: "Welcome to LinguaScribe!" }),
  ).toBeVisible({ timeout: 15000 });

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

  // 4. Verify onboarding has progressed to the next step
  // The profile setup dialog should be replaced by the "Your First Entry" dialog.
  await expect(
    page.getByRole("dialog", { name: "Your First Entry" }),
  ).toBeVisible();

  // The AppShell redirects to dashboard after login, which happens behind the modal.
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
});