'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { useCompleteOnboarding, useUserProfile, useJournalHistory } from './hooks/data-hooks';

type OnboardingStep =
  | 'PROFILE_SETUP'
  | 'FIRST_JOURNAL'
  | 'AWAITING_ANALYSIS'
  | 'VIEW_ANALYSIS'
  | 'CREATE_DECK'
  | 'STUDY_INTRO'
  | 'COMPLETED'
  | 'INACTIVE';

interface OnboardingContextType {
  step: OnboardingStep;
  setStep: (step: OnboardingStep) => void;
  isActive: boolean;
  onboardingJournalId: string | null;
  setOnboardingJournalId: (id: string | null) => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const { user: authUser, loading: authLoading } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('INACTIVE');
  const [onboardingJournalId, setOnboardingJournalId] = useState<string | null>(null);

  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
  const { data: journals, isLoading: isJournalsLoading } = useJournalHistory();
  const completeOnboardingMutation = useCompleteOnboarding();


  const completeOnboarding = () => {
    if (step !== 'COMPLETED') {
        setStep('COMPLETED');
    }
    completeOnboardingMutation.mutate(undefined, {
        onSuccess: () => {
            setStep('INACTIVE');
        }
    });
  };

  useEffect(() => {
    // Wait until all user data and journal data has been loaded
    if (authLoading || isProfileLoading || isJournalsLoading) {
      return;
    }

    if (authUser && userProfile && !userProfile.onboardingCompleted) {
      // Case 1: The user's profile is not yet filled out.
      const isProfileIncomplete =
        !userProfile.nativeLanguage ||
        !userProfile.targetLanguage ||
        !userProfile.writingStyle ||
        !userProfile.writingPurpose ||
        !userProfile.selfAssessedLevel;

      if (isProfileIncomplete) {
        setStep('PROFILE_SETUP');
        return;
      }

      // Case 2: The user's profile is complete, but they have not written any entries.
      if (!journals || journals.length === 0) {
        setStep('FIRST_JOURNAL');
        return;
      }

      // Case 3: The user has a profile and has written at least one entry.
      const latestJournal = journals[0]; // The API sorts entries from newest to oldest.

      if (latestJournal && !latestJournal.analysis) {
        // Their latest entry is awaiting analysis.
        setOnboardingJournalId(latestJournal.id);
        setStep('AWAITING_ANALYSIS');
      } else if (latestJournal && latestJournal.analysis) {
        // Their entry has been analyzed; guide them to view it.
        setOnboardingJournalId(latestJournal.id);
        setStep('VIEW_ANALYSIS');
      }
    } else {
      // The user is either logged out or has already finished onboarding.
      setStep('INACTIVE');
    }
  }, [
    authUser,
    userProfile,
    journals,
    authLoading,
    isProfileLoading,
    isJournalsLoading,
    setStep,
    setOnboardingJournalId
  ]);


  const isActive = step !== 'INACTIVE' && step !== 'COMPLETED';

  const value = {
    step,
    setStep,
    isActive,
    onboardingJournalId,
    setOnboardingJournalId,
    completeOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};