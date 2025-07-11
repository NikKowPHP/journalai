"use client";
import React from "react";
import { JournalEditor } from "@/components/JournalEditor";
import { JournalHistoryList } from "@/components/JournalHistoryList";
import { useJournalHistory, useUserProfile } from "@/lib/hooks/data-hooks";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      <h1 className="text-2xl font-bold">My Journal</h1>
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