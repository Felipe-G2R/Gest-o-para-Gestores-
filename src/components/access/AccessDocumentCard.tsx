import { Edit, Trash2, Clock, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { AccessDocument } from '@/types'

interface AccessDocumentCardProps {
  document: AccessDocument
  onEdit: () => void
  onDelete: () => void
}

export function AccessDocumentCard({ document, onEdit, onDelete }: AccessDocumentCardProps) {
  const createdDate = format(new Date(document.createdAt), "d 'de' MMM, yyyy", { locale: ptBR })

  // Extrai texto do HTML para preview
  const getPreviewText = (html: string | null): string => {
    if (!html) return 'Sem conteúdo'
    const temp = window.document.createElement('div')
    temp.innerHTML = html
    const text = temp.textContent || temp.innerText || ''
    return text.slice(0, 150) + (text.length > 150 ? '...' : '')
  }

  return (
    <div className="card bg-base-100 shadow hover:shadow-md transition-shadow border-l-4 border-secondary">
      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-secondary flex-shrink-0" />
              <h4 className="font-semibold truncate">{document.title || 'Sem título'}</h4>
            </div>

            <p className="text-sm text-base-content/60 line-clamp-2 mb-2">
              {getPreviewText(document.content)}
            </p>

            <div className="flex items-center gap-2 text-base-content/50 text-xs">
              <Clock className="w-3 h-3" />
              <span>{createdDate}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={onEdit}
              className="btn btn-ghost btn-sm btn-circle"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/10"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
