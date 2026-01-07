import { Edit, Trash2, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { RatariaEntry } from '@/types'

interface RatariaEntryCardProps {
  entry: RatariaEntry
  onEdit: () => void
  onDelete: () => void
}

export function RatariaEntryCard({ entry, onEdit, onDelete }: RatariaEntryCardProps) {
  // Extrai texto do HTML para preview
  const getPreviewText = (html: string | null): string => {
    if (!html) return 'Sem conteúdo'
    const temp = document.createElement('div')
    temp.innerHTML = html
    const text = temp.textContent || temp.innerText || ''
    return text.slice(0, 200) + (text.length > 200 ? '...' : '')
  }

  const createdDate = format(new Date(entry.createdAt), "d 'de' MMM, yyyy 'às' HH:mm", { locale: ptBR })

  return (
    <div className="card bg-base-100 shadow hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 cursor-pointer" onClick={onEdit}>
            <h4 className="font-semibold text-lg mb-2">{entry.title || 'Sem título'}</h4>

            <p className="text-sm text-base-content/70 line-clamp-3 mb-3">
              {getPreviewText(entry.content)}
            </p>

            <div className="flex items-center gap-2 text-base-content/50 text-xs">
              <Clock className="w-3 h-3" />
              <span>{createdDate}</span>
            </div>
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
