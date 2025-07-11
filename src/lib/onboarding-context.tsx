'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from './user';

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
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const { user: authUser, loading: authLoading } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('INACTIVE');

  const { data: userProfile } = useQuery({
    queryKey: ['user', authUser?.id],
    queryFn: () => getUserProfile(authUser?.id),
    enabled: !!authUser && !authLoading,
  });

  useEffect(() => {
    if (userProfile && !userProfile.onboardingCompleted) {
        if (!userProfile.nativeLanguage || !userProfile.targetLanguage) {
             setStep('PROFILE_SETUP');
        } else {
            // This is a simplification for now. The subsequent steps will need
            // to check the user's progress (e.g., if they have a journal entry, if it has analysis, etc.)
            // to determine the correct starting step if they leave and come back.
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