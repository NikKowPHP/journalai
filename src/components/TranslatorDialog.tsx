"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "./ui/textarea";
import {
  useUserProfile,
  useTranslateText,
  useCreateSrsFromTranslation,
} from "@/lib/hooks/data";
import { useLanguageStore } from "@/lib/stores/language.store";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { ArrowRightLeft, Loader2, Check } from "lucide-react";
import Spinner from "./ui/Spinner";

interface TranslatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyTranslation?: (text: string) => void;
}

function getLanguageName(value: string | null | undefined): string {
  if (!value) return "";
  const lang = SUPPORTED_LANGUAGES.find((l) => l.value === value);
  return lang ? lang.name : value;
}

export function TranslatorDialog({
  open,
  onOpenChange,
  onApplyTranslation,
}: TranslatorDialogProps) {
  const { data: userProfile } = useUserProfile();
  const { activeTargetLanguage } = useLanguageStore();
  const translateMutation = useTranslateText();
  const {
    mutate: addToDeck,
    reset: resetAddToDeck,
    isPending: isAddingToDeck,
    isSuccess: isAddedToDeck,
  } = useCreateSrsFromTranslation();

  const [sourceLang, setSourceLang] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState<string | null>(null);
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSourceLang(userProfile?.nativeLanguage || null);
      setTargetLang(activeTargetLanguage);
      setSourceText("");
      setTranslatedText("");
      resetAddToDeck();
    }
  }, [open, userProfile, activeTargetLanguage, resetAddToDeck]);

  const handleTranslate = () => {
    if (sourceText.trim() && sourceLang && targetLang) {
      translateMutation.mutate(
        {
          text: sourceText,
          sourceLanguage: getLanguageName(sourceLang),
          targetLanguage: getLanguageName(targetLang),
        },
        {
          onSuccess: (data) => {
            setTranslatedText(data.translatedText);
            resetAddToDeck(); // Allow adding new translation to deck
          },
        },
      );
    }
  };

  const handleSwapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);

    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  const handleAddToDeck = () => {
    if (sourceText && translatedText && targetLang) {
      addToDeck({
        frontContent: sourceText,
        backContent: translatedText,
        targetLanguage: targetLang,
      });
    }
  };

  const handleApplyToJournal = () => {
    if (onApplyTranslation && translatedText) {
      onApplyTranslation(translatedText);
      onOpenChange(false);
    }
  };

  const isAddToDeckDisabled =
    !translatedText || isAddingToDeck || isAddedToDeck;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Translator</DialogTitle>
          <DialogDescription>
            Translate text between your languages. Add translations to your
            study deck for review.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-center font-semibold">
                {getLanguageName(sourceLang)}
              </div>
              <Textarea
                placeholder={`Text in ${getLanguageName(sourceLang)}...`}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="resize-none"
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center font-semibold">
                {getLanguageName(targetLang)}
              </div>
              <Textarea
                placeholder="Translation"
                value={translatedText}
                readOnly
                className="resize-none bg-muted/50"
                rows={5}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <Button variant="ghost" onClick={handleSwapLanguages}>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Swap
            </Button>
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            <Button
              onClick={handleAddToDeck}
              disabled={isAddToDeckDisabled}
              variant="secondary"
            >
              {isAddingToDeck && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isAddedToDeck && <Check className="mr-2 h-4 w-4" />}
              {isAddedToDeck ? "Added!" : "Add to Deck"}
            </Button>
            {onApplyTranslation && (
              <Button
                onClick={handleApplyToJournal}
                disabled={!translatedText}
                variant="outline"
              >
                Apply to Journal
              </Button>
            )}
          </div>
          <Button
            onClick={handleTranslate}
            disabled={!sourceText || translateMutation.isPending}
          >
            {translateMutation.isPending && (
              <Spinner size="sm" className="mr-2" />
            )}
            Translate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
