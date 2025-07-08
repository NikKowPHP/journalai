import { StudySession } from "@/components/StudySession"

const mockDeck = [
  {
    front: "Bonjour",
    back: "Hello",
    context: "French greeting"
  },
  {
    front: "Merci",
    back: "Thank you",
    context: "French expression of gratitude"
  },
  {
    front: "Au revoir",
    back: "Goodbye",
    context: "French farewell"
  }
]

export default function StudyPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Study Deck (SRS)</h1>
      <StudySession cards={mockDeck} />
    </div>
  );
}