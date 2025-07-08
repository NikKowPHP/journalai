import { ProficiencyChart } from "@/components/ProficiencyChart";
import { SubskillScores } from "@/components/SubskillScores";

const mockProficiencyData = [
  { date: "2023-01", score: 45 },
  { date: "2023-02", score: 52 },
  { date: "2023-03", score: 60 },
  { date: "2023-04", score: 58 },
  { date: "2023-05", score: 65 },
  { date: "2023-06", score: 70 },
];

const mockSkillData = [
  { skill: "Grammar", score: 75 },
  { skill: "Vocabulary", score: 85 },
  { skill: "Phrasing", score: 65 },
  { skill: "Style", score: 70 },
];

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">My Analytics</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4 p-6 border rounded-lg bg-background">
          <h2 className="text-xl font-semibold">Proficiency Over Time</h2>
          <ProficiencyChart data={mockProficiencyData} />
        </div>

        <div className="space-y-4 p-6 border rounded-lg bg-background">
          <h2 className="text-xl font-semibold">Skill Breakdown</h2>
          <SubskillScores data={mockSkillData} />
        </div>
      </div>
    </div>
  );
}
