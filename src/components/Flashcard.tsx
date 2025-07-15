
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, XCircle } from "lucide-react";

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
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => handleReview(0)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Forgot
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => handleReview(3)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Good
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => handleReview(5)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Easy
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}