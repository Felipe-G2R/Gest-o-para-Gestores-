import { useState } from 'react'
import { FileText, Maximize2 } from 'lucide-react'
import { DocumentModal } from '../editor'

interface NotesEditorProps {
  value: string | null
  onSave: (notes: string | null) => Promise<void>
  saving?: boolean
  clientName?: string
}

export function NotesEditor({ value, onSave, saving = false, clientName = 'Cliente' }: NotesEditorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Função para extrair texto do HTML para preview
  const getPreviewText = (html: string | null): string => {
    if (!html) return ''
    const temp = document.createElement('div')
    temp.innerHTML = html
    const text = temp.textContent || temp.innerText || ''
    return text.slice(0, 200) + (text.length > 200 ? '...' : '')
  }

  const handleSave = async (content: string) => {
    await onSave(content || null)
  }

  const previewText = getPreviewText(value)
  const hasContent = value && value.trim().length > 0

  return (
    <>
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title text-base gap-2">
              <FileText className="w-5 h-5" />
              Notas e Observações
            </h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary btn-sm gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              {hasContent ? 'Editar' : 'Criar'}
            </button>
          </div>

          {hasContent ? (
            <div
              className="bg-base-200 rounded-lg p-4 cursor-pointer hover:bg-base-300 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              <p className="text-sm text-base-content/80 line-clamp-4">
                {previewText}
              </p>
              <p className="text-xs text-primary mt-2">Clique para ver mais...</p>
            </div>
          ) : (
            <div
              className="bg-base-200 rounded-lg p-8 text-center cursor-pointer hover:bg-base-300 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              <FileText className="w-12 h-12 mx-auto text-base-content/30 mb-3" />
              <p className="text-base-content/50">
                Nenhuma nota adicionada ainda.
              </p>
              <p className="text-sm text-primary mt-2">
                Clique para adicionar notas...
              </p>
            </div>
          )}
        </div>
      </div>

      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Notas - ${clientName}`}
        content={value || ''}
        onSave={handleSave}
        saving={saving}
      />
    </>
  )
}
