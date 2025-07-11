import { useEditor, EditorContent, BubbleMenu, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useSubmitJournal, useAnalyzeJournal } from "@/lib/hooks/data-hooks";

interface JournalEditorProps {
  topicTitle?: string;
  isOnboarding?: boolean;
  onOnboardingSubmit?: (journalId: string) => void;
}

export function JournalEditor({
  topicTitle = "Free Write",
  isOnboarding = false,
  onOnboardingSubmit,
}: JournalEditorProps) {
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);
  const [translation, setTranslation] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [lastTyped, setLastTyped] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your thoughts in your target language...",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4 bg-background text-foreground",
      },
    },
  });

  const submitJournalMutation = useSubmitJournal();
  const analyzeJournalMutation = useAnalyzeJournal();

  useEffect(() => {
    if (!editor) {
      return;
    }
    const handleKeyDown = (_view: any, event: KeyboardEvent): boolean => {
      if (event.key === "Tab" && suggestion) {
        event.preventDefault();
        editor.chain().focus().insertContent(suggestion).run();
        setSuggestion("");
        setIsSuggestionVisible(false);
        return true;
      }
      return false;
    };
    editor.setOptions({
      editorProps: {
        handleKeyDown,
      },
    });
  }, [editor, suggestion, setIsSuggestionVisible]);

  const autocompleteMutation = useMutation({
    mutationFn: (text: string) =>
      fetch("/api/ai/autocomplete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }).then((res) => res.json()),
    onSuccess: (data) => {
      if (data.completedText) {
        setSuggestion(data.completedText);
        setIsSuggestionVisible(true);
      }
    },
  });

  const translateMutation = useMutation({
    mutationFn: ({ text }: { text: string }) =>
      fetch("/api/ai/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          sourceLanguage: "English",
          targetLanguage: "English",
        }),
      }).then((res) => res.json()),
    onSuccess: (data) => {
      setTranslation(data.translatedText);
      console.log("Translation complete:", data.translatedText);
    },
  });

  const handleSubmit = async () => {
    if (!editor) return;
    const content = editor.getText();
    const payload = { content, topicTitle };

    submitJournalMutation.mutate(payload, {
      onSuccess: (journal) => {
        if (isOnboarding && onOnboardingSubmit) {
          onOnboardingSubmit(journal.id);
        }
        analyzeJournalMutation.mutate(journal.id, {
          onSuccess: () => {
            if (!isOnboarding)
              setStatusMessage(
                "Analysis started - your journal is being analyzed in the background",
              );
          },
          onError: () => {
            if (!isOnboarding) setStatusMessage("Failed to start analysis.");
          },
        });
      },
      onError: () => {
        if (!isOnboarding) setStatusMessage("Failed to save your journal");
      },
    });
  };

  const acceptSuggestion = () => {
    if (editor && suggestion) {
      editor.chain().focus().insertContent(suggestion).run();
      setSuggestion("");
      setIsSuggestionVisible(false);
    }
  };

  // Set up editor update listener to track typing
  useEffect(() => {
    if (!editor) {
      return;
    }
    const handleUpdate = () => {
      setLastTyped(Date.now());
      setSuggestion(""); // Clear old suggestion on new typing
      setIsSuggestionVisible(false);
    };
    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  // Debounce autocomplete API call
  useEffect(() => {
    if (lastTyped === 0) {
      return;
    }

    const handler = setTimeout(() => {
      // Don't fetch if a suggestion already exists or a request is in flight
      if (suggestion || autocompleteMutation.isPending) {
        return;
      }
      const text = editor?.getText();
      if (text && text.trim().length > 0) {
        autocompleteMutation.mutate(text);
      }
    }, 1500); // 1.5 second delay after user stops typing

    return () => {
      clearTimeout(handler);
    };
  }, [lastTyped, editor, suggestion, autocompleteMutation]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex gap-1 p-1 bg-popover text-popover-foreground border border-border rounded-md shadow-md">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1 rounded ${
                editor.isActive("bold") ? "bg-accent" : ""
              } hover:bg-accent`}
            >
              Bold
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1 rounded ${
                editor.isActive("italic") ? "bg-accent" : ""
              } hover:bg-accent`}
            >
              Italic
            </button>
            {editor.state.selection.content().size > 0 && (
              <button
                onClick={() => {
                  const selectedText = editor.state.doc.textBetween(
                    editor.state.selection.from,
                    editor.state.selection.to,
                  );
                  translateMutation.mutate({ text: selectedText });
                }}
                className="p-1 rounded hover:bg-accent"
                disabled={translateMutation.isPending}
              >
                {translateMutation.isPending ? "Translating..." : "Translate"}
              </button>
            )}
          </div>
        </BubbleMenu>
      )}
      <div className="relative">
        <EditorContent editor={editor} />
        {suggestion && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="prose dark:prose-invert prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto p-4 text-gray-400">
              {suggestion}
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t flex items-center justify-between">
        <div>
          <Button
            onClick={handleSubmit}
            disabled={submitJournalMutation.isPending}
          >
            Submit for Analysis
          </Button>
          {statusMessage && (
            <div className="mt-2 text-sm text-muted-foreground">
              {statusMessage}
            </div>
          )}
        </div>
        {isSuggestionVisible && suggestion && (
          <Button size="sm" onClick={acceptSuggestion} variant="secondary">
            Accept Suggestion{" "}
            <kbd className="ml-2 px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
              Tab
            </kbd>
          </Button>
        )}
      </div>
    </div>
  );
}