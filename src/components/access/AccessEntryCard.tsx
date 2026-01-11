import { useState } from 'react'
import { Edit, Trash2, Clock, ExternalLink, Copy, Eye, EyeOff, User, KeyRound } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { AccessEntry } from '@/types'

interface AccessEntryCardProps {
  entry: AccessEntry
  onEdit: () => void
  onDelete: () => void
}

export function AccessEntryCard({ entry, onEdit, onDelete }: AccessEntryCardProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const createdDate = format(new Date(entry.createdAt), "d 'de' MMM, yyyy", { locale: ptBR })

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="card bg-base-100 shadow hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4 className="font-semibold text-lg mb-3 truncate">{entry.title || 'Sem título'}</h4>

            {/* URL */}
            {entry.url && (
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate"
                >
                  {entry.url}
                </a>
              </div>
            )}

            {/* Username */}
            {entry.username && (
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-base-content/50 flex-shrink-0" />
                <span className="text-sm text-base-content/70 truncate flex-1">{entry.username}</span>
                <button
                  onClick={() => copyToClipboard(entry.username!, 'username')}
                  className="btn btn-ghost btn-xs"
                  title="Copiar usuário"
                >
                  <Copy className="w-3 h-3" />
                  {copied === 'username' && <span className="text-xs text-success ml-1">Copiado!</span>}
                </button>
              </div>
            )}

            {/* Password */}
            {entry.password && (
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="w-4 h-4 text-base-content/50 flex-shrink-0" />
                <span className="text-sm text-base-content/70 font-mono flex-1">
                  {showPassword ? entry.password : '••••••••'}
                </span>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn btn-ghost btn-xs"
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => copyToClipboard(entry.password!, 'password')}
                  className="btn btn-ghost btn-xs"
                  title="Copiar senha"
                >
                  <Copy className="w-3 h-3" />
                  {copied === 'password' && <span className="text-xs text-success ml-1">Copiado!</span>}
                </button>
              </div>
            )}

            {/* Notes preview */}
            {entry.notes && (
              <p className="text-sm text-base-content/60 line-clamp-2 mb-2 mt-3">
                {entry.notes}
              </p>
            )}

            {/* Date */}
            <div className="flex items-center gap-2 text-base-content/50 text-xs mt-3">
              <Clock className="w-3 h-3" />
              <span>{createdDate}</span>
            </div>
          </div>

          {/* Actions */}
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
