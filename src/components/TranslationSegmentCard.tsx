
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreateSrsFromTranslation } from "@/lib/hooks/data";
import { PlusCircle, CheckCircle } from "lucide-react";
import Spinner from "./ui/Spinner";

interface TranslationSegmentCardProps {
  sourceText: string;
  translatedText: string;
  targetLanguage: string;
  isAlreadyInDeck: boolean;
}

export function TranslationSegmentCard({
  sourceText,
  translatedText,
  targetLanguage,
  isAlreadyInDeck,
}: TranslationSegmentCardProps) {
  const {
    mutate: addToDeck,
    isPending,
    isSuccess,
  } = useCreateSrsFromTranslation();

  const handleAddToDeck = () => {
    addToDeck({
      frontContent: sourceText,
      backContent: translatedText,
      targetLanguage,
    });
  };

  const showAddedState = isSuccess || isAlreadyInDeck;

  return (
    <Card className="p-4 bg-secondary/50">
      <CardContent className="p-0 flex items-start gap-4">
        <div className="flex-1 space-y-2">
          <p className="text-sm text-muted-foreground">{sourceText}</p>
          <p className="text-sm font-medium">{translatedText}</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleAddToDeck}
          disabled={showAddedState || isPending}
          className="shrink-0"
        >
          {isPending ? (
            <Spinner size="sm" />
          ) : showAddedState ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <PlusCircle className="h-5 w-5" />
          )}
          <span className="sr-only">Add to deck</span>
        </Button>
      </CardContent>
    </Card>
  );
}