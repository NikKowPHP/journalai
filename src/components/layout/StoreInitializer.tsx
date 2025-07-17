
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import {
  useUserProfile,
  useJournalHistory,
  useStudyDeck,
} from "@/lib/hooks/data";
import { useLanguageStore } from "@/lib/stores/language.store";

function StoreInitializer() {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const { step, determineCurrentStep, resetOnboarding } = useOnboardingStore();
  const { activeTargetLanguage, setActiveTargetLanguage } = useLanguageStore();

  // Auth state listener
  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => {
      unsubscribe();
    };
  }, [initializeAuth]);

  // Onboarding logic
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
  const { data: journals, isLoading: isJournalsLoading } = useJournalHistory();
  const { isLoading: isDeckLoading } = useStudyDeck();

  useEffect(() => {
    if (authLoading || isProfileLoading || isJournalsLoading || isDeckLoading)
      return;

    // This logic remains to set the active language
    if (user && userProfile && !activeTargetLanguage) {
      if (userProfile.defaultTargetLanguage) {
        setActiveTargetLanguage(userProfile.defaultTargetLanguage);
      } else if (userProfile.languageProfiles?.length > 0) {
        setActiveTargetLanguage(userProfile.languageProfiles[0].language);
      }
    }

    // Only run the determination logic if the onboarding flow isn't already active.
    if (
      user &&
      userProfile &&
      !userProfile.onboardingCompleted &&
      step === "INACTIVE"
    ) {
      determineCurrentStep({
        userProfile: userProfile,
        journals: journals || [],
      });
    } else if (
      user &&
      userProfile?.onboardingCompleted &&
      step !== "INACTIVE"
    ) {
      resetOnboarding();
    }
  }, [
    user,
    userProfile,
    journals,
    authLoading,
    isProfileLoading,
    isJournalsLoading,
    isDeckLoading,
    determineCurrentStep,
    step,
    resetOnboarding,
    activeTargetLanguage,
    setActiveTargetLanguage,
  ]);

  return null;
}

export default StoreInitializer;