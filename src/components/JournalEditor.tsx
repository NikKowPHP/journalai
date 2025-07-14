import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
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
  const [translation, setTranslation] = useState("");
  const [suggestionSuffix, setSuggestionSuffix] = useState("");
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

  const acceptSuggestion = () => {
    if (editor && suggestionSuffix) {
      editor.chain().focus().insertContent(suggestionSuffix).run();
      setSuggestionSuffix("");
    }
  };

  useEffect(() => {
    if (!editor) return;
    
    // Clear suggestion whenever the user types.
    const clearSuggestion = () => setSuggestionSuffix("");
    editor.on('update', clearSuggestion);

    const handleKeyDown = (_view: any, event: KeyboardEvent): boolean => {
      if (event.key === "Tab" && suggestionSuffix) {
        event.preventDefault();
        acceptSuggestion();
        return true;
      }
      return false;
    };
    editor.setOptions({
      editorProps: {
        handleKeyDown,
      },
    });

    return () => {
      editor.off('update', clearSuggestion);
    }
  }, [editor, suggestionSuffix]);

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
      // The old, fragile logic is gone. We now expect the backend to send just the suffix.
      if (data.completedText) {
        setSuggestionSuffix(data.completedText);
      }
    },
  });

  const handleSubmit = async () => {
    if (!editor) return;
    const content = editor.getText();
    const payload = { content, topicTitle };

    submitJournalMutation.mutate(payload, {
      onSuccess: (journal: { id: string }) => {
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

  useEffect(() => {
    const handleUpdate = () => {
      setLastTyped(Date.now());
    };
    editor?.on("transaction", handleUpdate);
    return () => {
      editor?.off("transaction", handleUpdate);
    };
  }, [editor]);

  useEffect(() => {
    if (lastTyped === 0) return;

    const handler = setTimeout(() => {
      if (autocompleteMutation.isPending) return;
      const text = editor?.getText();
      if (text && text.trim().length > 0) {
        autocompleteMutation.mutate(text);
      }
    }, 1500);

    return () => clearTimeout(handler);
  }, [lastTyped, editor, autocompleteMutation]);

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
          </div>
        </BubbleMenu>
      )}
      <div className="relative">
         {/* The new "ghost text" renderer for inline suggestions */}
         {suggestionSuffix && editor && (
            <div 
                className="absolute inset-0 p-4 pointer-events-none prose dark:prose-invert prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto"
                aria-hidden="true"
            >
                {/* This invisible span ensures the ghost text aligns with the cursor */}
                <span className="opacity-0">{editor.getText()}</span>
                {/* This is the visible ghost text */}
                <span className="text-muted-foreground">{suggestionSuffix}</span>
            </div>
        )}
        <EditorContent editor={editor} />
      </div>
      <div className="p-4 border-t flex items-center justify-between min-h-[68px]">
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
        {suggestionSuffix && (
          <div className="flex items-center gap-2 animate-in fade-in">
            <Button size="sm" onClick={acceptSuggestion} variant="secondary">
              Accept{" "}
              <kbd className="ml-2 px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                Tab
              </kbd>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}