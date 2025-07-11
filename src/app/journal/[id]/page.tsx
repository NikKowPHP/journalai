"use client";
import React from "react";
import { AnalysisDisplay } from "@/components/AnalysisDisplay";
import { FeedbackCard } from "@/components/FeedbackCard";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useOnboarding } from "@/lib/onboarding-context";
import { Skeleton } from "@/components/ui/skeleton";

const GuidedPopover = ({ children, title, description }: { children: React.ReactNode, title: string, description: string }) => (
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
  const { step, setStep } = useOnboarding();
  const isTourActive = step === 'VIEW_ANALYSIS';

  const { data: journal, isLoading, error } = useQuery({
    queryKey: ['journal', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/journal/${id}`);
      if (!res.ok) throw new Error("Failed to fetch journal entry");
      return res.json();
    },
    enabled: !!id,
  });

  const retryAnalysisMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/journal/${id}/retry-analysis`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to retry analysis');
      }
      return response.json();
    },
  });

  if (isLoading) {
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
  
  const analysisFailed = !journal.analysis && journal.content;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Journal Entry Analysis</h1>
      
      {analysisFailed && (
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => retryAnalysisMutation.mutate()}
          disabled={retryAnalysisMutation.isPending}
        >
          {retryAnalysisMutation.isPending ? 'Retrying...' : 'Retry Analysis'}
        </Button>
      )}

      {journal.analysis ? (
        <>
         <div className="w-full lg:w-2/3 mx-auto">
          {isTourActive ? (
            <GuidedPopover title="Review Your Feedback" description="We've highlighted areas for improvement. The colors show the type of feedback.">
              <AnalysisDisplay
                content={journal.content}
                highlights={journal.analysis.feedbackJson.highlights || []}
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
            {journal.analysis.mistakes.map((feedback: any, index: number) => (
              <div key={feedback.id} className="w-full lg:w-2/3 mx-auto">
                {isTourActive && index === 0 ? (
                  <GuidedPopover title="Create a Flashcard" description="Click 'Add to Study Deck' to save this correction for later practice.">
                    <FeedbackCard
                      original={feedback.originalText}
                      suggestion={feedback.correctedText}
                      explanation={feedback.explanation}
                      mistakeId={feedback.id}
                      onOnboardingAddToDeck={() => setStep('CREATE_DECK')}
                    />
                  </GuidedPopover>
                ) : (
                  <FeedbackCard
                    original={feedback.originalText}
                    suggestion={feedback.correctedText}
                    explanation={feedback.explanation}
                    mistakeId={feedback.id}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
         <div className="prose max-w-none p-4 border rounded-lg bg-background">
          <p>{journal.content}</p>
         </div>
      )}
    </div>
  );
}