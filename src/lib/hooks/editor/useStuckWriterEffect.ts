
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
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer to hide the UI

  const stuckSuggestionsMutation = useStuckWriterSuggestions();

  const activeTargetLanguage = useLanguageStore(
    (state) => state.activeTargetLanguage,
  );

  useEffect(() => {
    if (!editor) return;

    logger.info(
      "[useStuckWriterEffect] Effect initialized or dependencies changed.",
    );

    const handleUpdate = () => {
      // Clear both timers whenever the user types
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);

      // Don't hide the UI immediately. Let the dismiss timer handle it.
      // This allows the user to see the suggestions even if they start typing again.

      debounceTimer.current = setTimeout(() => {
        if (stuckSuggestionsMutation.isPending) {
          logger.info(
            "[useStuckWriterEffect] Timer fired, but a mutation is already in flight. Skipping.",
          );
          return;
        }

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
              logger.info("[useStuckWriterEffect] Mutation succeeded.", {
                response: data,
              });
              if (data?.suggestions?.length > 0) {
                setStuckSuggestions(data.suggestions);
                setShowStuckUI(true);

                // Set a timer to automatically hide the suggestions after 2 minutes
                dismissTimerRef.current = setTimeout(() => {
                  setShowStuckUI(false);
                }, 120000); // Changed from 10000 to 120000
              } else {
                logger.info(
                  "[useStuckWriterEffect] No suggestions returned from AI.",
                );
              }
            },
            onError: (error) => {
              logger.error("[useStuckWriterEffect] Mutation failed.", {
                error,
              });
            },
          });
        }
      }, 7000);
    };

    editor.on("update", handleUpdate);

    return () => {
      logger.info("[useStuckWriterEffect] Effect cleanup.");
      editor.off("update", handleUpdate);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [
    editor,
    stuckSuggestionsMutation.mutate,
    topicTitle,
    activeTargetLanguage,
  ]);

  return { stuckSuggestions, showStuckUI, setShowStuckUI };
};