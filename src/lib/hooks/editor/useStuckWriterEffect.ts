// src/lib/hooks/editor/useStuckWriterEffect.ts

import { useEffect, useState, useRef } from "react";
import { useStuckWriterSuggestions } from "@/lib/hooks/data";
import type { Editor } from "@tiptap/react";
import { useLanguageStore } from "@/lib/stores/language.store";
import { logger } from "@/lib/logger";

export const useStuckWriterEffect = (
  editor: Editor | null,
  topicTitle: string,
) => {
  const [stuckSuggestions, setStuckSuggestions] = useState<string[] | null>(
    null,
  );
  const [showStuckUI, setShowStuckUI] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // --- THE FIX: Get the full mutation object ---
  const stuckSuggestionsMutation = useStuckWriterSuggestions();
  // --- END FIX ---

  const activeTargetLanguage = useLanguageStore(
    (state) => state.activeTargetLanguage,
  );

  useEffect(() => {
    if (!editor) return;

    logger.info("[useStuckWriterEffect] Effect initialized or dependencies changed.");

    const handleUpdate = () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      setShowStuckUI(false);
      setStuckSuggestions(null);

      debounceTimer.current = setTimeout(() => {
        // --- THE FIX: Add the guard clause here ---
        if (stuckSuggestionsMutation.isPending) {
          logger.info("[useStuckWriterEffect] Timer fired, but a mutation is already in flight. Skipping.");
          return;
        }
        // --- END FIX ---

        const currentText = editor.getText();
        if (currentText.trim().length > 0 && activeTargetLanguage) {
          const payload = {
            topic: topicTitle,
            currentText,
            targetLanguage: activeTargetLanguage,
          };

          logger.info(
            "[useStuckWriterEffect] User idle for 7s. Triggering mutation.",
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
        }
      }, 7000);
    };

    editor.on("update", handleUpdate);

    return () => {
      logger.info("[useStuckWriterEffect] Effect cleanup.");
      editor.off("update", handleUpdate);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
    
  // --- THE FIX: The dependency array must be stable ---
  // We use stuckSuggestionsMutation.mutate which is a stable function reference
  // provided by React Query. This prevents the re-render loop.
  }, [editor, stuckSuggestionsMutation.mutate, topicTitle, activeTargetLanguage]);

  return { stuckSuggestions, showStuckUI, setShowStuckUI };
};