import { AnalysisDisplay } from "@/components/AnalysisDisplay"

const mockAnalysis = {
  content: "Yesterday I go to the park and seen many birds. It was very beautifully.",
  highlights: [
    { start: 9, end: 11, type: "grammar" as const }, // "go" should be "went"
    { start: 16, end: 20, type: "grammar" as const }, // "seen" should be "saw"
    { start: 44, end: 54, type: "vocabulary" as const }, // "very beautifully" could be "gorgeous"
    { start: 28, end: 32, type: "phrasing" as const } // "many birds" could be "numerous bird species"
  ]
}

export default function JournalAnalysisPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Journal Entry Analysis</h1>
      <AnalysisDisplay 
        content={mockAnalysis.content}
        highlights={mockAnalysis.highlights}
      />
    </div>
  )
}