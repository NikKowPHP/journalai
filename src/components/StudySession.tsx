
"use client";
import { useState, useEffect } from "react";
import { Flashcard } from "@/components/Flashcard";
import { useReviewSrsItem } from "@/lib/hooks/data";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

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
  const [sessionCards, setSessionCards] = useState<StudyCard[]>([]);
  const [initialCardCount, setInitialCardCount] = useState(0);

  useEffect(() => {
    setSessionCards(cards);
    if (cards.length > 0) {
      setInitialCardCount(cards.length);
    }
  }, [cards]);

  const queryClient = useQueryClient();
  const reviewMutation = useReviewSrsItem();
  const currentCard = sessionCards[0];

  const handleReview = (quality: number) => {
    if (!currentCard) return;

    // Perform the mutation in the background
    reviewMutation.mutate({ srsItemId: currentCard.id, quality });

    // Instantly remove the card from the local session deck
    setSessionCards((prevCards) => prevCards.slice(1));
  };

  const handleStudyMore = () => {
    queryClient.invalidateQueries({ queryKey: ["studyDeck"] });
  };

  return (
    <div className="space-y-6">
      {currentCard ? (
        <>
          <div className="text-xl font-semibold text-muted-foreground">
            Card {initialCardCount - sessionCards.length + 1} of{" "}
            {initialCardCount}
          </div>
          <div key={currentCard.id} className="animate-in fade-in duration-300">
            <Flashcard
              frontContent={currentCard.frontContent}
              backContent={currentCard.backContent}
              context={currentCard.context}
              onReview={handleReview}
              onOnboardingReview={onOnboardingReview}
            />
          </div>
        </>
      ) : (
        <div className="text-center p-6 border rounded-lg bg-muted/20">
          <h2 className="text-xl font-semibold mb-2">Session Complete!</h2>
          <p className="text-gray-600 mb-4">
            You reviewed {initialCardCount} cards. Great job!
          </p>
          <Button onClick={handleStudyMore}>Study More Cards</Button>
        </div>
      )}
    </div>
  );
}