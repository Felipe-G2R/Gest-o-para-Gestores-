import { useState, useEffect } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import type { AccessEntry } from '@/types'

interface AccessEditorModalProps {
  isOpen: boolean
  onClose: () => void
  entry: AccessEntry | null
  onSave: (data: {
    title: string
    url: string | null
    username: string | null
    password: string | null
    notes: string | null
  }) => Promise<void>
  saving?: boolean
}

export function AccessEditorModal({
  isOpen,
  onClose,
  entry,
  onSave,
  saving = false
}: AccessEditorModalProps) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [notes, setNotes] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTitle(entry?.title || '')
      setUrl(entry?.url || '')
      setUsername(entry?.username || '')
      setPassword(entry?.password || '')
      setNotes(entry?.notes || '')
      setShowPassword(false)
    }
  }, [entry, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    await onSave({
      title: title.trim(),
      url: url.trim() || null,
      username: username.trim() || null,
      password: password || null,
      notes: notes.trim() || null,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-bold text-lg mb-4">
          {entry ? 'Editar Acesso' : 'Novo Acesso'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Nome do Serviço *</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Gmail, Netflix, GitHub..."
              className="input input-bordered"
              autoFocus
              required
            />
          </div>

          {/* URL */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">URL / Link</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://exemplo.com"
              className="input input-bordered"
            />
          </div>

          {/* Username */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Usuário / Email</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="usuario@email.com"
              className="input input-bordered"
            />
          </div>

          {/* Password */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Senha</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input input-bordered w-full pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn btn-ghost btn-sm btn-circle absolute right-2 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Observações</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anotações adicionais..."
              className="textarea textarea-bordered"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="btn btn-primary"
            >
              {saving ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : entry ? (
                'Salvar'
              ) : (
                'Adicionar'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}
