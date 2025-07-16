import { useEffect, useState, useRef } from "react";
import { useStuckWriterSuggestions } from "@/lib/hooks/data";
import type { Editor } from "@tiptap/react";
import { useLanguageStore } from "@/lib/stores/language.store";

export const useStuckWriterEffect = (
  editor: Editor | null,
  topicTitle: string,
) => {
  const [stuckSuggestions, setStuckSuggestions] = useState<string[] | null>(
    null,
  );
  const [showStuckUI, setShowStuckUI] = useState(false);
  const stuckTimer = useRef<NodeJS.Timeout | null>(null);
  const stuckSuggestionsMutation = useStuckWriterSuggestions();
  const activeTargetLanguage = useLanguageStore(
    (state) => state.activeTargetLanguage,
  );

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      setStuckSuggestions(null);
      setShowStuckUI(false);
      if (stuckTimer.current) {
        clearTimeout(stuckTimer.current);
      }
      stuckTimer.current = setTimeout(() => {
        const currentText = editor.getText();
        if (currentText.trim().length > 0 && activeTargetLanguage) {
          stuckSuggestionsMutation.mutate(
            {
              topic: topicTitle,
              currentText,
              targetLanguage: activeTargetLanguage,
            },
            {
              onSuccess: (data) => {
                if (data?.suggestions?.length > 0) {
                  setStuckSuggestions(data.suggestions);
                  setShowStuckUI(true);
                }
              },
            },
          );
        }
      }, 7000);
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
      if (stuckTimer.current) {
        clearTimeout(stuckTimer.current);
      }
    };
  }, [editor, stuckSuggestionsMutation, topicTitle, activeTargetLanguage]);

  return { stuckSuggestions, showStuckUI, setShowStuckUI };
};
