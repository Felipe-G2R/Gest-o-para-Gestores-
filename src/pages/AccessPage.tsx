import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, KeyRound, Search } from 'lucide-react'
import { MainLayout } from '@/components/layout'
import { AccessEntryCard, AccessEditorModal } from '@/components/access'
import { useAccessStore } from '@/hooks/useAccessStore'
import { useAuthStore } from '@/hooks/useAuthStore'
import type { AccessEntry } from '@/types'

export function AccessPage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<AccessEntry | null>(null)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const navigate = useNavigate()
  const { isAdmin } = useAuthStore()

  const {
    entries,
    loading,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry
  } = useAccessStore()

  // Redireciona se não for admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard')
    }
  }, [isAdmin, navigate])

  // Carrega entradas ao montar
  useEffect(() => {
    if (isAdmin()) {
      fetchEntries()
    }
  }, [fetchEntries, isAdmin])

  // Não renderiza se não for admin
  if (!isAdmin()) {
    return null
  }

  // Filtra entradas por busca
  const filteredEntries = entries.filter(entry => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      entry.title.toLowerCase().includes(search) ||
      (entry.url?.toLowerCase().includes(search) ?? false) ||
      (entry.username?.toLowerCase().includes(search) ?? false) ||
      (entry.notes?.toLowerCase().includes(search) ?? false)
    )
  })

  const handleNewEntry = () => {
    setEditingEntry(null)
    setIsEditorOpen(true)
  }

  const handleEditEntry = (entry: AccessEntry) => {
    setEditingEntry(entry)
    setIsEditorOpen(true)
  }

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('Deseja excluir este acesso?')) {
      await deleteEntry(id)
    }
  }

  const handleSaveEntry = async (data: {
    title: string
    url: string | null
    username: string | null
    password: string | null
    notes: string | null
  }) => {
    setSaving(true)
    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, data)
      } else {
        await createEntry(data)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setEditingEntry(null)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-info" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Login / Senhas</h1>
              <p className="text-base-content/60">Gerencie seus acessos e credenciais</p>
            </div>
          </div>

          <button onClick={handleNewEntry} className="btn btn-info gap-2">
            <Plus className="w-5 h-5" />
            Novo Acesso
          </button>
        </div>

        {/* Barra de busca */}
        <div className="card bg-base-100 shadow">
          <div className="card-body py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar acessos..."
                className="input input-bordered w-full pl-10"
              />
            </div>
          </div>
        </div>

        {/* Contador */}
        <div className="text-sm text-base-content/60">
          {filteredEntries.length} {filteredEntries.length === 1 ? 'acesso' : 'acessos'}
          {searchTerm && ` encontrado${filteredEntries.length === 1 ? '' : 's'}`}
        </div>

        {/* Lista de entradas */}
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-info"></span>
          </div>
        ) : filteredEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntries.map((entry) => (
              <AccessEntryCard
                key={entry.id}
                entry={entry}
                onEdit={() => handleEditEntry(entry)}
                onDelete={() => handleDeleteEntry(entry.id)}
              />
            ))}
          </div>
        ) : (
          <div className="card bg-base-100 shadow">
            <div className="card-body items-center text-center py-12">
              <KeyRound className="w-16 h-16 text-base-content/20 mb-4" />
              <h3 className="text-lg font-semibold text-base-content/60">
                {searchTerm ? 'Nenhum acesso encontrado' : 'Nenhum acesso cadastrado'}
              </h3>
              <p className="text-base-content/40 mb-4">
                {searchTerm ? 'Tente outro termo de busca' : 'Comece a cadastrar seus logins e senhas'}
              </p>
              {!searchTerm && (
                <button onClick={handleNewEntry} className="btn btn-info gap-2">
                  <Plus className="w-5 h-5" />
                  Cadastrar Primeiro Acesso
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de edição */}
      <AccessEditorModal
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        entry={editingEntry}
        onSave={handleSaveEntry}
        saving={saving}
      />
    </MainLayout>
  )
}
