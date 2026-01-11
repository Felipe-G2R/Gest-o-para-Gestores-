import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { AccessEntry, AccessFolder, AccessDocument } from '@/types'

interface AccessState {
  folders: AccessFolder[]
  entries: AccessEntry[]
  documents: AccessDocument[]
  loading: boolean
  error: string | null

  // Folders
  fetchFolders: () => Promise<void>
  createFolder: (name: string, color?: string) => Promise<AccessFolder | null>
  updateFolder: (id: string, data: { name?: string; color?: string }) => Promise<boolean>
  deleteFolder: (id: string) => Promise<boolean>

  // Entries
  fetchEntries: () => Promise<void>
  createEntry: (data: {
    folderId?: string | null
    title: string
    url?: string | null
    username?: string | null
    password?: string | null
    notes?: string | null
  }) => Promise<AccessEntry | null>
  updateEntry: (id: string, data: {
    folderId?: string | null
    title?: string
    url?: string | null
    username?: string | null
    password?: string | null
    notes?: string | null
  }) => Promise<boolean>
  deleteEntry: (id: string) => Promise<boolean>
  moveEntryToFolder: (entryId: string, folderId: string | null) => Promise<boolean>

  // Documents
  fetchDocuments: () => Promise<void>
  createDocument: (data: {
    folderId?: string | null
    title: string
    content?: string | null
  }) => Promise<AccessDocument | null>
  updateDocument: (id: string, data: {
    folderId?: string | null
    title?: string
    content?: string | null
  }) => Promise<boolean>
  deleteDocument: (id: string) => Promise<boolean>
  moveDocumentToFolder: (docId: string, folderId: string | null) => Promise<boolean>
}

export const useAccessStore = create<AccessState>((set) => ({
  folders: [],
  entries: [],
  documents: [],
  loading: false,
  error: null,

  // ==================== FOLDERS ====================

  fetchFolders: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('access_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (error) throw error

      const folders: AccessFolder[] = (data || []).map((f) => ({
        id: f.id,
        userId: f.user_id,
        name: f.name,
        color: f.color,
        createdAt: f.created_at,
        updatedAt: f.updated_at,
      }))

      set({ folders })
    } catch (error: any) {
      console.error('Error fetching folders:', error)
    }
  },

  createFolder: async (name: string, color?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('access_folders')
        .insert({
          user_id: user.id,
          name: name || 'Nova Pasta',
          color: color || null,
        })
        .select()
        .single()

      if (error) throw error

      const newFolder: AccessFolder = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        color: data.color,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }

      set((state) => ({ folders: [...state.folders, newFolder].sort((a, b) => a.name.localeCompare(b.name)) }))
      return newFolder
    } catch (error) {
      console.error('Error creating folder:', error)
      return null
    }
  },

  updateFolder: async (id: string, data: { name?: string; color?: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('access_folders')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      set((state) => ({
        folders: state.folders.map((f) =>
          f.id === id ? { ...f, ...data, updatedAt: new Date().toISOString() } : f
        ).sort((a, b) => a.name.localeCompare(b.name)),
      }))
      return true
    } catch (error) {
      console.error('Error updating folder:', error)
      return false
    }
  },

  deleteFolder: async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Primeiro, mover todos os entries e documents da pasta para null
      await supabase
        .from('access_entries')
        .update({ folder_id: null })
        .eq('folder_id', id)
        .eq('user_id', user.id)

      await supabase
        .from('access_documents')
        .update({ folder_id: null })
        .eq('folder_id', id)
        .eq('user_id', user.id)

      const { error } = await supabase
        .from('access_folders')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      set((state) => ({
        folders: state.folders.filter((f) => f.id !== id),
        entries: state.entries.map((e) => e.folderId === id ? { ...e, folderId: null } : e),
        documents: state.documents.map((d) => d.folderId === id ? { ...d, folderId: null } : d),
      }))
      return true
    } catch (error) {
      console.error('Error deleting folder:', error)
      return false
    }
  },

  // ==================== ENTRIES ====================

  fetchEntries: async () => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('access_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const entries: AccessEntry[] = (data || []).map((e) => ({
        id: e.id,
        userId: e.user_id,
        folderId: e.folder_id,
        title: e.title,
        url: e.url,
        username: e.username,
        password: e.password,
        notes: e.notes,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
      }))

      set({ entries, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  createEntry: async (data) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: result, error } = await supabase
        .from('access_entries')
        .insert({
          user_id: user.id,
          folder_id: data.folderId || null,
          title: data.title || 'Sem título',
          url: data.url || null,
          username: data.username || null,
          password: data.password || null,
          notes: data.notes || null,
        })
        .select()
        .single()

      if (error) throw error

      const newEntry: AccessEntry = {
        id: result.id,
        userId: result.user_id,
        folderId: result.folder_id,
        title: result.title,
        url: result.url,
        username: result.username,
        password: result.password,
        notes: result.notes,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      }

      set((state) => ({ entries: [newEntry, ...state.entries] }))
      return newEntry
    } catch (error) {
      console.error('Error creating access entry:', error)
      return null
    }
  },

  updateEntry: async (id, data) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const updateData: any = { updated_at: new Date().toISOString() }
      if (data.folderId !== undefined) updateData.folder_id = data.folderId
      if (data.title !== undefined) updateData.title = data.title
      if (data.url !== undefined) updateData.url = data.url
      if (data.username !== undefined) updateData.username = data.username
      if (data.password !== undefined) updateData.password = data.password
      if (data.notes !== undefined) updateData.notes = data.notes

      const { error } = await supabase
        .from('access_entries')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      set((state) => ({
        entries: state.entries.map((e) =>
          e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
        ),
      }))
      return true
    } catch (error) {
      console.error('Error updating access entry:', error)
      return false
    }
  },

  deleteEntry: async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('access_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
      }))
      return true
    } catch (error) {
      console.error('Error deleting access entry:', error)
      return false
    }
  },

  moveEntryToFolder: async (entryId: string, folderId: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('access_entries')
        .update({ folder_id: folderId, updated_at: new Date().toISOString() })
        .eq('id', entryId)
        .eq('user_id', user.id)

      if (error) throw error

      set((state) => ({
        entries: state.entries.map((e) =>
          e.id === entryId ? { ...e, folderId, updatedAt: new Date().toISOString() } : e
        ),
      }))
      return true
    } catch (error) {
      console.error('Error moving entry:', error)
      return false
    }
  },

  // ==================== DOCUMENTS ====================

  fetchDocuments: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('access_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const documents: AccessDocument[] = (data || []).map((d) => ({
        id: d.id,
        userId: d.user_id,
        folderId: d.folder_id,
        title: d.title,
        content: d.content,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }))

      set({ documents })
    } catch (error: any) {
      console.error('Error fetching documents:', error)
    }
  },

  createDocument: async (data) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: result, error } = await supabase
        .from('access_documents')
        .insert({
          user_id: user.id,
          folder_id: data.folderId || null,
          title: data.title || 'Sem título',
          content: data.content || null,
        })
        .select()
        .single()

      if (error) throw error

      const newDoc: AccessDocument = {
        id: result.id,
        userId: result.user_id,
        folderId: result.folder_id,
        title: result.title,
        content: result.content,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      }

      set((state) => ({ documents: [newDoc, ...state.documents] }))
      return newDoc
    } catch (error) {
      console.error('Error creating document:', error)
      return null
    }
  },

  updateDocument: async (id, data) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const updateData: any = { updated_at: new Date().toISOString() }
      if (data.folderId !== undefined) updateData.folder_id = data.folderId
      if (data.title !== undefined) updateData.title = data.title
      if (data.content !== undefined) updateData.content = data.content

      const { error } = await supabase
        .from('access_documents')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      set((state) => ({
        documents: state.documents.map((d) =>
          d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d
        ),
      }))
      return true
    } catch (error) {
      console.error('Error updating document:', error)
      return false
    }
  },

  deleteDocument: async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('access_documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
      }))
      return true
    } catch (error) {
      console.error('Error deleting document:', error)
      return false
    }
  },

  moveDocumentToFolder: async (docId: string, folderId: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('access_documents')
        .update({ folder_id: folderId, updated_at: new Date().toISOString() })
        .eq('id', docId)
        .eq('user_id', user.id)

      if (error) throw error

      set((state) => ({
        documents: state.documents.map((d) =>
          d.id === docId ? { ...d, folderId, updatedAt: new Date().toISOString() } : d
        ),
      }))
      return true
    } catch (error) {
      console.error('Error moving document:', error)
      return false
    }
  },
}))
