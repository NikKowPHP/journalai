import { useState } from 'react'
import { Flashcard } from "@/components/Flashcard"

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

export function StudySession() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const currentCard = mockDeck[currentCardIndex]

  const handleNextCard = () => {
    if (currentCardIndex < mockDeck.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
    }
  }

  return (
    <div className="space-y-6">
      {currentCardIndex < mockDeck.length ? (
        <>
          <div className="text-xl font-semibold">
            Card {currentCardIndex + 1} of {mockDeck.length}
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