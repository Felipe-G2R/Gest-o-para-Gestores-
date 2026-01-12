import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Undo,
  Redo,
  ImagePlus,
  Loader2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { uploadImage } from '@/utils/imageUpload'

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
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2]
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !editor) return

    setUploading(true)
    try {
      const result = await uploadImage(file)

      if (result.success && result.url) {
        editor.chain().focus().setImage({ src: result.url }).run()
      } else {
        alert(result.error || 'Erro ao fazer upload da imagem')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erro ao fazer upload da imagem')
    } finally {
      setUploading(false)
      // Limpar input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleImageButtonClick = () => {
    fileInputRef.current?.click()
  }

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

          {/* Botão de imagem */}
          <button
            type="button"
            onClick={handleImageButtonClick}
            disabled={uploading}
            className="btn btn-ghost btn-sm"
            title="Adicionar imagem"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImagePlus className="w-4 h-4" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />

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
