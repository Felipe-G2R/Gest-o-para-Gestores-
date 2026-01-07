import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { RatariaEntry } from '@/types'

interface RatariaState {
  entries: RatariaEntry[]
  loading: boolean
  error: string | null
  fetchEntries: () => Promise<void>
  createEntry: (title: string, content: string) => Promise<RatariaEntry | null>
  updateEntry: (id: string, title: string, content: string) => Promise<boolean>
  deleteEntry: (id: string) => Promise<boolean>
}

export const useRatariaStore = create<RatariaState>((set) => ({
  entries: [],
  loading: false,
  error: null,

  fetchEntries: async () => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('rataria_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const entries: RatariaEntry[] = (data || []).map((e) => ({
        id: e.id,
        userId: e.user_id,
        title: e.title,
        content: e.content,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
      }))

      set({ entries, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  createEntry: async (title: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('rataria_entries')
        .insert({
          user_id: user.id,
          title: title || 'Sem título',
          content: content || null,
        })
        .select()
        .single()

      if (error) throw error

      const newEntry: RatariaEntry = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        content: data.content,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }

      set((state) => ({ entries: [newEntry, ...state.entries] }))
      return newEntry
    } catch (error) {
      console.error('Error creating rataria entry:', error)
      return null
    }
  },

  updateEntry: async (id: string, title: string, content: string) => {
    try {
      const { error } = await supabase
        .from('rataria_entries')
        .update({
          title: title || 'Sem título',
          content: content || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        entries: state.entries.map((e) =>
          e.id === id
            ? { ...e, title, content, updatedAt: new Date().toISOString() }
            : e
        ),
      }))
      return true
    } catch (error) {
      console.error('Error updating rataria entry:', error)
      return false
    }
  },

  deleteEntry: async (id: string) => {
    try {
      const { error } = await supabase
        .from('rataria_entries')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
      }))
      return true
    } catch (error) {
      console.error('Error deleting rataria entry:', error)
      return false
    }
  },
}))
