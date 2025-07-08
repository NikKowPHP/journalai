import { ProficiencyChart } from "@/components/ProficiencyChart"
import { SubskillScores } from "@/components/SubskillScores"

const mockProficiencyData = [
  { date: '2023-01', score: 45 },
  { date: '2023-02', score: 52 },
  { date: '2023-03', score: 60 },
  { date: '2023-04', score: 58 },
  { date: '2023-05', score: 65 },
  { date: '2023-06', score: 70 },
]

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">My Analytics</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Proficiency Over Time</h2>
          <ProficiencyChart data={mockProficiencyData} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Skill Breakdown</h2>
          <SubskillScores />
        </div>
      </div>
    </div>
  );
}