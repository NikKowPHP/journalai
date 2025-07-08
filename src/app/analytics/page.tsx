import { ProficiencyChart } from "@/components/ProficiencyChart"
import { SubskillScores } from "@/components/SubskillScores"

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">My Analytics</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Proficiency Over Time</h2>
          <ProficiencyChart />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Skill Breakdown</h2>
          <SubskillScores />
        </div>
      </div>
    </div>
  );
}