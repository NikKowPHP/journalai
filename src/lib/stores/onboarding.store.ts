import { create } from 'zustand';

type OnboardingStep =
  | 'PROFILE_SETUP'
  | 'FIRST_JOURNAL'
  | 'AWAITING_ANALYSIS'
  | 'VIEW_ANALYSIS'
  | 'CREATE_DECK'
  | 'STUDY_INTRO'
  | 'COMPLETED'
  | 'INACTIVE';

interface OnboardingState {
  step: OnboardingStep;
  isActive: boolean;
  onboardingJournalId: string | null;
  setStep: (step: OnboardingStep) => void;
  setOnboardingJournalId: (id: string | null) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 'INACTIVE',
  isActive: false,
  onboardingJournalId: null,

  setStep: (step) => set(state => ({ step, isActive: step !== 'INACTIVE' && step !== 'COMPLETED' })),
  
  setOnboardingJournalId: (id) => set({ onboardingJournalId: id }),

  resetOnboarding: () => set({ step: 'INACTIVE', isActive: false, onboardingJournalId: null }),
}));