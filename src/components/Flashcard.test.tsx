
/** @jest-environment jsdom */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Flashcard } from "./Flashcard";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ...jest.requireActual("lucide-react"),
  CheckCircle2: () => <div data-testid="check-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
  XCircle: () => <div data-testid="x-icon" />,
}));

// Mock TTSButton to inspect its props
jest.mock("./ui/TTSButton", () => ({
  TTSButton: ({ text, lang }: { text: string; lang: string }) => (
    <div data-testid="tts-button" data-text={text} data-lang={lang} />
  ),
}));
jest.mock("./ui/GuidedPopover", () => ({
  GuidedPopover: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="guided-popover">{children}</div>
  ),
}));

// Mock the feature flag hook
jest.mock("@/lib/hooks/useFeatureFlag", () => ({
  useFeatureFlag: () => [false, jest.fn()],
}));

describe("Flashcard", () => {
  const frontContent = "Front of the card";
  const backContent = "Back of the card";
  const context = "This is some context.";
  const onReviewMock = jest.fn();

  beforeEach(() => {
    onReviewMock.mockClear();
  });

  // Test 1: Verify initial state
  it("shows front content and 'Show Answer' button initially, but not back content", () => {
    render(<Flashcard frontContent={frontContent} backContent={backContent} />);

    // Check what's visible
    expect(screen.getByText(frontContent)).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Show Answer" }),
    ).toBeVisible();

    // Check what's not in the document
    expect(screen.queryByText(backContent)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /forgot/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /good/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /easy/i }),
    ).not.toBeInTheDocument();
  });

  // Test 2: Verify state after flipping
  it("reveals back content and review buttons when 'Show Answer' is clicked", () => {
    render(
      <Flashcard
        frontContent={frontContent}
        backContent={backContent}
        context={context}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show Answer" }));

    // Front content is still visible
    expect(screen.getByText(frontContent)).toBeVisible();

    // "Show Answer" button is now hidden
    expect(
      screen.queryByRole("button", { name: "Show Answer" }),
    ).not.toBeInTheDocument();

    // Back content is now visible
    expect(screen.getByText(backContent)).toBeVisible();
    expect(screen.getByText(context)).toBeVisible();

    // Review buttons are visible
    expect(screen.getByRole("button", { name: /forgot/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /good/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /easy/i })).toBeVisible();
  });

  // Test 3: Verify review button functionality
  it.each([
    [0, "Forgot"],
    [3, "Good"],
    [5, "Easy"],
  ])(
    "calls onReview with quality %i when '%s' is clicked",
    (quality, buttonName) => {
      render(
        <Flashcard
          frontContent={frontContent}
          backContent={backContent}
          onReview={onReviewMock}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Show Answer" }));
      fireEvent.click(
        screen.getByRole("button", { name: new RegExp(buttonName, "i") }),
      );

      expect(onReviewMock).toHaveBeenCalledWith(quality);
    },
  );

  describe("Flashcard TTS Buttons", () => {
    const props = {
      frontContent: "Hola",
      backContent: "Hello",
      nativeLanguage: "english",
      targetLanguage: "spanish",
      onReview: jest.fn(),
    };

    it("renders TTS buttons with correct languages for a 'MISTAKE' type card", () => {
      render(<Flashcard {...props} type="MISTAKE" />);
      fireEvent.click(screen.getByRole("button", { name: "Show Answer" }));

      const ttsButtons = screen.getAllByTestId("tts-button");
      expect(ttsButtons).toHaveLength(2);

      // Front of card is always target language
      expect(ttsButtons[0]).toHaveAttribute("data-text", props.frontContent);
      expect(ttsButtons[0]).toHaveAttribute("data-lang", "es-ES");

      // Back of MISTAKE card is also target language
      expect(ttsButtons[1]).toHaveAttribute("data-text", props.backContent);
      expect(ttsButtons[1]).toHaveAttribute("data-lang", "es-ES");
    });

    it("renders TTS buttons with correct languages for a 'TRANSLATION' type card", () => {
      render(<Flashcard {...props} type="TRANSLATION" />);
      fireEvent.click(screen.getByRole("button", { name: "Show Answer" }));

      const ttsButtons = screen.getAllByTestId("tts-button");
      expect(ttsButtons).toHaveLength(2);

      // Front of card is always target language
      expect(ttsButtons[0]).toHaveAttribute("data-text", props.frontContent);
      expect(ttsButtons[0]).toHaveAttribute("data-lang", "es-ES");

      // Back of TRANSLATION card is native language
      expect(ttsButtons[1]).toHaveAttribute("data-text", props.backContent);
      expect(ttsButtons[1]).toHaveAttribute("data-lang", "en-US");
    });
  });
});