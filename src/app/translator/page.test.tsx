
/** @jest-environment jsdom */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TranslatorPage from "./page";
import {
  useTranslateAndBreakdown,
  useTranslateText,
} from "@/lib/hooks/data";

jest.mock("@/lib/hooks/data", () => ({
  useUserProfile: jest.fn(() => ({
    data: {
      nativeLanguage: "english",
      defaultTargetLanguage: "spanish",
      languageProfiles: [{ language: "spanish" }],
    },
  })),
  useStudyDeck: jest.fn(() => ({ data: [] })),
  useTranslateText: jest.fn(),
  useTranslateAndBreakdown: jest.fn(),
}));

const mockTranslateTextMutate = jest.fn();
const mockTranslateTextReset = jest.fn();
const mockTranslateBreakdownMutate = jest.fn();
const mockTranslateBreakdownReset = jest.fn();

describe("TranslatorPage Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslateText as jest.Mock).mockReturnValue({
      mutate: mockTranslateTextMutate,
      reset: mockTranslateTextReset,
      isPending: false,
    });
    (useTranslateAndBreakdown as jest.Mock).mockReturnValue({
      mutate: mockTranslateBreakdownMutate,
      reset: mockTranslateBreakdownReset,
      isPending: false,
    });
  });

  it("resets mutations when swapping languages", async () => {
    mockTranslateTextMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.({ translatedText: "Hola" });
    });

    render(<TranslatorPage />);

    const textarea = screen.getByPlaceholderText("Enter text to translate...");
    fireEvent.change(textarea, { target: { value: "Hello" } });

    const translateButton = screen.getByRole("button", { name: /translate/i });
    fireEvent.click(translateButton);

    await waitFor(() => {
      expect(mockTranslateTextMutate).toHaveBeenCalled();
    });

    // Now swap languages
    const swapButton = screen.getByLabelText("Swap languages");
    fireEvent.click(swapButton);

    // Check that reset was called on both mutations
    expect(mockTranslateTextReset).toHaveBeenCalledTimes(1);
    expect(mockTranslateBreakdownReset).toHaveBeenCalledTimes(1);
  });
});