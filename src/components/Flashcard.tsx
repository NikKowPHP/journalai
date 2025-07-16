
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, XCircle } from "lucide-react";
import { TTSButton } from "./ui/TTSButton";
import { useFeatureFlag } from "@/lib/hooks/useFeatureFlag";
import { GuidedPopover } from "./ui/GuidedPopover";

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
  targetLanguage?: string;
  onReview?: (quality: number) => void;
  onOnboardingReview?: () => void;
}

export function Flashcard({
  frontContent,
  backContent,
  context,
  targetLanguage,
  onReview,
  onOnboardingReview,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [onboardingReviewed, setOnboardingReviewed] = useState(false);

  const [isContextNew, markContextAsSeen] = useFeatureFlag("flashcard_context");
  const [isTTSNew, markTTSAsSeen] = useFeatureFlag("flashcard_tts");
  const [showContextPopover, setShowContextPopover] = useState(false);
  const [showTTSPopover, setShowTTSPopover] = useState(false);

  useEffect(() => {
    if (context && isContextNew && !isFlipped) {
      // Show popover only when card is flipped and context is new
      setShowContextPopover(true);
    }
  }, [context, isContextNew, isFlipped]);

  const handleFlip = () => {
    setIsFlipped(true);
    if (isTTSNew) {
      setShowTTSPopover(true);
    }
  };

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
          <Button onClick={handleFlip} className="w-full">
            Flip Card
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center p-4 border-b bg-accent/20">
            <p className="text-lg font-medium text-center">{backContent}</p>
            <GuidedPopover
              isOpen={showTTSPopover}
              onDismiss={() => {
                setShowTTSPopover(false);
                markTTSAsSeen();
              }}
              title="Hear it Aloud"
              description="Click here to listen to the pronunciation of the text."
            >
              {targetLanguage && (
                <TTSButton text={backContent} lang={targetLanguage} />
              )}
            </GuidedPopover>
          </div>
          {context && (
            <GuidedPopover
              isOpen={showContextPopover}
              onDismiss={() => {
                setShowContextPopover(false);
                markContextAsSeen();
              }}
              title="Extra Context"
              description="Flashcards now include helpful explanations or tips."
            >
              <div className="text-sm text-muted-foreground p-2 bg-secondary rounded-md">
                {context}
              </div>
            </GuidedPopover>
          )}
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