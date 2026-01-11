import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  KeyRound,
  Search,
  FolderPlus,
  Folder,
  FolderOpen,
  FileText,
  Edit,
  Trash2,
  ChevronRight,
  Home,
} from 'lucide-react'
import { MainLayout } from '@/components/layout'
import {
  AccessEntryCard,
  AccessEditorModal,
  FolderModal,
  AccessDocumentCard,
  AccessDocumentEditorModal,
} from '@/components/access'
import { useAccessStore } from '@/hooks/useAccessStore'
import { useAuthStore } from '@/hooks/useAuthStore'
import type { AccessEntry, AccessFolder, AccessDocument } from '@/types'

export function AccessPage() {
  // Modals
  const [isEntryEditorOpen, setIsEntryEditorOpen] = useState(false)
  const [isDocEditorOpen, setIsDocEditorOpen] = useState(false)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)

  // Editing states
  const [editingEntry, setEditingEntry] = useState<AccessEntry | null>(null)
  const [editingDoc, setEditingDoc] = useState<AccessDocument | null>(null)
  const [editingFolder, setEditingFolder] = useState<AccessFolder | null>(null)

  // UI states
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)

  const navigate = useNavigate()
  const { isAdmin } = useAuthStore()

  const {
    folders,
    entries,
    documents,
    loading,
    fetchFolders,
    fetchEntries,
    fetchDocuments,
    createFolder,
    updateFolder,
    deleteFolder,
    createEntry,
    updateEntry,
    deleteEntry,
    createDocument,
    updateDocument,
    deleteDocument,
  } = useAccessStore()

  // Redireciona se não for admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard')
    }
  }, [isAdmin, navigate])

  // Carrega dados ao montar
  useEffect(() => {
    if (isAdmin()) {
      fetchFolders()
      fetchEntries()
      fetchDocuments()
    }
  }, [fetchFolders, fetchEntries, fetchDocuments, isAdmin])

  // Não renderiza se não for admin
  if (!isAdmin()) {
    return null
  }

  // Filtra entries e documents pela pasta atual e busca
  const currentEntries = entries.filter((e) => {
    const matchesFolder = currentFolderId ? e.folderId === currentFolderId : e.folderId === null
    if (!searchTerm) return matchesFolder

    const search = searchTerm.toLowerCase()
    const matchesSearch =
      e.title.toLowerCase().includes(search) ||
      (e.url?.toLowerCase().includes(search) ?? false) ||
      (e.username?.toLowerCase().includes(search) ?? false) ||
      (e.notes?.toLowerCase().includes(search) ?? false)

    return matchesSearch && (searchTerm ? true : matchesFolder)
  })

  const currentDocuments = documents.filter((d) => {
    const matchesFolder = currentFolderId ? d.folderId === currentFolderId : d.folderId === null
    if (!searchTerm) return matchesFolder

    const search = searchTerm.toLowerCase()
    const matchesSearch =
      d.title.toLowerCase().includes(search) ||
      (d.content?.toLowerCase().includes(search) ?? false)

    return matchesSearch && (searchTerm ? true : matchesFolder)
  })

  // Conta itens por pasta
  const getItemCount = (folderId: string | null) => {
    const entryCount = entries.filter((e) => e.folderId === folderId).length
    const docCount = documents.filter((d) => d.folderId === folderId).length
    return entryCount + docCount
  }

  const currentFolder = folders.find((f) => f.id === currentFolderId)

  // Handlers - Folders
  const handleNewFolder = () => {
    setEditingFolder(null)
    setIsFolderModalOpen(true)
  }

  const handleEditFolder = (folder: AccessFolder) => {
    setEditingFolder(folder)
    setIsFolderModalOpen(true)
  }

  const handleDeleteFolder = async (id: string) => {
    if (window.confirm('Deseja excluir esta pasta? Os itens serão movidos para "Sem pasta".')) {
      await deleteFolder(id)
      if (currentFolderId === id) {
        setCurrentFolderId(null)
      }
    }
  }

  const handleSaveFolder = async (name: string, color: string | null) => {
    setSaving(true)
    try {
      if (editingFolder) {
        await updateFolder(editingFolder.id, { name, color: color || undefined })
      } else {
        await createFolder(name, color || undefined)
      }
    } finally {
      setSaving(false)
    }
  }

  // Handlers - Entries
  const handleNewEntry = () => {
    setEditingEntry(null)
    setIsEntryEditorOpen(true)
  }

  const handleEditEntry = (entry: AccessEntry) => {
    setEditingEntry(entry)
    setIsEntryEditorOpen(true)
  }

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('Deseja excluir este acesso?')) {
      await deleteEntry(id)
    }
  }

  const handleSaveEntry = async (data: {
    folderId: string | null
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

  // Handlers - Documents
  const handleNewDocument = () => {
    setEditingDoc(null)
    setIsDocEditorOpen(true)
  }

  const handleEditDocument = (doc: AccessDocument) => {
    setEditingDoc(doc)
    setIsDocEditorOpen(true)
  }

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm('Deseja excluir este documento?')) {
      await deleteDocument(id)
    }
  }

  const handleSaveDocument = async (title: string, content: string, folderId: string | null) => {
    setSaving(true)
    try {
      if (editingDoc) {
        await updateDocument(editingDoc.id, { title, content, folderId })
      } else {
        const newDoc = await createDocument({ title, content, folderId })
        if (newDoc) {
          setEditingDoc(newDoc)
        }
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Pastas */}
        <div className="w-64 bg-base-200 border-r border-base-300 flex flex-col">
          <div className="p-4 border-b border-base-300">
            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="w-5 h-5 text-info" />
              <span className="font-bold">Login / Senhas</span>
            </div>
            <button onClick={handleNewFolder} className="btn btn-sm btn-ghost w-full justify-start gap-2">
              <FolderPlus className="w-4 h-4" />
              Nova Pasta
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {/* Sem pasta */}
            <button
              onClick={() => setCurrentFolderId(null)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                currentFolderId === null ? 'bg-primary text-primary-content' : 'hover:bg-base-300'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="flex-1 text-left text-sm">Todos os itens</span>
              <span className="text-xs opacity-60">{getItemCount(null)}</span>
            </button>

            {/* Pastas */}
            {folders.map((folder) => (
              <div key={folder.id} className="group">
                <button
                  onClick={() => setCurrentFolderId(folder.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    currentFolderId === folder.id ? 'bg-primary text-primary-content' : 'hover:bg-base-300'
                  }`}
                >
                  {currentFolderId === folder.id ? (
                    <FolderOpen className="w-4 h-4" style={{ color: folder.color || undefined }} />
                  ) : (
                    <Folder className="w-4 h-4" style={{ color: folder.color || undefined }} />
                  )}
                  <span className="flex-1 text-left text-sm truncate">{folder.name}</span>
                  <span className="text-xs opacity-60">{getItemCount(folder.id)}</span>

                  {/* Actions on hover */}
                  <div className={`flex gap-1 ${currentFolderId === folder.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditFolder(folder)
                      }}
                      className="btn btn-ghost btn-xs btn-circle"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteFolder(folder.id)
                      }}
                      className="btn btn-ghost btn-xs btn-circle text-error"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-base-300 bg-base-100">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-1 text-sm text-base-content/60 mb-1">
                  <button onClick={() => setCurrentFolderId(null)} className="hover:text-primary">
                    Login/Senhas
                  </button>
                  {currentFolder && (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      <span className="text-base-content">{currentFolder.name}</span>
                    </>
                  )}
                </div>
                <h1 className="text-xl font-bold">
                  {currentFolder ? currentFolder.name : 'Todos os Itens'}
                </h1>
              </div>

              <div className="flex gap-2">
                <button onClick={handleNewDocument} className="btn btn-secondary btn-sm gap-2">
                  <FileText className="w-4 h-4" />
                  Documento
                </button>
                <button onClick={handleNewEntry} className="btn btn-info btn-sm gap-2">
                  <Plus className="w-4 h-4" />
                  Acesso
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar acessos e documentos..."
                className="input input-bordered input-sm w-full max-w-md pl-9"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg text-info"></span>
              </div>
            ) : currentEntries.length === 0 && currentDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <KeyRound className="w-16 h-16 text-base-content/20 mb-4" />
                <h3 className="text-lg font-semibold text-base-content/60">
                  {searchTerm ? 'Nenhum item encontrado' : 'Nenhum item nesta pasta'}
                </h3>
                <p className="text-base-content/40 mb-4">
                  {searchTerm ? 'Tente outro termo de busca' : 'Comece adicionando acessos ou documentos'}
                </p>
                {!searchTerm && (
                  <div className="flex gap-2">
                    <button onClick={handleNewEntry} className="btn btn-info btn-sm gap-2">
                      <Plus className="w-4 h-4" />
                      Novo Acesso
                    </button>
                    <button onClick={handleNewDocument} className="btn btn-secondary btn-sm gap-2">
                      <FileText className="w-4 h-4" />
                      Novo Documento
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Documents Section */}
                {currentDocuments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-base-content/60 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Documentos ({currentDocuments.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {currentDocuments.map((doc) => (
                        <AccessDocumentCard
                          key={doc.id}
                          document={doc}
                          onEdit={() => handleEditDocument(doc)}
                          onDelete={() => handleDeleteDocument(doc.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Entries Section */}
                {currentEntries.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-base-content/60 mb-3 flex items-center gap-2">
                      <KeyRound className="w-4 h-4" />
                      Acessos ({currentEntries.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {currentEntries.map((entry) => (
                        <AccessEntryCard
                          key={entry.id}
                          entry={entry}
                          onEdit={() => handleEditEntry(entry)}
                          onDelete={() => handleDeleteEntry(entry.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        folder={editingFolder}
        onSave={handleSaveFolder}
        saving={saving}
      />

      <AccessEditorModal
        isOpen={isEntryEditorOpen}
        onClose={() => setIsEntryEditorOpen(false)}
        entry={editingEntry}
        folders={folders}
        currentFolderId={currentFolderId}
        onSave={handleSaveEntry}
        saving={saving}
      />

      <AccessDocumentEditorModal
        isOpen={isDocEditorOpen}
        onClose={() => setIsDocEditorOpen(false)}
        document={editingDoc}
        folders={folders}
        currentFolderId={currentFolderId}
        onSave={handleSaveDocument}
        saving={saving}
      />
    </MainLayout>
  )
}
