/** @jest-environment jsdom */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Flashcard } from "./Flashcard";
import { CheckCircle2, Sparkles, XCircle } from "lucide-react";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ...jest.requireActual("lucide-react"),
  CheckCircle2: () => <div data-testid="check-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
  XCircle: () => <div data-testid="x-icon" />,
}));

describe("Flashcard", () => {
  const frontContent = "Front of the card";
  const backContent = "Back of the card";
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

  it("renders the flipped state with review buttons and icons", () => {
    render(<Flashcard frontContent={frontContent} backContent={backContent} />);

    // Flip the card first
    fireEvent.click(screen.getByRole("button", { name: "Flip Card" }));

    const forgotButton = screen.getByRole("button", { name: /forgot/i });
    const goodButton = screen.getByRole("button", { name: /good/i });
    const easyButton = screen.getByRole("button", { name: /easy/i });

    expect(forgotButton).toBeInTheDocument();
    expect(goodButton).toBeInTheDocument();
    expect(easyButton).toBeInTheDocument();

    // Check for icons
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    expect(screen.getByTestId("sparkles-icon")).toBeInTheDocument();

    // All buttons should have the 'secondary' variant.
    // In our button component, this means they don't have the 'bg-primary' class of the default variant.
    // This is a simple way to check without getting too deep into CVA implementation details.
    expect(forgotButton).not.toHaveClass("bg-primary");
    expect(goodButton).not.toHaveClass("bg-primary");
    expect(easyButton).not.toHaveClass("bg-primary");
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
