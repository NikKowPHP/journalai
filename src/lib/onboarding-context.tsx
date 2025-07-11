'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { useCompleteOnboarding, useUserProfile } from './hooks/data-hooks';

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

  const { data: userProfile } = useUserProfile();
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
    if (userProfile && !userProfile.onboardingCompleted) {
        if (!userProfile.nativeLanguage || !userProfile.targetLanguage) {
             setStep('PROFILE_SETUP');
        } else {
            // This is a simplification. A real implementation would check
            // for journal entries, analyses, etc., to resume the flow.
            setStep('FIRST_JOURNAL'); 
        }
    } else {
      setStep('INACTIVE');
    }
  }, [userProfile]);

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