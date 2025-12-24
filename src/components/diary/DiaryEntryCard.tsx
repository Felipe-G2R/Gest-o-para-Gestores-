import { Edit, Trash2, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { DiaryEntry } from '@/types'

interface DiaryEntryCardProps {
  entry: DiaryEntry
  onEdit: () => void
  onDelete: () => void
}

export function DiaryEntryCard({ entry, onEdit, onDelete }: DiaryEntryCardProps) {
  // Extrai texto do HTML para preview
  const getPreviewText = (html: string | null): string => {
    if (!html) return 'Sem conteúdo'
    const temp = document.createElement('div')
    temp.innerHTML = html
    const text = temp.textContent || temp.innerText || ''
    return text.slice(0, 150) + (text.length > 150 ? '...' : '')
  }

  const createdTime = format(new Date(entry.createdAt), 'HH:mm', { locale: ptBR })

  return (
    <div className="card bg-base-100 shadow hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 cursor-pointer" onClick={onEdit}>
            <div className="flex items-center gap-2 text-base-content/60 text-sm mb-2">
              <Clock className="w-4 h-4" />
              <span>{createdTime}</span>
            </div>

            {entry.title && (
              <h4 className="font-semibold text-base mb-1">{entry.title}</h4>
            )}

            <p className="text-sm text-base-content/70 line-clamp-2">
              {getPreviewText(entry.content)}
            </p>
          </div>

          <div className="flex gap-1">
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
