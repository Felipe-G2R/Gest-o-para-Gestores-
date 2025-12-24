import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Undo,
  Redo
} from 'lucide-react'
import { useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  editable?: boolean
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Comece a escrever...',
  editable = true
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2]
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    }
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-col h-full">
      {editable && (
        <div className="flex items-center gap-1 p-2 border-b border-base-300 bg-base-200 rounded-t-lg flex-wrap">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`btn btn-ghost btn-sm ${editor.isActive('bold') ? 'bg-base-300' : ''}`}
            title="Negrito"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`btn btn-ghost btn-sm ${editor.isActive('italic') ? 'bg-base-300' : ''}`}
            title="Itálico"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="divider divider-horizontal mx-1"></div>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`btn btn-ghost btn-sm ${editor.isActive('heading', { level: 1 }) ? 'bg-base-300' : ''}`}
            title="Título 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`btn btn-ghost btn-sm ${editor.isActive('heading', { level: 2 }) ? 'bg-base-300' : ''}`}
            title="Título 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <div className="divider divider-horizontal mx-1"></div>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`btn btn-ghost btn-sm ${editor.isActive('bulletList') ? 'bg-base-300' : ''}`}
            title="Lista"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`btn btn-ghost btn-sm ${editor.isActive('orderedList') ? 'bg-base-300' : ''}`}
            title="Lista Numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="divider divider-horizontal mx-1"></div>

          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="btn btn-ghost btn-sm"
            title="Desfazer"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="btn btn-ghost btn-sm"
            title="Refazer"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      )}

      <EditorContent
        editor={editor}
        className="flex-1 overflow-auto p-4 prose prose-sm max-w-none focus:outline-none"
      />
    </div>
  )
}
