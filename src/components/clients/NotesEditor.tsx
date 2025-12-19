import { useState, useEffect } from 'react'
import { Save, FileText } from 'lucide-react'

interface NotesEditorProps {
  value: string | null
  onSave: (notes: string | null) => void
  saving?: boolean
}

export function NotesEditor({ value, onSave, saving = false }: NotesEditorProps) {
  const [localValue, setLocalValue] = useState(value || '')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setLocalValue(value || '')
    setHasChanges(false)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value)
    setHasChanges(e.target.value !== (value || ''))
  }

  const handleSave = () => {
    onSave(localValue || null)
    setHasChanges(false)
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h3 className="card-title text-base gap-2">
            <FileText className="w-5 h-5" />
            Notas e Observações
          </h3>
          {hasChanges && (
            <button
              onClick={handleSave}
              className={`btn btn-primary btn-sm gap-2 ${saving ? 'loading' : ''}`}
              disabled={saving}
            >
              {!saving && <Save className="w-4 h-4" />}
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          )}
        </div>

        <textarea
          value={localValue}
          onChange={handleChange}
          placeholder="Adicione notas e observações importantes sobre este cliente..."
          className="textarea textarea-bordered w-full h-48 resize-none"
        />

        {hasChanges && (
          <p className="text-sm text-warning mt-2">* Alterações não salvas</p>
        )}
      </div>
    </div>
  )
}
