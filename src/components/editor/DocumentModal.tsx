import { useState, useEffect, useCallback } from 'react'
import { X, Check, Loader2 } from 'lucide-react'
import { RichTextEditor } from './RichTextEditor'

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
  onSave: (content: string) => Promise<void>
  saving?: boolean
}

export function DocumentModal({
  isOpen,
  onClose,
  title,
  content: initialContent,
  onSave,
  saving = false
}: DocumentModalProps) {
  const [content, setContent] = useState(initialContent)
  const [hasChanges, setHasChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [autoSaving, setAutoSaving] = useState(false)

  useEffect(() => {
    setContent(initialContent)
    setHasChanges(false)
    setLastSaved(null)
  }, [initialContent, isOpen])

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent)
    setHasChanges(newContent !== initialContent)
  }, [initialContent])

  // Auto-save a cada 3 segundos quando há mudanças
  useEffect(() => {
    if (!hasChanges || autoSaving) return

    const timer = setTimeout(async () => {
      setAutoSaving(true)
      try {
        await onSave(content)
        setHasChanges(false)
        setLastSaved(new Date())
      } catch (error) {
        console.error('Erro ao salvar:', error)
      } finally {
        setAutoSaving(false)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [content, hasChanges, onSave, autoSaving])

  const handleClose = async () => {
    if (hasChanges && !autoSaving) {
      await onSave(content)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-base-100 w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-200">
          <h2 className="text-lg font-semibold truncate">{title}</h2>
          <div className="flex items-center gap-4">
            {/* Status de salvamento */}
            <div className="flex items-center gap-2 text-sm">
              {(saving || autoSaving) && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-base-content/60">Salvando...</span>
                </>
              )}
              {!saving && !autoSaving && hasChanges && (
                <span className="text-warning">Alterações não salvas</span>
              )}
              {!saving && !autoSaving && !hasChanges && lastSaved && (
                <>
                  <Check className="w-4 h-4 text-success" />
                  <span className="text-success">Salvo</span>
                </>
              )}
            </div>
            <button
              onClick={handleClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editor Container - estilo Google Docs */}
        <div className="flex-1 overflow-auto bg-base-200">
          <div className="max-w-3xl mx-auto my-8 bg-base-100 shadow-lg rounded-lg min-h-[calc(100vh-200px)]">
            <RichTextEditor
              content={content}
              onChange={handleContentChange}
              placeholder="Comece a escrever..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
