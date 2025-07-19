
import { test, expect } from "@playwright/test";

test.describe("Journaling Flow", () => {
  test.use({ storageState: ".auth/user.json" });

  test("should allow user to write, submit, and view analysis of a journal entry", async ({
    page,
  }) => {
    // 1. Start a new entry from a suggested topic
    await page.goto("/journal");

    // Wait for suggested topics to appear or generate them
    const generateButton = page.getByRole("button", {
      name: "Suggest New Topics",
    });
    await expect(generateButton).toBeVisible();
    await generateButton.click();

    // Wait for the topics to load after generation
    const topicButton = page
      .locator('[data-slot="card-content"] button')
      .first();
    await expect(topicButton).toBeVisible({ timeout: 15000 });
    const topicTitle = await topicButton.innerText();
    await topicButton.click();

    // Verify the editor placeholder is updated
    await expect(page.locator(".ProseMirror")).toHaveAttribute(
      "aria-placeholder",
      `Start writing about "${topicTitle}"...`,
    );

    // 2. Submit the journal
    await page
      .locator(".ProseMirror")
      .fill(
        "This is my test journal entry. I am writing about my day. It was a good day with a lot of sun.",
      );
    await page.getByRole("button", { name: "Submit for Analysis" }).click();

    // 3. Wait for and verify analysis
    await expect(page).toHaveURL(/.*\/journal\/.*/, { timeout: 15000 });
    await expect(
      page.getByText("Analysis in Progress..."),
    ).toBeVisible({ timeout: 10000 });

    // Wait for the analysis to be complete. The UI will update.
    await expect(page.getByText("Analysis in Progress...")).not.toBeVisible({
      timeout: 60000,
    });

    // Verify analysis display
    await expect(page.getByText("Your Original Text")).toBeVisible();
    // Check for highlighted text. This is a robust check for any highlight color.
    await expect(page.locator('span[class*="bg-"]')).toBeVisible();

    // Verify feedback cards
    await expect(page.getByText("Detailed Feedback")).toBeVisible();
    const feedbackCard = page
      .locator('[data-slot="card"]:has-text("Suggested Correction")')
      .first();
    await expect(feedbackCard).toBeVisible();
    await expect(feedbackCard.getByText("Original Text")).toBeVisible();
    await expect(feedbackCard.getByText("Explanation")).toBeVisible();
  });
});