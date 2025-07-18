
"use client";
import { StudySession } from "@/components/StudySession";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudyDeck, useUserProfile } from "@/lib/hooks/data";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguageStore } from "@/lib/stores/language.store";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { GuidedPopover } from "@/components/ui/GuidedPopover";

export default function StudyPage() {
  const { step, setStep } = useOnboardingStore();
  const isTourActive = step === "STUDY_INTRO";
  const { activeTargetLanguage } = useLanguageStore();

  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
  const {
    data: studyDeck,
    isLoading: isDeckLoading,
    error,
  } = useStudyDeck();

  const handleFirstReview = () => {
    if (isTourActive) {
      setStep("COMPLETED");
    }
  };

  const isLoading = isProfileLoading || isDeckLoading;

  if (isLoading)
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  if (error)
    return <div>Error loading study deck: {(error as Error).message}</div>;

  const studySession = (
    <StudySession
      cards={studyDeck || []}
      nativeLanguage={userProfile?.nativeLanguage}
      targetLanguage={activeTargetLanguage}
      onOnboardingReview={handleFirstReview}
    />
  );

  const getLanguageName = (value: string) => {
    return SUPPORTED_LANGUAGES.find((l) => l.value === value)?.name || value;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Study Deck (SRS)</h1>
        <LanguageSwitcher />
      </div>

      {!activeTargetLanguage ? (
        <p>Please select a language to start studying.</p>
      ) : isTourActive && studyDeck && studyDeck.length > 0 ? (
        <GuidedPopover
          isOpen={isTourActive}
          onDismiss={() => {
            /* This popover is part of the tour and should not be dismissible by the user. */
          }}
          placement="bottom"
          title="Practice Makes Perfect"
          description="Flip the card, then rate how well you remembered it to update your study schedule."
        >
          {studySession}
        </GuidedPopover>
      ) : studyDeck && studyDeck.length > 0 ? (
        studySession
      ) : (
        <p>
          No cards are due for review in {getLanguageName(activeTargetLanguage)}
          . Great job!
        </p>
      )}
    </div>
  );
}