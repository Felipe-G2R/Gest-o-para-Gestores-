import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, FileText, Clock } from 'lucide-react'
import type { DiaryEntry } from '@/types'

interface CalendarDayPanelProps {
  date: Date
  entries: DiaryEntry[]
  onNewEntry: () => void
  onViewEntry: (entry: DiaryEntry) => void
}

export function CalendarDayPanel({
  date,
  entries,
  onNewEntry,
  onViewEntry
}: CalendarDayPanelProps) {
  const dateFormatted = format(date, "EEEE, d 'de' MMMM", { locale: ptBR })

  // Extrai texto do HTML para preview
  const getPreviewText = (html: string | null): string => {
    if (!html) return 'Sem conteúdo'
    const temp = document.createElement('div')
    temp.innerHTML = html
    const text = temp.textContent || temp.innerText || ''
    return text.slice(0, 80) + (text.length > 80 ? '...' : '')
  }

  return (
    <div className="card bg-base-100 shadow h-full">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold capitalize">{dateFormatted}</h3>
            <p className="text-sm text-base-content/60">
              {entries.length} {entries.length === 1 ? 'entrada' : 'entradas'}
            </p>
          </div>
          <button onClick={onNewEntry} className="btn btn-primary btn-sm gap-2">
            <Plus className="w-4 h-4" />
            Nova
          </button>
        </div>

        <div className="divider my-2"></div>

        {entries.length > 0 ? (
          <div className="space-y-3 overflow-auto flex-1">
            {entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onViewEntry(entry)}
                className="w-full text-left p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs text-base-content/60 mb-1">
                  <Clock className="w-3 h-3" />
                  <span>{format(new Date(entry.createdAt), 'HH:mm')}</span>
                </div>
                {entry.title && (
                  <p className="font-medium text-sm mb-1">{entry.title}</p>
                )}
                <p className="text-xs text-base-content/70 line-clamp-2">
                  {getPreviewText(entry.content)}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <FileText className="w-12 h-12 text-base-content/20 mb-3" />
            <p className="text-base-content/50 text-sm">
              Nenhuma entrada neste dia
            </p>
            <button
              onClick={onNewEntry}
              className="btn btn-ghost btn-sm text-primary mt-2"
            >
              Criar entrada
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
