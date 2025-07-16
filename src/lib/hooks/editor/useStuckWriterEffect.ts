
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

  // --- THE FIX IS HERE ---
  // Destructure the mutate function. We'll give it a clearer alias.
  const { mutate: getSuggestions } = useStuckWriterSuggestions();
  // --- END FIX ---

  const activeTargetLanguage = useLanguageStore(
    (state) => state.activeTargetLanguage,
  );

  useEffect(() => {
    if (!editor) return;

    logger.info("[useStuckWriterEffect] Effect initialized or dependencies changed.");

    const handleUpdate = () => {
      // Clear any existing timer on every keystroke
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      setShowStuckUI(false);
      setStuckSuggestions(null);

      // Set a new timer to fire after 7 seconds of inactivity
      debounceTimer.current = setTimeout(() => {
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

          // --- THE FIX IS HERE ---
          // Call the stable mutate function directly
          getSuggestions(payload, {
            onSuccess: (data) => {
              logger.info(
                "[useStuckWriterEffect] Mutation succeeded.",
                { response: data },
              );
              if (data?.suggestions?.length > 0) {
                setStuckSuggestions(data.suggestions);
                setShowStuckUI(true);
              } else {
                logger.info(
                  "[useStuckWriterEffect] No suggestions returned from AI.",
                );
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

    // Cleanup
    return () => {
      logger.info("[useStuckWriterEffect] Effect cleanup.");
      editor.off("update", handleUpdate);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
    // --- THE FIX IS HERE ---
    // The dependency array now contains stable references, breaking the loop.
  }, [editor, getSuggestions, topicTitle, activeTargetLanguage]);

  return { stuckSuggestions, showStuckUI, setShowStuckUI };
};
