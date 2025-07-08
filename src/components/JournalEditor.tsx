import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * A rich text editor component for journal entries with basic formatting controls.
 * @param {object} props - The component props.
 * @param {string} props.initialContent - The initial text content for the editor.
 * @param {string} props.topicId - The ID of the topic this journal belongs to.
 * @returns {React.ReactElement} The journal editor component.
 */
interface JournalEditorProps {
  initialContent?: string;
  topicId: string;
}

export function JournalEditor({
  initialContent = "Start writing your thoughts in your target language...",
  topicId,
}: JournalEditorProps) {
  const queryClient = useQueryClient();

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
    
    try {
      const response = await createJournalMutation.mutateAsync(content);
      const journal = await response.json();
      analyzeJournalMutation.mutate(journal.id);
    } catch (error) {
      console.error("Journal submission failed:", error);
    }
  };
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4 bg-background text-foreground",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex gap-1 p-1 bg-white border rounded shadow">
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
          </div>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
      <div className="p-4 border-t">
        <button
          className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
          onClick={handleSubmit}
          disabled={createJournalMutation.isPending || analyzeJournalMutation.isPending}
        >
          Submit for Analysis
        </button>
      </div>
    </div>
  );
}
