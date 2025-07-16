"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores/auth.store";
import {
  useOnboardingStore,
  type OnboardingStep,
} from "@/lib/stores/onboarding.store";
import {
  useUserProfile,
  useJournalHistory,
  useStudyDeck,
} from "@/lib/hooks/data";
import { useLanguageStore } from "@/lib/stores/language.store";

function StoreInitializer() {
  const { setUserAndLoading } = useAuthStore();
  const {
    step,
    onboardingJournalId,
    setStep: setOnboardingStep,
    setOnboardingJournalId,
  } = useOnboardingStore();
  const { activeTargetLanguage, setActiveTargetLanguage } = useLanguageStore();
  const initialized = useRef(false);
  const router = useRouter();

  // Auth state listener
  useEffect(() => {
    if (!initialized.current) {
      const supabase = createClient();
      supabase.auth.onAuthStateChange(async (event, session) => {
        setUserAndLoading(session?.user ?? null, false);
        if (event === "SIGNED_OUT") {
          router.push("/");
        }
      });
      initialized.current = true;
    }
  }, [setUserAndLoading, router]);

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

    // --- REFACTORED ONBOARDING LOGIC ---
    // Only calculate the starting step if the user needs onboarding AND the flow is not already active.
    if (
      user &&
      userProfile &&
      !userProfile.onboardingCompleted &&
      step === "INACTIVE"
    ) {
      const profileIsComplete = !!(
        userProfile.nativeLanguage && userProfile.defaultTargetLanguage
      );
      const hasJournals = journals && journals.length > 0;
      const hasSrsItems = (userProfile._count?.srsItems ?? 0) > 0;

      let nextStep: OnboardingStep = "INACTIVE"; // Default to INACTIVE

      if (!profileIsComplete) {
        nextStep = "PROFILE_SETUP";
      } else if (!hasJournals) {
        nextStep = "FIRST_JOURNAL";
      } else {
        const latestJournal = journals[0];
        if (latestJournal) {
          if (latestJournal.id !== onboardingJournalId) {
            setOnboardingJournalId(latestJournal.id);
          }
          if (!latestJournal.analysis) {
            nextStep = "VIEW_ANALYSIS";
          } else if (!hasSrsItems) {
            nextStep = "VIEW_ANALYSIS"; // User needs to create the first card
          } else {
            // This case should not happen for an un-onboarded user, but as a fallback:
            nextStep = "STUDY_INTRO";
          }
        }
      }

      // Only set the step if we determined a new starting point
      if (nextStep !== "INACTIVE") {
        setOnboardingStep(nextStep);
      }
      // Handle the case where the user is onboarded but the store state is stale
    } else if (
      user &&
      userProfile &&
      userProfile.onboardingCompleted &&
      step !== "INACTIVE"
    ) {
      setOnboardingStep("INACTIVE");
    }
  }, [
    user,
    userProfile,
    journals,
    authLoading,
    isProfileLoading,
    isJournalsLoading,
    isDeckLoading,
    setOnboardingStep,
    setOnboardingJournalId,
    activeTargetLanguage,
    setActiveTargetLanguage,
    step,
    onboardingJournalId,
  ]);

  return null;
}

export default StoreInitializer;