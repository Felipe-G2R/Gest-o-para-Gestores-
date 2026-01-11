import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { AccessEntry } from '@/types'

interface AccessState {
  entries: AccessEntry[]
  loading: boolean
  error: string | null
  fetchEntries: () => Promise<void>
  createEntry: (data: {
    title: string
    url?: string | null
    username?: string | null
    password?: string | null
    notes?: string | null
  }) => Promise<AccessEntry | null>
  updateEntry: (id: string, data: {
    title?: string
    url?: string | null
    username?: string | null
    password?: string | null
    notes?: string | null
  }) => Promise<boolean>
  deleteEntry: (id: string) => Promise<boolean>
}

export const useAccessStore = create<AccessState>((set) => ({
  entries: [],
  loading: false,
  error: null,

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

      const { error } = await supabase
        .from('access_entries')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      set((state) => ({
        entries: state.entries.map((e) =>
          e.id === id
            ? { ...e, ...data, updatedAt: new Date().toISOString() }
            : e
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
}))
