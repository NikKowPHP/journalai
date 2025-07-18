
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface TTSButtonProps {
  text: string;
  lang: string;
}

export const TTSButton: React.FC<TTSButtonProps> = ({ text, lang }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isVoiceAvailable, setIsVoiceAvailable] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setIsSupported(true);

      const checkVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        const hasVoice = availableVoices.some((v) => v.lang.startsWith(lang));
        setIsVoiceAvailable(hasVoice);
      };

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        checkVoices();
      } else {
        window.speechSynthesis.onvoiceschanged = checkVoices;
      }

      return () => {
        if (window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = null;
          window.speechSynthesis.cancel();
        }
      };
    }
  }, [lang]);

  const handleSpeak = (e: React.MouseEvent) => {
    logger.info(`handling speak : ${isSupported} ${isVoiceAvailable} ${isSpeaking}`)
    // e.stopPropagation();
    if (!isSupported || !isVoiceAvailable || isSpeaking) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.lang.startsWith(lang));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel(); // Cancel any previous speech
    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported || !isVoiceAvailable) {
    return (
      <Button
        size="icon"
        variant="ghost"
        disabled
        title={`Voice for this language (${lang}) is not available on your system.`}
      >
        <Volume2 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button size="icon" variant="ghost" onClick={handleSpeak}>
      <Volume2
        className={cn(
          "h-4 w-4 transition-colors",
          isSpeaking && "text-primary animate-pulse",
        )}
      />
    </Button>
  );
};