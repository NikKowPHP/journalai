import { useState } from 'react'
import { Flashcard } from "@/components/Flashcard"

interface StudyCard {
  front: string
  back: string
  context: string
}

interface StudySessionProps {
  cards: StudyCard[]
}

export function StudySession({ cards }: StudySessionProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const currentCard = cards[currentCardIndex]

  const handleNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
    }
  }

  return (
    <div className="space-y-6">
      {currentCardIndex < cards.length ? (
        <>
          <div className="text-xl font-semibold">
            Card {currentCardIndex + 1} of {cards.length}
          </div>
          <Flashcard
            frontContent={currentCard.front}
            backContent={currentCard.back}
            context={currentCard.context}
          />
        </>
      ) : (
        <div className="text-center p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Session Complete!</h2>
          <p className="text-gray-600">You've reviewed all cards in this deck.</p>
        </div>
      )}
    </div>
  )
}