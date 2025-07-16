// src/lib/hooks/editor/useStuckWriterEffect.ts

import { useEffect, useState, useRef } from "react";
import { useStuckWriterSuggestions } from "@/lib/hooks/data";
import type { Editor } from "@tiptap/react";
import { useLanguageStore } from "@/lib/stores/language.store";
import { logger } from "@/lib/logger"; // Import the logger

export const useStuckWriterEffect = (
  editor: Editor | null,
  topicTitle: string,
) => {
  const [stuckSuggestions, setStuckSuggestions] = useState<string[] | null>(
    null,
  );
  const [showStuckUI, setShowStuckUI] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const stuckSuggestionsMutation = useStuckWriterSuggestions();
  const activeTargetLanguage = useLanguageStore(
    (state) => state.activeTargetLanguage,
  );

  useEffect(() => {
    if (!editor) return;

    logger.info("[useStuckWriterEffect] Effect initialized.");

    const handleUpdate = () => {
      // Clear any existing timer every time the user types
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      // Reset the UI state immediately
      setShowStuckUI(false);
      setStuckSuggestions(null);

      // Set a new timer
      debounceTimer.current = setTimeout(() => {
        const currentText = editor.getText();
        if (currentText.trim().length > 0 && activeTargetLanguage) {
          const payload = {
            topic: topicTitle,
            currentText,
            targetLanguage: activeTargetLanguage,
          };

          logger.info(
            "[useStuckWriterEffect] User idle, triggering mutation.",
            payload,
          );

          stuckSuggestionsMutation.mutate(payload, {
            onSuccess: (data) => {
              logger.info(
                "[useStuckWriterEffect] Mutation succeeded.",
                { response: data },
              );
              if (data?.suggestions?.length > 0) {
                setStuckSuggestions(data.suggestions);
                setShowStuckUI(true);
              } else {
                 logger.info("[useStuckWriterEffect] No suggestions returned from AI.");
              }
            },
            onError: (error) => {
              logger.error(
                "[useStuckWriterEffect] Mutation failed.",
                { error },
              );
            },
          });
        } else {
           logger.info("[useStuckWriterEffect] Timer fired, but conditions not met to call API (no text or language).");
        }
      }, 7000); // 7-second delay
    };

    editor.on("update", handleUpdate);

    // Cleanup function to clear the timer when the component unmounts
    return () => {
      logger.info("[useStuckWriterEffect] Effect cleanup.");
      editor.off("update", handleUpdate);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [editor, stuckSuggestionsMutation, topicTitle, activeTargetLanguage]);

  return { stuckSuggestions, showStuckUI, setShowStuckUI };
};