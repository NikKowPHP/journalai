import {
  useEditor,
  EditorContent,
  BubbleMenu,
  FloatingMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import {
  useSubmitJournal,
  useAnalyzeJournal,
  useAutocomplete,
} from "@/lib/hooks/data-hooks";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Lightbulb } from "lucide-react";
import { Extension } from "@tiptap/core";

// --- WritingAids Sub-component ---
interface WritingAidsProps {
  topicTitle: string;
  editor: any; // TipTap Editor instance
}

const WritingAids: React.FC<WritingAidsProps> = ({ topicTitle, editor }) => {
  const {
    data: aids,
    mutate: fetchAids,
    isPending,
  } = useMutation({
    mutationFn: (topic: string) =>
      fetch("/api/journal/helpers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      }).then((res) => res.json()),
  });

  useEffect(() => {
    if (topicTitle && topicTitle !== "Free Write") {
      fetchAids(topicTitle);
    }
  }, [topicTitle, fetchAids]);

  if (topicTitle === "Free Write" || (!isPending && !aids)) {
    return null;
  }

  const insertSentenceStarter = () => {
    if (editor && aids?.sentenceStarter) {
      editor.chain().focus().setContent(aids.sentenceStarter).run();
    }
  };

  const insertVocab = (vocab: string) => {
    if (editor) {
      editor.chain().focus().insertContent(` ${vocab} `).run();
    }
  };

  return (
    <Card className="mb-4 bg-secondary/30">
      <CardHeader>
        <CardTitle className="text-lg">Topic: {topicTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPending && (
          <>
            <Skeleton className="h-5 w-1/3" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-28" />
            </div>
          </>
        )}
        {aids && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                Sentence Starter
              </h4>
              <p className="italic text-foreground">
                "{aids.sentenceStarter}"
                <Button
                  size="sm"
                  variant="link"
                  onClick={insertSentenceStarter}
                  className="ml-2"
                >
                  Use this
                </Button>
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Vocabulary to Try
              </h4>
              <div className="flex flex-wrap gap-2">
                {aids.suggestedVocab.map((vocab: string) => (
                  <Button
                    key={vocab}
                    size="sm"
                    variant="outline"
                    onClick={() => insertVocab(vocab)}
                  >
                    {vocab}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// --- TipTap Extension for Tab Key ---
const TabHandler = Extension.create({
  name: "tabHandler",
  addOptions() {
    return {
      onTab: () => false,
    };
  },
  addKeyboardShortcuts() {
    return {
      Tab: () => this.options.onTab(),
    };
  },
});

// --- Modified JournalEditor Component ---
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
  const [statusMessage, setStatusMessage] = useState("");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const autocompleteMutation = useAutocomplete();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder:
            topicTitle && topicTitle !== "Free Write"
              ? `Start writing about "${topicTitle}"...`
              : "Start with a free write entry...",
        }),
        TabHandler.configure({
          onTab: () => {
            if (suggestion) {
              editor?.chain().focus().insertContent(suggestion).run();
              setSuggestion(null);
              return true; // prevent default tab behavior
            }
            return false;
          },
        }),
      ],
      content: "",
      editorProps: {
        attributes: {
          class:
            "prose dark:prose-invert prose-sm sm:prose-lg mx-auto focus:outline-none p-4 min-h-[200px] bg-background text-foreground",
        },
      },
    },
    [topicTitle, suggestion], // Reconfigure on suggestion change for keyboard shortcut
  );

  const submitJournalMutation = useSubmitJournal();
  const analyzeJournalMutation = useAnalyzeJournal();

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      setSuggestion(null);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        const text = editor.getText();
        if (text.trim().length > 10) {
          autocompleteMutation.mutate(
            { text },
            {
              onSuccess: (data) => setSuggestion(data.completedText),
            },
          );
        }
      }, 1500);
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [editor, autocompleteMutation]);

  const handleSubmit = async () => {
    if (!editor) return;
    const content = editor.getText();
    if (content.trim().length < 10) {
      setStatusMessage("Please write a bit more before submitting.");
      return;
    }
    setStatusMessage("");

    const payload = { content, topicTitle };

    submitJournalMutation.mutate(payload, {
      onSuccess: (journal: { id: string }) => {
        editor.commands.clearContent();
        if (isOnboarding && onOnboardingSubmit) {
          onOnboardingSubmit(journal.id);
        } else {
          setStatusMessage("Analyzing in background...");
        }
        analyzeJournalMutation.mutate(journal.id);
      },
      onError: () => {
        setStatusMessage("Failed to save your journal");
      },
    });
  };

  if (!editor) {
    return null;
  }

  return (
    <div>
      <WritingAids topicTitle={topicTitle} editor={editor} />
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
        {editor && suggestion && (
          <FloatingMenu
            editor={editor}
            shouldShow={() => suggestion !== null}
            tippyOptions={{ duration: 100, placement: "bottom-start" }}
          >
            <div className="bg-background border rounded-lg p-2 shadow-lg text-sm">
              <span className="text-muted-foreground">{suggestion}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => {
                  editor.chain().focus().insertContent(suggestion).run();
                  setSuggestion(null);
                }}
              >
                Accept (Tab)
              </Button>
            </div>
          </FloatingMenu>
        )}
        <EditorContent editor={editor} />
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
        </div>
      </div>
    </div>
  );
}