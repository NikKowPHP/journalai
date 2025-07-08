import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface FeedbackCardProps {
  original: string
  suggestion: string
  explanation: string
}

export function FeedbackCard({ original, suggestion, explanation }: FeedbackCardProps) {
  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Original Text</h3>
        <p className="text-sm line-through text-gray-600">{original}</p>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Suggested Correction</h3>
        <p className="text-sm text-green-600">{suggestion}</p>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Explanation</h3>
        <p className="text-sm text-gray-600">{explanation}</p>
      </div>
      
      <Button variant="outline" className="w-full">
        Add to Study Deck
      </Button>
    </Card>
  )
}