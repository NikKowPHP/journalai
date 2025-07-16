
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { Volume2 } from "lucide-react";

interface TTSButtonProps {
  text: string;
  lang: string;
}

export const TTSButton: React.FC<TTSButtonProps> = ({ text, lang }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isVoiceAvailable, setIsVoiceAvailable] = useState(false);

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
        }
      };
    }
  }, [lang]);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSupported || !isVoiceAvailable) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.cancel(); // Cancel any previous speech
    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) {
    return null;
  }

  if (!isVoiceAvailable) {
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
      <Volume2 className="h-4 w-4" />
    </Button>
  );
};