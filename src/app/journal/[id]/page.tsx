
"use client";
import React, { useEffect } from "react";
import { AnalysisDisplay } from "@/components/AnalysisDisplay";
import { FeedbackCard } from "@/components/FeedbackCard";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useJournalEntry,
  useRetryJournalAnalysis,
  useAnalyzeJournal,
  useStudyDeck,
} from "@/lib/hooks/data-hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Spinner from "@/components/ui/Spinner";

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

export default function JournalAnalysisPage() {
  const params = useParams();
  const id = params.id as string;
  const { step, setStep } = useOnboardingStore();

  const completeOnboarding = () => {
    setStep("COMPLETED");
  };

  const isTourActive = step === "VIEW_ANALYSIS";

  const { data: journal, isLoading, error } = useJournalEntry(id);
  const { data: studyDeck, isLoading: isStudyDeckLoading } = useStudyDeck();
  const retryAnalysisMutation = useRetryJournalAnalysis();
  const analyzeJournalMutation = useAnalyzeJournal();

  useEffect(() => {
    if (journal && !journal.analysis && !analyzeJournalMutation.isPending) {
      analyzeJournalMutation.mutate(id);
    }
  }, [journal, analyzeJournalMutation, id]);

  const isPageLoading = isLoading || isStudyDeckLoading;

  if (isPageLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error) return <div>Error: {(error as Error).message}</div>;
  if (!journal) return <div>Journal entry not found.</div>;

  const isAnalysisPending =
    !journal.analysis && (analyzeJournalMutation.isPending || isLoading);
  const analysisFailed = !journal.analysis && !isAnalysisPending;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Journal Entry Analysis</h1>

      {isAnalysisPending ? (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>Analysis in Progress...</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">
              Your entry is being analyzed. The page will update automatically.
            </p>
          </CardContent>
        </Card>
      ) : analysisFailed ? (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>Analysis Failed</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground">
              We couldn't analyze this entry. Please try again.
            </p>
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => retryAnalysisMutation.mutate(id)}
              disabled={retryAnalysisMutation.isPending}
            >
              {retryAnalysisMutation.isPending
                ? "Retrying..."
                : "Retry Analysis"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {journal.analysis ? (
            <>
              <div className="w-full lg:w-2/3 mx-auto">
                {isTourActive ? (
                  <GuidedPopover
                    title="Review Your Feedback"
                    description="We've highlighted areas for improvement. The colors show the type of feedback."
                  >
                    <AnalysisDisplay
                      content={journal.content}
                      highlights={
                        journal.analysis.feedbackJson.highlights || []
                      }
                    />
                  </GuidedPopover>
                ) : (
                  <AnalysisDisplay
                    content={journal.content}
                    highlights={journal.analysis.feedbackJson.highlights || []}
                  />
                )}
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Detailed Feedback</h2>
                {journal.analysis.mistakes &&
                journal.analysis.mistakes.length > 0 ? (
                  journal.analysis.mistakes.map(
                    (feedback: any, index: number) => {
                      const isAlreadyInDeck =
                        studyDeck?.some(
                          (item: any) => item.mistakeId === feedback.id,
                        ) ?? false;
                      return (
                        <div
                          key={feedback.id}
                          className="w-full lg:w-2/3 mx-auto"
                        >
                          {isTourActive && index === 0 ? (
                            <GuidedPopover
                              title="Create a Flashcard"
                              description="Click 'Add to Study Deck' to save this correction for later practice."
                            >
                              <FeedbackCard
                                original={feedback.originalText}
                                suggestion={feedback.correctedText}
                                explanation={feedback.explanation}
                                mistakeId={feedback.id}
                                onOnboardingAddToDeck={() =>
                                  setStep("CREATE_DECK")
                                }
                                isAlreadyInDeck={isAlreadyInDeck}
                              />
                            </GuidedPopover>
                          ) : (
                            <FeedbackCard
                              original={feedback.originalText}
                              suggestion={feedback.correctedText}
                              explanation={feedback.explanation}
                              mistakeId={feedback.id}
                              isAlreadyInDeck={isAlreadyInDeck}
                            />
                          )}
                        </div>
                      );
                    },
                  )
                ) : (
                  <div className="w-full lg:w-2/3 mx-auto">
                    <Card className="p-6 text-center">
                      <CardHeader>
                        <CardTitle>Great Job!</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Our AI didn't find any specific mistakes to correct in
                          this entry. You're on the right track!
                        </p>
                        {isTourActive && (
                          <Button
                            onClick={completeOnboarding}
                            className="mt-4"
                          >
                            Continue Onboarding
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="prose max-w-none p-4 border rounded-lg bg-background">
              <p>{journal.content}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}