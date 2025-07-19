
import { test, expect } from "@playwright/test";

test.describe("Spaced Repetition System (SRS) Flow", () => {
  test.use({ storageState: ".auth/user.json" });

  test("should allow user to add a mistake to SRS and review it", async ({
    page,
  }) => {
    // Setup: Create a journal entry with a known mistake to get a feedback card.
    await page.goto("/journal");
    // Ensure the language is set before submitting. The test user defaults to Spanish.
    // Let's assume the language switcher is already set to Spanish.
    await page.locator(".ProseMirror").fill("I has a good day."); // Deliberate grammar mistake
    await page.getByRole("button", { name: "Submit for Analysis" }).click();
    await expect(page).toHaveURL(/.*\/journal\/.*/, { timeout: 15000 });
    await expect(page.getByText("Analysis in Progress...")).not.toBeVisible({
      timeout: 60000,
    });

    // 1. Add Card from Mistake
    const feedbackCard = page
      .locator('[data-slot="card"]:has-text("Suggested Correction")')
      .first();
    await expect(feedbackCard).toBeVisible();
    const addToDeckButton = feedbackCard.getByRole("button", {
      name: "Add to Study Deck",
    });
    await addToDeckButton.click();
    await expect(addToDeckButton).toHaveText(/Added to Deck/);

    // 2. Review Card
    await page.goto("/study");
    const flashcardFront = page.locator(".text-lg.font-medium.text-center", {
      hasText: "I has a good day.",
    });
    await expect(flashcardFront).toBeVisible();

    // Flip the card
    await flashcardFront.click();
    await expect(
      page.locator(".text-lg.font-medium.text-center", {
        hasText: "I had a good day.",
      }),
    ).toBeVisible();

    // 3. Complete review
    await page.getByRole("button", { name: /Good/ }).click();

    // 4. Complete session
    await expect(page.getByText("Session Complete!")).toBeVisible();
  });
});