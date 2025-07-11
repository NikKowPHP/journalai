"use client";
import { useState } from "react";
import { Flashcard } from "@/components/Flashcard";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Manages a study session with a deck of flashcards, tracking progress through the deck.
 * @param {object} props - The component props.
 * @param {Array} props.cards - The array of cards to study, each containing:
 * @param {string} props.cards[].id - The card's unique identifier.
 * @param {string} props.cards[].front - The front side content of the card.
 * @param {string} props.cards[].back - The back side content of the card.
 * @param {string} props.cards[].context - Additional context for the back content.
 * @returns {React.ReactElement} A study session interface with progress tracking.
 */
interface StudyCard {
  id: string;
  frontContent: string;
  backContent: string;
  context: string;
}

interface StudySessionProps {
  cards: StudyCard[];
  onOnboardingReview?: () => void;
}

export function StudySession({ cards, onOnboardingReview }: StudySessionProps) {
  const queryClient = useQueryClient();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const currentCard = cards[currentCardIndex];

  const reviewMutation = useMutation({
    mutationFn: (quality: number) =>
      fetch("/api/srs/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          srsItemId: currentCard.id,
          quality,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studyDeck"] });
    },
  });

  const handleReview = (quality: number) => {
    reviewMutation.mutate(quality);
    handleNextCard();
  };

  const handleNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  return (
    <div className="space-y-6">
      {currentCardIndex < cards.length ? (
        <>
          <div className="text-xl font-semibold text-muted-foreground">
            Card {currentCardIndex + 1} of {cards.length}
          </div>
          <Flashcard
            frontContent={currentCard.frontContent}
            backContent={currentCard.backContent}
            context={currentCard.context}
            onReview={handleReview}
            onOnboardingReview={onOnboardingReview}
          />
        </>
      ) : (
        <div className="text-center p-6 border rounded-lg bg-muted/20">
          <h2 className="text-xl font-semibold mb-2">Session Complete!</h2>
          <p className="text-gray-600">
            You've reviewed all cards in this deck.
          </p>
        </div>
      )}
    </div>
  );
}