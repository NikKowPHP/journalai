import { ProficiencyChart } from "@/components/ProficiencyChart";
import { SubskillScores } from "@/components/SubskillScores";
import { useQuery } from "@tanstack/react-query";

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading analytics...</div>;
  if (error) return <div>Error loading analytics: {error.message}</div>;

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
          <SubskillScores data={data.skillBreakdown} />
        </div>
      </div>
    </div>
  );
}
