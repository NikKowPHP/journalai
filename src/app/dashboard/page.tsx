
"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JournalHistoryList } from "@/components/JournalHistoryList";
import { SuggestedTopics } from "@/components/SuggestedTopics";
import {
  useUserProfile,
  useAnalyticsData,
  useGenerateTopics,
} from "@/lib/hooks/data";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSummary } from "@/components/DashboardSummary";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useSuggestedTopics } from "@/lib/hooks/data/useSuggestedTopics";
import { ProficiencyChart } from "@/components/ProficiencyChart";
import { SubskillScores } from "@/components/SubskillScores";
import { PricingTable } from "@/components/PricingTable";

export default function DashboardPage() {
  const { data: user, isLoading: isUserLoading } = useUserProfile();
  const { data: analytics, isLoading: isAnalyticsLoading } = useAnalyticsData();
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

  const skillBreakdown = analytics?.subskillScores
    ? Object.entries(analytics.subskillScores).map(([skill, score]) => ({
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        score: Number(score),
      }))
    : [];

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <LanguageSwitcher />
      </div>

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

          {user && ["PRO", "ADMIN"].includes(user.subscriptionTier) ? (
            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Proficiency Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProficiencyChart data={analytics.proficiencyOverTime} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Skill Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <SubskillScores data={skillBreakdown} />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Upgrade to Pro for Detailed Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <PricingTable />
              </CardContent>
            </Card>
          )}

          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <JournalHistoryList journals={mappedJournals} />
        </>
      )}

      <div className="space-y-4">
        <Button onClick={handleGenerateTopics} disabled={isLoadingTopics}>
          {isLoadingTopics ? "Generating..." : "Suggest New Topics"}
        </Button>
        <SuggestedTopics
          topics={suggestedTopics?.topics || []}
          isLoading={isLoadingTopics}
        />
        {!isLoadingTopics &&
          (!suggestedTopics ||
            !suggestedTopics.topics ||
            suggestedTopics.topics.length === 0) && (
            <p className="text-muted-foreground text-sm">
              No suggestions yet. Click 'Suggest New Topics' to get some ideas!
            </p>
          )}
      </div>
    </div>
  );
}