
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, XCircle } from "lucide-react";
import { TTSButton } from "./ui/TTSButton";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FlashcardProps {
  frontContent: string;
  backContent: string;
  context?: string;
  type?: string;
  nativeLanguage?: string | null;
  targetLanguage?: string | null;
  onReview?: (quality: number) => void;
  onOnboardingReview?: () => void;
}

function getLanguageCode(value: string | null | undefined): string {
  if (!value) return "";
  const lang = SUPPORTED_LANGUAGES.find((l) => l.value === value);
  return lang?.code || value;
}

export function Flashcard({
  frontContent,
  backContent,
  context,
  type,
  nativeLanguage,
  targetLanguage,
  onReview,
  onOnboardingReview,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [frontContent]);

  const handleShowAnswer = () => {
    setIsFlipped(true);
  };

  const handleReview = (quality: number) => {
    onReview?.(quality);
    onOnboardingReview?.();
  };

  const backLangCode =
    type === "TRANSLATION"
      ? getLanguageCode(nativeLanguage)
      : getLanguageCode(targetLanguage);

  return (
    <Card
      className={cn(
        "p-6 space-y-4 bg-gradient-to-br from-background to-muted/20 w-full md:max-w-md mx-auto flex flex-col min-h-[20rem] justify-between",
        !isFlipped && "cursor-pointer",
      )}
      onClick={!isFlipped ? handleShowAnswer : undefined}
    >
      <div className="flex-grow flex flex-col justify-center items-center">
        <div className="flex items-center justify-center p-4">
          <p className="text-lg font-medium text-center">{frontContent}</p>
          {targetLanguage && (
            <TTSButton
              text={frontContent}
              lang={getLanguageCode(targetLanguage)}
            />
          )}
        </div>

        {isFlipped && (
          <div className="animate-in fade-in duration-300 w-full">
            <hr className="my-4" />
            <div className="space-y-4">
              <div className="flex items-center justify-center p-4">
                <p className="text-lg font-medium text-center">{backContent}</p>
                {backLangCode && (
                  <TTSButton text={backContent} lang={backLangCode} />
                )}
              </div>
              {context && (
                <div className="text-sm text-muted-foreground p-2 bg-secondary rounded-md">
                  {context}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 border-t">
        {isFlipped ? (
          <div className="flex justify-around gap-2 text-center">
            <div className="flex-1">
              <Button
                variant="secondary"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReview(0);
                }}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Forgot
              </Button>
              <span className="text-xs text-muted-foreground">&lt;1m</span>
            </div>
            <div className="flex-1">
              <Button
                variant="secondary"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReview(3);
                }}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Good
              </Button>
              <span className="text-xs text-muted-foreground">&lt;10m</span>
            </div>
            <div className="flex-1">
              <Button
                variant="secondary"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReview(5);
                }}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Easy
              </Button>
              <span className="text-xs text-muted-foreground">4d</span>
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Click card to show answer
          </p>
        )}
      </div>
    </Card>
  );
}