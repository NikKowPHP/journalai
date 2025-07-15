
"use client";
import React, { useState } from "react";
import { JournalEditor } from "@/components/JournalEditor";
import { JournalHistoryList } from "@/components/JournalHistoryList";
import {
  useGenerateTopics,
  useJournalHistory,
  useUserProfile,
} from "@/lib/hooks/data";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SuggestedTopics } from "@/components/SuggestedTopics";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useSuggestedTopics } from "@/lib/hooks/data/useSuggestedTopics";

function JournalPageSkeleton() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <Skeleton className="h-8 w-1/3" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

export default function JournalPage() {
  const searchParams = useSearchParams();
  const topicFromQuery = searchParams.get("topic");

  const generateTopicsMutation = useGenerateTopics();
  const {
    data: suggestedTopics,
    isLoading: isTopicsLoading,
    isFetching,
  } = useSuggestedTopics();

  const handleGenerateTopics = () => {
    generateTopicsMutation.mutate();
  };
  const isLoadingTopics =
    isTopicsLoading || isFetching || generateTopicsMutation.isPending;

  const {
    data: journals,
    isLoading: isJournalsLoading,
    error: journalsError,
  } = useJournalHistory();

  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();

  const isLoading = isJournalsLoading || isProfileLoading;
  const error = journalsError;

  if (isLoading) return <JournalPageSkeleton />;
  if (error)
    return <div>Error loading journals: {(error as Error).message}</div>;

  const mappedJournals =
    journals?.map((j: any) => ({
      id: j.id,
      title: j.topic.title,
      snippet: j.content.substring(0, 100) + "...",
      date: new Date(j.createdAt).toLocaleDateString(),
    })) || [];

  const onboardingCompleted = !!userProfile?.onboardingCompleted;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Journal</h1>
        <LanguageSwitcher />
      </div>
      <div className="space-y-4">
        <Button
          onClick={handleGenerateTopics}
          disabled={isLoadingTopics}
        >
          {isLoadingTopics ? "Generating..." : "Suggest New Topics"}
        </Button>
        <SuggestedTopics
          topics={suggestedTopics?.topics || []}
          isLoading={isLoadingTopics}
        />
        {!isLoadingTopics &&
          (!suggestedTopics || !suggestedTopics.topics || suggestedTopics.topics.length === 0) && (
            <p className="text-muted-foreground text-sm">
              No suggestions yet. Click 'Suggest New Topics' to get some ideas!
            </p>
          )}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <JournalHistoryList journals={mappedJournals} />
        <div className="relative">
          <div
            className={!onboardingCompleted ? "blur-sm pointer-events-none" : ""}
          >
            <JournalEditor topicTitle={topicFromQuery || undefined} />
          </div>
          {!onboardingCompleted && (
            <div className="absolute inset-0 bg-transparent z-10 flex flex-col items-center justify-center p-4">
              <Card className="text-center w-full max-w-sm bg-background/95 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle>Complete Your Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Please complete your profile setup to begin journaling.
                  </p>
                  <Button asChild>
                    <Link href="/settings">Go to Settings</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}