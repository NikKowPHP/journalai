
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Spinner from "@/components/ui/Spinner";
import { TranslationSegmentCard } from "@/components/TranslationSegmentCard";
import {
  useUserProfile,
  useStudyDeck,
  useTranslateAndBreakdown,
  useTranslateText,
} from "@/lib/hooks/data";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { ArrowRightLeft } from "lucide-react";

interface Segment {
  source: string;
  translation: string;
  explanation: string;
}

function getLanguageName(value: string | null | undefined): string {
  if (!value) return "";
  const lang = SUPPORTED_LANGUAGES.find((l) => l.value === value);
  return lang ? lang.name : value;
}

export default function TranslatorPage() {
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
  const { data: studyDeck } = useStudyDeck();
  const translateTextMutation = useTranslateText();
  const translateAndBreakdownMutation = useTranslateAndBreakdown();

  const [sourceLang, setSourceLang] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState<string | null>(null);
  const [sourceText, setSourceText] = useState("");
  const [fullTranslation, setFullTranslation] = useState("");
  const [segments, setSegments] = useState<Segment[] | null>(null);

  const allUserLanguages = useMemo(() => {
    if (!userProfile) return [];
    const languages = new Set<string>();
    if (userProfile.nativeLanguage) {
      languages.add(userProfile.nativeLanguage);
    }
    userProfile.languageProfiles?.forEach((p: any) => languages.add(p.language));
    return Array.from(languages);
  }, [userProfile]);

  useEffect(() => {
    if (userProfile) {
      setSourceLang(userProfile.nativeLanguage);
      setTargetLang(userProfile.defaultTargetLanguage);
    }
  }, [userProfile]);

  useEffect(() => {
    setFullTranslation("");
    setSegments(null);
  }, [sourceText]);

  const handleTranslate = () => {
    if (sourceText.trim() && sourceLang && targetLang) {
      setFullTranslation("");
      setSegments(null);

      translateTextMutation.mutate(
        {
          text: sourceText,
          sourceLanguage: getLanguageName(sourceLang),
          targetLanguage: getLanguageName(targetLang),
        },
        {
          onSuccess: (data) => {
            setFullTranslation(data.translatedText);
            // Now trigger the slower breakdown
            translateAndBreakdownMutation.mutate(
              {
                text: sourceText,
                sourceLanguage: getLanguageName(sourceLang),
                targetLanguage: getLanguageName(targetLang),
              },
              {
                onSuccess: (breakdownData) => {
                  setFullTranslation(breakdownData.fullTranslation);
                  setSegments(breakdownData.segments);
                },
              },
            );
          },
        },
      );
    }
  };

  const handleSwapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    setSourceText(fullTranslation);
    setFullTranslation("");
    setSegments(null);
  };

  const deckSet = new Set(studyDeck?.map((item: any) => item.frontContent));
  const isTranslating =
    translateTextMutation.isPending || translateAndBreakdownMutation.isPending;
  const isBreakingDown = translateAndBreakdownMutation.isPending;

  if (isProfileLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Translator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Translate Text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
              <Select value={sourceLang || ""} onValueChange={setSourceLang}>
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {allUserLanguages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {getLanguageName(lang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSwapLanguages}
                
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
              <Select value={targetLang || ""} onValueChange={setTargetLang}>
                <SelectTrigger>
                  <SelectValue placeholder="Target" />
                </SelectTrigger>
                <SelectContent>
                  {allUserLanguages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {getLanguageName(lang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Enter text to translate..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              rows={8}
            />
            <div className="flex justify-end items-center">
              <Button onClick={handleTranslate} disabled={isTranslating}>
                {isTranslating && <Spinner size="sm" className="mr-2" />}
                Translate
              </Button>
            </div>
            {translateTextMutation.error && (
              <p className="text-destructive text-sm">
                {(translateTextMutation.error as Error).message}
              </p>
            )}
            <Textarea
              placeholder="Translation will appear here..."
              value={fullTranslation}
              readOnly
              rows={8}
              className="bg-muted"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Breakdown & Flashcards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
            {isBreakingDown && <Spinner />}
            {!segments && !isBreakingDown && (
              <p className="text-muted-foreground text-center py-10">
                Translate a paragraph to see sentence-by-sentence breakdowns
                here.
              </p>
            )}
            {segments?.map((segment, index) => (
              <TranslationSegmentCard
                key={index}
                sourceText={segment.source}
                translatedText={segment.translation}
                explanation={segment.explanation}
                targetLanguage={targetLang!}
                isAlreadyInDeck={deckSet.has(segment.source)}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}