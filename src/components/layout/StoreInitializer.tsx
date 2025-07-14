// src/components/layout/StoreInitializer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useOnboardingStore } from '@/lib/stores/onboarding.store';
import { useUserProfile, useJournalHistory, useStudyDeck, useCompleteOnboarding } from '@/lib/hooks/data-hooks';

function StoreInitializer() {
  const { setUserAndLoading } = useAuthStore();
  const setOnboardingStep = useOnboardingStore(state => state.setStep);
  const setOnboardingJournalId = useOnboardingStore(state => state.setOnboardingJournalId);
  const initialized = useRef(false);
  const router = useRouter();

  // Auth state listener
  useEffect(() => {
    if (!initialized.current) {
      const supabase = createClient();
      supabase.auth.onAuthStateChange(async (event, session) => {
        setUserAndLoading(session?.user ?? null, false);
        if(event === 'SIGNED_OUT') {
            router.push('/');
        }
      });
      initialized.current = true;
    }
  }, [setUserAndLoading, router]);
  
  // Onboarding logic
  const user = useAuthStore(state => state.user);
  const authLoading = useAuthStore(state => state.loading);
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
  const { data: journals, isLoading: isJournalsLoading } = useJournalHistory();
  const { data: studyDeck, isLoading: isDeckLoading } = useStudyDeck();
  const completeOnboardingMutation = useCompleteOnboarding();

  useEffect(() => {
  
    if (authLoading || isProfileLoading || isJournalsLoading || isDeckLoading) return;
    
    if (user && userProfile && !userProfile.onboardingCompleted) {

      const profileIsComplete = !!(userProfile.nativeLanguage && userProfile.targetLanguage);
      const hasJournals = journals && journals.length > 0;
      const hasSrsItems = (userProfile._count?.srsItems ?? 0) > 0;

      // **THE FIX**: Self-healing logic for onboarding completion.
      // If a user has done all the steps but the flag isn't set, this completes it for them.
      if (profileIsComplete && hasJournals && hasSrsItems) {
        if (!completeOnboardingMutation.isPending) {
          completeOnboardingMutation.mutate();
        }
        // Exit early and let the component re-render with the updated profile.
        return;
      }
      
      // If self-healing didn't trigger, proceed with the normal state machine.
      if (!profileIsComplete) {
        setOnboardingStep('PROFILE_SETUP');
        return;
      }

      if (!hasJournals) {
        setOnboardingStep('FIRST_JOURNAL');
        return;
      }

      const latestJournal = journals[0];

      if (latestJournal && !latestJournal.analysis) {
        setOnboardingJournalId(latestJournal.id);
        setOnboardingStep('AWAITING_ANALYSIS');
        return;
      }
      
      if (latestJournal && latestJournal.analysis) {
        setOnboardingJournalId(latestJournal.id);
        
        if (!hasSrsItems) {
          setOnboardingStep('VIEW_ANALYSIS');
          return;
        } 
        else {
          setOnboardingStep('STUDY_INTRO');
          return;
        }
      }

    } else {
      setOnboardingStep('INACTIVE');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
      user, 
      userProfile, 
      journals, 
      studyDeck,
      authLoading, 
      isProfileLoading, 
      isJournalsLoading, 
      isDeckLoading,
      setOnboardingStep, 
      setOnboardingJournalId,
      completeOnboardingMutation
  ]);

  return null;
}

export default StoreInitializer;