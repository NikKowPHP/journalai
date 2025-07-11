"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JournalHistoryList } from "@/components/JournalHistoryList";
import { SuggestedTopics } from "@/components/SuggestedTopics";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile } from "@/lib/user";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSummary } from "@/components/DashboardSummary";

export default function DashboardPage() {
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const [generatedTopics, setGeneratedTopics] = useState<string[]>([]);

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", authUser?.id],
    queryFn: () => getUserProfile(authUser?.id),
    enabled: !!authUser?.id,
  });

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => fetch("/api/analytics").then((res) => res.json()),
    enabled: !!user && user.onboardingCompleted,
  });

  const generateTopicsMutation = useMutation({
    mutationFn: () =>
      fetch("/api/user/generate-topics").then((res) => res.json()),
    onSuccess: (data) => {
      if (data.topics) {
        setGeneratedTopics(data.topics);
      }
    },
  });

  const isLoading = isUserLoading || (user?.onboardingCompleted && isAnalyticsLoading);

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
          onClick={() => generateTopicsMutation.mutate()}
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