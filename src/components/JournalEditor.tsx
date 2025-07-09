import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect, useRef } from "react";

interface JournalEditorProps {
  initialContent?: string;
  topicId: string;
}

export function JournalEditor({
  initialContent = "Start writing your thoughts in your target language...",
  topicId,
}: JournalEditorProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4 bg-background text-foreground",
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Tab' && suggestion) {
          event.preventDefault();
          const tr = view.state.tr
            .insertText(suggestion)
            .scrollIntoView();
          view.dispatch(tr);
          setSuggestion("");
          return true;
        }
        return false;
      },
    },
  });

  const editorRef = useRef(editor);
  const [translation, setTranslation] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [lastTyped, setLastTyped] = useState(0);

  const autocompleteMutation = useMutation({
    mutationFn: (text: string) =>
      fetch("/api/ai/autocomplete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }).then(res => res.json()),
    onSuccess: (data) => {
      if (data.completedText) {
        setSuggestion(data.completedText);
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
          targetLanguage: "English"
        }),
      }).then(res => res.json()),
    onSuccess: (data) => {
      setTranslation(data.translatedText);
      console.log("Translation complete:", data.translatedText);
    },
  });

  const createJournalMutation = useMutation({
    mutationFn: (content: string) =>
      fetch("/api/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, topicId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
    },
  });

  const analyzeJournalMutation = useMutation({
    mutationFn: (journalId: string) =>
      fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ journalId }),
      }),
  });

  const handleSubmit = async () => {
    if (!editor) return;
    const content = editor.getText();
    
    createJournalMutation.mutate(content, {
      onSuccess: async (response) => {
        const journal = await response.json();
        analyzeJournalMutation.mutate(journal.id, {
          onSuccess: () => {
            alert("Analysis started - your journal is being analyzed in the background");
          },
          onError: () => {
            alert("Failed to start analysis of your journal");
          }
        });
      },
      onError: () => {
        alert("Failed to save your journal");
      }
    });
  };

  // Handle typing timeout for autocomplete
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      setLastTyped(Date.now());
      setSuggestion(""); // Clear suggestion on new typing
    };

    const checkTypingPause = () => {
      const now = Date.now();
      if (now - lastTyped > 2000 && !suggestion) {
        const text = editor.getText();
        if (text.trim().length > 0) {
          autocompleteMutation.mutate(text);
        }
      }
    };

    editor.on('update', handleUpdate);
    const interval = setInterval(checkTypingPause, 500);
    
    return () => {
      editor.off('update', handleUpdate);
      clearInterval(interval);
    };
  }, [editor, lastTyped, suggestion]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex gap-1 p极1 bg-white border rounded shadow">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1 rounded ${
                editor.isActive("bold") ? "bg-gray-200" : ""
              }`}
            >
              Bold
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1 rounded ${
                editor.isActive("italic") ? "bg-gray-200" : ""
              }`}
            >
              Italic
            </button>
            {editor.state.selection.content().size > 0 && (
              <button
                onClick={() => {
                  const selectedText = editor.state.doc.textBetween(
                    editor.state.selection.from,
                    editor.state.selection.to
                  );
                  translateMutation.mutate({ text: selectedText });
                }}
                className="p-1 rounded hover:bg-gray-200"
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
      <div className="p-4 border-t">
        <button
          className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
          onClick={handleSubmit}
          disabled={createJournalMutation.isPending}
        >
          Submit for Analysis
        </button>
      </div>
    </div>
  );
}
