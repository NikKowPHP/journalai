
import { create } from "zustand";

type OnboardingStep =
  | "PROFILE_SETUP"
  | "FIRST_JOURNAL"
  | "VIEW_ANALYSIS"
  | "CREATE_DECK"
  | "STUDY_INTRO"
  | "COMPLETED"
  | "INACTIVE";

interface OnboardingState {
  step: OnboardingStep;
  isActive: boolean;
  onboardingJournalId: string | null;
  setStep: (step: OnboardingStep) => void;
  setOnboardingJournalId: (id: string | null) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: "INACTIVE",
  isActive: false,
  onboardingJournalId: null,

  setStep: (step) =>
    set((state) => ({
      step,
      isActive: step !== "INACTIVE",
    })),

  setOnboardingJournalId: (id) => set({ onboardingJournalId: id }),

  resetOnboarding: () =>
    set({ step: "INACTIVE", isActive: false, onboardingJournalId: null }),
}));