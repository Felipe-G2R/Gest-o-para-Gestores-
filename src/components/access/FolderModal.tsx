import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { AccessFolder } from '@/types'

interface FolderModalProps {
  isOpen: boolean
  onClose: () => void
  folder: AccessFolder | null
  onSave: (name: string, color: string | null) => Promise<void>
  saving?: boolean
}

const FOLDER_COLORS = [
  { name: 'Padrão', value: null },
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Laranja', value: '#f97316' },
  { name: 'Amarelo', value: '#eab308' },
  { name: 'Verde', value: '#22c55e' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Roxo', value: '#a855f7' },
  { name: 'Rosa', value: '#ec4899' },
]

export function FolderModal({
  isOpen,
  onClose,
  folder,
  onSave,
  saving = false
}: FolderModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setName(folder?.name || '')
      setColor(folder?.color || null)
    }
  }, [folder, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await onSave(name.trim(), color)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-bold text-lg mb-4">
          {folder ? 'Editar Pasta' : 'Nova Pasta'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Nome da Pasta *</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Instagram, Google, Bancos..."
              className="input input-bordered"
              autoFocus
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Cor</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c.value ? 'border-primary scale-110' : 'border-base-300'
                  }`}
                  style={{ backgroundColor: c.value || '#6b7280' }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || saving}
              className="btn btn-primary"
            >
              {saving ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : folder ? (
                'Salvar'
              ) : (
                'Criar'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}
