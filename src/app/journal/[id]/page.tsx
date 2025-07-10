import { AnalysisDisplay } from "@/components/AnalysisDisplay";
import { FeedbackCard } from "@/components/FeedbackCard";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";

const mockAnalysis = {
  content:
    "Yesterday I go to the park and seen many birds. It was very beautifully.",
  highlights: [
    { start: 9, end: 11, type: "grammar" as const }, // "go" should be "went"
    { start: 16, end: 20, type: "grammar" as const }, // "seen" should be "saw"
    { start: 44, end: 54, type: "vocabulary" as const }, // "very beautifully" could be "gorgeous"
    { start: 28, end: 32, type: "phrasing" as const }, // "many birds" could be "numerous bird species"
  ],
  status: "failed" as const,
  id: "mock-journal-id",
};

const mockFeedback = [
  {
    original: "go",
    suggestion: "went",
    explanation: "Use past tense for actions that happened yesterday",
    mistakeId: "1",
  },
  {
    original: "seen",
    suggestion: "saw",
    explanation: "Irregular past tense form of 'see' is 'saw'",
    mistakeId: "2",
  },
  {
    original: "very beautifully",
    suggestion: "gorgeous",
    explanation: "More concise and natural adjective",
    mistakeId: "3",
  },
];

export default function JournalAnalysisPage() {
  const retryAnalysisMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/journal/${mockAnalysis.id}/retry-analysis`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to retry analysis');
      }
      return response.json();
    },
  });
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Journal Entry Analysis</h1>
      {mockAnalysis.status === "failed" && (
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => retryAnalysisMutation.mutate()}
          disabled={retryAnalysisMutation.isPending}
        >
          {retryAnalysisMutation.isPending ? 'Retrying...' : 'Retry Analysis'}
        </Button>
      )}
      <AnalysisDisplay
        content={mockAnalysis.content}
        highlights={mockAnalysis.highlights}
      />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Detailed Feedback</h2>
        {mockFeedback.map((feedback, index) => (
          <FeedbackCard
            key={index}
            original={feedback.original}
            suggestion={feedback.suggestion}
            explanation={feedback.explanation}
            mistakeId={feedback.mistakeId}
          />
        ))}
      </div>
    </div>
  );
}
