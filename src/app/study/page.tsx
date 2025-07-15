
"use client";
import { StudySession } from "@/components/StudySession";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudyDeck } from "@/lib/hooks/data";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguageStore } from "@/lib/stores/language.store";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

const GuidedPopover = ({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="relative">
    <div className="absolute -top-4 -left-4 -right-4 -bottom-4 border-2 border-primary border-dashed rounded-xl z-10 pointer-events-none animate-in fade-in duration-500" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-background p-3 rounded-lg shadow-2xl border z-20">
      <h4 className="font-bold text-sm">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    {children}
  </div>
);

export default function StudyPage() {
  const { step, setStep } = useOnboardingStore();
  const isTourActive = step === "STUDY_INTRO";
  const { activeTargetLanguage } = useLanguageStore();

  const { data: studyDeck, isLoading, error } = useStudyDeck();

  const handleFirstReview = () => {
    if (isTourActive) {
      setStep("COMPLETED");
    }
  };

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
    <StudySession cards={studyDeck} onOnboardingReview={handleFirstReview} />
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
      ) : isTourActive && studyDeck?.length > 0 ? (
        <GuidedPopover
          title="Practice Makes Perfect"
          description="Flip the card, then rate how well you remembered it to update your study schedule."
        >
          {studySession}
        </GuidedPopover>
      ) : studyDeck?.length > 0 ? (
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