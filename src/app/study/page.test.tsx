/** @jest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import StudyPage from "./page";
import { useLanguageStore } from "@/lib/stores/language.store";
import { useStudyDeck } from "@/lib/hooks/data";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";

// Mock dependencies
jest.mock("@/lib/stores/language.store");
jest.mock("@/lib/stores/onboarding.store");
jest.mock("@/lib/hooks/data", () => ({
  useStudyDeck: jest.fn(),
}));
jest.mock("@/components/StudySession", () => ({
  StudySession: () => <div data-testid="study-session" />,
}));
jest.mock("@/components/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher" />,
}));
jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

const mockedUseLanguageStore = useLanguageStore as unknown as jest.Mock;
const mockedUseStudyDeck = useStudyDeck as jest.Mock;
const mockedUseOnboardingStore = useOnboardingStore as unknown as jest.Mock;

describe("StudyPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for onboarding store
    mockedUseOnboardingStore.mockReturnValue({
      step: "INACTIVE",
      setStep: jest.fn(),
    });
  });

  it("shows a loading skeleton when useStudyDeck is loading", () => {
    mockedUseLanguageStore.mockReturnValue({ activeTargetLanguage: "spanish" });
    mockedUseStudyDeck.mockReturnValue({
      isLoading: true,
      data: null,
      error: null,
    });

    render(<StudyPage />);
    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
  });

  it('shows "Please select a language" message when no language is active', () => {
    mockedUseLanguageStore.mockReturnValue({ activeTargetLanguage: null });
    mockedUseStudyDeck.mockReturnValue({
      isLoading: false,
      data: [],
      error: null,
    });

    render(<StudyPage />);
    expect(
      screen.getByText("Please select a language to start studying."),
    ).toBeInTheDocument();
  });

  it('shows "No cards are due" message when the deck is empty', () => {
    mockedUseLanguageStore.mockReturnValue({ activeTargetLanguage: "spanish" });
    mockedUseStudyDeck.mockReturnValue({
      isLoading: false,
      data: [],
      error: null,
    });

    render(<StudyPage />);
    expect(
      screen.getByText(/No cards are due for review in Spanish/),
    ).toBeInTheDocument();
  });

  it("renders the StudySession component when there are cards in the deck", () => {
    const mockCards = [
      {
        id: "1",
        frontContent: "Hello",
        backContent: "Hola",
        context: "Greeting",
      },
    ];
    mockedUseLanguageStore.mockReturnValue({ activeTargetLanguage: "spanish" });
    mockedUseStudyDeck.mockReturnValue({
      isLoading: false,
      data: mockCards,
      error: null,
    });

    render(<StudyPage />);
    expect(screen.getByTestId("study-session")).toBeInTheDocument();
  });

  it("displays an error message if useStudyDeck fails", () => {
    const error = new Error("Failed to fetch");
    mockedUseLanguageStore.mockReturnValue({ activeTargetLanguage: "spanish" });
    mockedUseStudyDeck.mockReturnValue({ isLoading: false, data: null, error });

    render(<StudyPage />);
    expect(
      screen.getByText("Error loading study deck: Failed to fetch"),
    ).toBeInTheDocument();
  });
});
