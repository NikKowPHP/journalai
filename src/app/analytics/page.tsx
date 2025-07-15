
"use client";
import { ProficiencyChart } from "@/components/ProficiencyChart";
import { SubskillScores } from "@/components/SubskillScores";
import { PricingTable } from "@/components/PricingTable";
import { useAnalyticsData, useUserProfile } from "@/lib/hooks/data";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsPage() {
  const { data: userData, isLoading: userLoading, error: userError } = useUserProfile();
  const { data, isLoading, error } = useAnalyticsData();

  if (userLoading || isLoading) {
    return (
        <div className="container mx-auto p-6 space-y-8">
            <Skeleton className="h-10 w-1/3" />

            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4 p-6 border rounded-lg bg-background">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="space-y-4 p-6 border rounded-lg bg-background">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (userError || error) return <div>Error: {(userError as Error)?.message || (error as Error)?.message}</div>;

  if (!userData || !["PRO", "ADMIN"].includes(userData.subscriptionTier)) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold">Analytics (Pro Feature)</h1>
        <div className="p-6 border rounded-lg bg-background">
          <h2 className="text-xl font-semibold mb-4">Upgrade to Pro to access advanced analytics</h2>
          <PricingTable />
        </div>
      </div>
    );
  }

  // The API returns subskillScores as an object { grammar, phrasing, vocabulary }
  // SubskillScores component expects an array of { skill, score }
  const skillBreakdown = data?.subskillScores ? Object.entries(data.subskillScores).map(([skill, score]) => ({
    skill: skill.charAt(0).toUpperCase() + skill.slice(1),
    score: Number(score),
  })) : [];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">My Analytics</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4 p-6 border rounded-lg bg-background">
          <h2 className="text-xl font-semibold">Proficiency Over Time</h2>
          <ProficiencyChart data={data.proficiencyOverTime} />
        </div>

        <div className="space-y-4 p-6 border rounded-lg bg-background">
          <h2 className="text-xl font-semibold">Skill Breakdown</h2>
          <SubskillScores data={skillBreakdown} />
        </div>
      </div>
    </div>
  );
}