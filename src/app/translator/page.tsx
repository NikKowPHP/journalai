
"use client";

import React, { useState, useEffect } from "react";
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
} from "@/lib/hooks/data";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { ArrowRightLeft } from "lucide-react";

interface Segment {
  source: string;
  translation: string;
}

function getLanguageName(value: string | null | undefined): string {
  if (!value) return "";
  const lang = SUPPORTED_LANGUAGES.find((l) => l.value === value);
  return lang ? lang.name : value;
}

export default function TranslatorPage() {
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
  const { data: studyDeck, isLoading: isDeckLoading } = useStudyDeck();
  const translateMutation = useTranslateAndBreakdown();

  const [sourceLang, setSourceLang] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState<string | null>(null);
  const [sourceText, setSourceText] = useState("");
  const [results, setResults] = useState<{
    fullTranslation: string;
    segments: Segment[];
  } | null>(null);

  useEffect(() => {
    if (userProfile) {
      setSourceLang(userProfile.nativeLanguage);
      setTargetLang(userProfile.defaultTargetLanguage);
    }
  }, [userProfile]);

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
            setResults(data);
          },
        },
      );
    }
  };

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(results?.fullTranslation || "");
    setResults(null);
  };

  const deckSet = new Set(studyDeck?.map((item: any) => item.frontContent));

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
            <div className="grid grid-cols-2 gap-4 items-center">
              <Select value={sourceLang || ""} onValueChange={setSourceLang}>
                <SelectTrigger>
                  <SelectValue placeholder="Source Language" />
                </SelectTrigger>
                <SelectContent>
                  {userProfile?.languageProfiles?.map((p: any) => (
                    <SelectItem key={p.language} value={p.language}>
                      {getLanguageName(p.language)}
                    </SelectItem>
                  ))}
                  {userProfile?.nativeLanguage && (
                    <SelectItem value={userProfile.nativeLanguage}>
                      {getLanguageName(userProfile.nativeLanguage)}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Select value={targetLang || ""} onValueChange={setTargetLang}>
                <SelectTrigger>
                  <SelectValue placeholder="Target Language" />
                </SelectTrigger>
                <SelectContent>
                  {userProfile?.languageProfiles?.map((p: any) => (
                    <SelectItem key={p.language} value={p.language}>
                      {getLanguageName(p.language)}
                    </SelectItem>
                  ))}
                  {userProfile?.nativeLanguage && (
                    <SelectItem value={userProfile.nativeLanguage}>
                      {getLanguageName(userProfile.nativeLanguage)}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Enter text to translate..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              rows={8}
            />
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={handleSwapLanguages}
                disabled={!results?.fullTranslation}
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Swap
              </Button>
              <Button
                onClick={handleTranslate}
                disabled={translateMutation.isPending}
              >
                {translateMutation.isPending && (
                  <Spinner size="sm" className="mr-2" />
                )}
                Translate
              </Button>
            </div>
            {translateMutation.error && (
              <p className="text-destructive text-sm">
                {(translateMutation.error as Error).message}
              </p>
            )}
            <Textarea
              placeholder="Translation will appear here..."
              value={results?.fullTranslation || ""}
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
            {translateMutation.isPending && <Spinner />}
            {!results && !translateMutation.isPending && (
              <p className="text-muted-foreground text-center py-10">
                Translate a paragraph to see sentence-by-sentence breakdowns
                here.
              </p>
            )}
            {results?.segments.map((segment, index) => (
              <TranslationSegmentCard
                key={index}
                sourceText={segment.source}
                translatedText={segment.translation}
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