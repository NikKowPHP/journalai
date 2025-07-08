import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

export function JournalEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "Start writing your thoughts in your target language...",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4",
      },
    },
  })

  if (!editor) {
    return null
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
        <button className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
          Submit for Analysis
        </button>
      </div>
    </div>
  )
}