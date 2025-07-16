
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

// Mock TTSButton and GuidedPopover
jest.mock("./ui/TTSButton", () => ({
  TTSButton: () => <div data-testid="tts-button" />,
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

  it("renders the unflipped state correctly", () => {
    render(<Flashcard frontContent={frontContent} backContent={backContent} />);
    expect(screen.getByText(frontContent)).toBeInTheDocument();
    expect(screen.queryByText(backContent)).not.toBeInTheDocument();
    const flipButton = screen.getByRole("button", { name: "Flip Card" });
    expect(flipButton).toBeInTheDocument();
  });

  it('flips the card when "Flip Card" button is clicked', () => {
    render(<Flashcard frontContent={frontContent} backContent={backContent} />);
    const flipButton = screen.getByRole("button", { name: "Flip Card" });
    fireEvent.click(flipButton);
    expect(screen.getByText(backContent)).toBeInTheDocument();
    expect(screen.queryByText(frontContent)).not.toBeInTheDocument();
  });

  it("renders the flipped state with review buttons, context, and TTS button", () => {
    render(
      <Flashcard
        frontContent={frontContent}
        backContent={backContent}
        context={context}
        targetLanguage="en"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Flip Card" }));

    // Check content
    expect(screen.getByText(backContent)).toBeInTheDocument();
    expect(screen.getByText(context)).toBeInTheDocument();
    expect(screen.getByTestId("tts-button")).toBeInTheDocument();

    // Check review buttons
    const forgotButton = screen.getByRole("button", { name: /forgot/i });
    const goodButton = screen.getByRole("button", { name: /good/i });
    const easyButton = screen.getByRole("button", { name: /easy/i });
    expect(forgotButton).toBeInTheDocument();
    expect(goodButton).toBeInTheDocument();
    expect(easyButton).toBeInTheDocument();

    // Check icons
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    expect(screen.getByTestId("sparkles-icon")).toBeInTheDocument();
  });

  it('calls onReview with quality 0 when "Forgot" is clicked', () => {
    render(
      <Flashcard
        frontContent={frontContent}
        backContent={backContent}
        onReview={onReviewMock}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Flip Card" }));
    fireEvent.click(screen.getByRole("button", { name: /forgot/i }));
    expect(onReviewMock).toHaveBeenCalledWith(0);
  });

  it('calls onReview with quality 3 when "Good" is clicked', () => {
    render(
      <Flashcard
        frontContent={frontContent}
        backContent={backContent}
        onReview={onReviewMock}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Flip Card" }));
    fireEvent.click(screen.getByRole("button", { name: /good/i }));
    expect(onReviewMock).toHaveBeenCalledWith(3);
  });

  it('calls onReview with quality 5 when "Easy" is clicked', () => {
    render(
      <Flashcard
        frontContent={frontContent}
        backContent={backContent}
        onReview={onReviewMock}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Flip Card" }));
    fireEvent.click(screen.getByRole("button", { name: /easy/i }));
    expect(onReviewMock).toHaveBeenCalledWith(5);
  });
});