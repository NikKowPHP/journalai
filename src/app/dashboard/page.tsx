"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JournalHistoryList } from "@/components/JournalHistoryList";
import { SuggestedTopics } from "@/components/SuggestedTopics";
import {
  useUserProfile,
  useAnalyticsData,
  useGenerateTopics,
} from "@/lib/hooks/data-hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSummary } from "@/components/DashboardSummary";

export default function DashboardPage() {
  const [generatedTopics, setGeneratedTopics] = useState<string[]>([]);

  const { data: user, isLoading: isUserLoading } = useUserProfile();
  const { data: analytics, isLoading: isAnalyticsLoading } = useAnalyticsData();
  const generateTopicsMutation = useGenerateTopics();

  const handleGenerateTopics = () => {
    generateTopicsMutation.mutate(undefined, {
      onSuccess: (data) => {
        if (data.topics) {
          setGeneratedTopics(data.topics);
        }
      },
    });
  };

  const isLoading =
    isUserLoading || (user && user.onboardingCompleted && isAnalyticsLoading);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (user && !user.onboardingCompleted) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Welcome to LinguaScribe!</h1>
        <p>Please complete the setup to continue.</p>
      </div>
    );
  }

  const hasEntries = analytics && analytics.totalEntries > 0;

  const mappedJournals =
    analytics?.recentJournals?.map((j: any) => ({
      id: j.id,
      title: j.topic.title,
      snippet: j.content.substring(0, 100) + "...",
      date: new Date(j.createdAt).toLocaleDateString(),
    })) || [];

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {!hasEntries ? (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>Start Your Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">
              You haven't written any journal entries yet. Write your first one
              to get personalized feedback!
            </p>
            <Button asChild size="lg">
              <Link href="/journal">Write First Entry</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <DashboardSummary
            totalEntries={analytics.totalEntries}
            averageScore={analytics.averageScore}
            weakestSkill={analytics.weakestSkill}
          />

          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <JournalHistoryList journals={mappedJournals} />
        </>
      )}

      <div className="space-y-4">
        <Button
          onClick={handleGenerateTopics}
          disabled={generateTopicsMutation.isPending}
        >
          {generateTopicsMutation.isPending
            ? "Generating..."
            : "Suggest New Topics"}
        </Button>
        {generatedTopics.length > 0 && (
          <SuggestedTopics topics={generatedTopics} />
        )}
      </div>
    </div>
  );
}