
"use client";

import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner";
import { X, Check, Plus } from "lucide-react";
import {
  useTranslateText,
  useCreateSrsFromTranslation,
  useStudyDeck,
} from "@/lib/hooks/data";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

interface TranslationTooltipProps {
  selectedText: string;
  sourceLang: string; // This is the user's TARGET language (the language of the text being selected)
  targetLang: string; // This is the user's NATIVE language (the language to translate to)
  position: { x: number; y: number };
  onClose: () => void;
}

export function TranslationTooltip({
  selectedText,
  sourceLang,
  targetLang,
  position,
  onClose,
}: TranslationTooltipProps) {
  const {
    mutate: translate,
    data: translation,
    isPending: isTranslating,
    isError: isTranslationError,
    isSuccess: isTranslationSuccess,
  } = useTranslateText();
  const addToDeckMutation = useCreateSrsFromTranslation();
  const { data: studyDeck } = useStudyDeck();

  useEffect(() => {
    if (selectedText) {
      translate({
        text: selectedText,
        sourceLanguage: sourceLang, // The language of the text
        targetLanguage: targetLang, // The language to translate into
      });
    }
  }, [selectedText, sourceLang, targetLang, translate]);

  const deckSet = new Set(studyDeck?.map((item: any) => item.frontContent));
  const isAlreadyInDeck = deckSet.has(selectedText);

  const handleAddToDeck = () => {
    if (translation?.translatedText) {
      const sourceLangCode =
        SUPPORTED_LANGUAGES.find((l) => l.name === sourceLang)?.value ||
        sourceLang;
      addToDeckMutation.mutate({
        frontContent: selectedText,
        backContent: translation.translatedText,
        targetLanguage: sourceLangCode,
      });
    }
  };

  const isAddToDeckDisabled =
    addToDeckMutation.isPending || addToDeckMutation.isSuccess || isAlreadyInDeck;
  const showAddedState = addToDeckMutation.isSuccess || isAlreadyInDeck;

  return (
    <div
      role="tooltip"
      className="fixed z-50 transform -translate-x-1/2"
      style={{ top: position.y, left: position.x }}
      // Prevent mousedown from closing the tooltip immediately
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Card className="p-3 w-64 shadow-2xl bg-popover/90 backdrop-blur-lg">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        <CardContent className="p-0 space-y-2">
          <p className="text-sm font-semibold pr-6">{selectedText}</p>
          <div className="border-t -mx-3 my-2" />
          {isTranslating && <Spinner size="sm" />}
          {isTranslationError && (
            <p className="text-xs text-destructive">Translation failed.</p>
          )}
          {isTranslationSuccess && (
            <div className="space-y-2">
              <p className="text-sm text-popover-foreground">
                {translation.translatedText}
              </p>
              <Button
                size="sm"
                variant="secondary"
                className="w-full h-8"
                onClick={handleAddToDeck}
                disabled={isAddToDeckDisabled}
              >
                {addToDeckMutation.isPending ? (
                  <Spinner size="sm" />
                ) : showAddedState ? (
                  <>
                    <Check className="h-4 w-4 mr-2" /> Added to Deck
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" /> Add to Deck
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}