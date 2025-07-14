'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useOnboardingStore } from '@/lib/stores/onboarding.store';
import { useUserProfile, useJournalHistory } from '@/lib/hooks/data-hooks';

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

  useEffect(() => {
    if (authLoading || isProfileLoading || isJournalsLoading) return;
    
    if (user && userProfile && !userProfile.onboardingCompleted) {
      const isProfileIncomplete = !userProfile.nativeLanguage || !userProfile.targetLanguage;
      if (isProfileIncomplete) {
        setOnboardingStep('PROFILE_SETUP');
        return;
      }
      if (!journals || journals.length === 0) {
        setOnboardingStep('FIRST_JOURNAL');
        return;
      }
      const latestJournal = journals[0];
      if (latestJournal && !latestJournal.analysis) {
        setOnboardingJournalId(latestJournal.id);
        setOnboardingStep('AWAITING_ANALYSIS');
      } else if (latestJournal && latestJournal.analysis) {
        setOnboardingJournalId(latestJournal.id);
        setOnboardingStep('VIEW_ANALYSIS');
      }
    } else {
      setOnboardingStep('INACTIVE');
    }
  }, [user, userProfile, journals, authLoading, isProfileLoading, isJournalsLoading, setOnboardingStep, setOnboardingJournalId]);

  return null;
}

export default StoreInitializer;