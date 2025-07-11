import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * An interactive flashcard component for spaced repetition study.
 * @param {object} props - The component props.
 * @param {string} props.frontContent - The content displayed on the card's front.
 * @param {string} props.backContent - The content displayed on the card's back.
 * @param {string} [props.context] - Optional contextual information shown below back content.
 * @returns {React.ReactElement} A flipable card with study controls.
 */
interface FlashcardProps {
  frontContent: string;
  backContent: string;
  context?: string;
  onReview?: (quality: number) => void;
  onOnboardingReview?: () => void;
}

export function Flashcard({
  frontContent,
  backContent,
  context,
  onReview,
  onOnboardingReview,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [onboardingReviewed, setOnboardingReviewed] = useState(false);

  const handleReview = (quality: number) => {
    onReview?.(quality);
    if (onOnboardingReview && !onboardingReviewed) {
      onOnboardingReview();
      setOnboardingReviewed(true);
    }
    setIsFlipped(false);
  };

  return (
    <Card className="p-6 space-y-6 bg-gradient-to-br from-background to-muted/20">
      {!isFlipped ? (
        <div className="space-y-4">
          <div className="text-lg font-medium text-center p-4 border-b">
            {frontContent}
          </div>
          <Button onClick={() => setIsFlipped(true)} className="w-full">
            Flip Card
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-lg font-medium text-center p-4 border-b bg-accent/20">
            {backContent}
          </div>
          {context && <div className="text-sm text-gray-600">{context}</div>}
          <div className="flex gap-2">
            <Button
              variant="destructive"
              className="flex-1 hover:bg-destructive/90"
              onClick={() => handleReview(0)}
            >
              Forgot ❌
            </Button>
            <Button
              variant="default"
              className="flex-1 hover:bg-primary/90 bg-blue-600"
              onClick={() => handleReview(3)}
            >
              Good ✔️
            </Button>
            <Button
              variant="secondary"
              className="flex-1 hover:bg-secondary/90 bg-green-600 text-white"
              onClick={() => handleReview(5)}
            >
              Easy 💡
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}