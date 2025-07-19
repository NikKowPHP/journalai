
import { test, expect } from "@playwright/test";

test.describe("Translator Flow", () => {
  test.use({ storageState: ".auth/user.json" });

  test("should translate text, show breakdown, and add to study deck", async ({
    page,
  }) => {
    await page.goto("/translator");

    // 1. Translate Text
    await expect(page.getByText("Enter Text")).toBeVisible();
    const sourceText = "Hello, world. This is a test.";
    await page.getByPlaceholder("Enter text to translate...").fill(sourceText);
    await page.getByRole("button", { name: "Translate" }).click();

    // Wait for translation and breakdown
    const outputTextarea = page.getByPlaceholder(
      "Translation will appear here...",
    );
    await expect(outputTextarea).not.toBeEmpty({ timeout: 15000 });
    const translation = await outputTextarea.inputValue();
    expect(translation.toLowerCase()).toContain("hola");

    // 2. Verify Breakdown
    const segmentCard = page
      .locator('[data-slot="card"]:has-text("Tip:")')
      .first();
    await expect(segmentCard).toBeVisible();
    await expect(
      segmentCard.getByText(sourceText.split(".")[0]),
    ).toBeVisible();

    // 3. Add Card from Segment
    const addButton = segmentCard.getByRole("button", { name: "Add to deck" });
    await addButton.click();
    await expect(page.locator("svg.text-green-500")).toBeVisible();

    // 4. Verify in study deck
    await page.goto("/study");
    await expect(page.getByText(sourceText)).toBeVisible();
  });
});