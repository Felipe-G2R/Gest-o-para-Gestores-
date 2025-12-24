import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { DiaryEntry } from '@/types'

interface DiaryState {
  entries: DiaryEntry[]
  loading: boolean
  error: string | null
  fetchEntries: (month?: number, year?: number) => Promise<void>
  getEntriesByDate: (date: string) => DiaryEntry[]
  createEntry: (date: string, title: string, content: string) => Promise<DiaryEntry | null>
  updateEntry: (id: string, title: string, content: string) => Promise<boolean>
  deleteEntry: (id: string) => Promise<boolean>
  getEntriesCountByDate: () => Record<string, number>
}

export const useDiaryStore = create<DiaryState>((set, get) => ({
  entries: [],
  loading: false,
  error: null,

  fetchEntries: async (month?: number, year?: number) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let query = supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Se mês e ano foram fornecidos, filtrar por período
      if (month !== undefined && year !== undefined) {
        const startDate = new Date(year, month, 1).toISOString().split('T')[0]
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]
        query = query.gte('date', startDate).lte('date', endDate)
      }

      const { data, error } = await query

      if (error) throw error

      const entries: DiaryEntry[] = (data || []).map((e) => ({
        id: e.id,
        userId: e.user_id,
        date: e.date,
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

  getEntriesByDate: (date: string) => {
    const { entries } = get()
    return entries
      .filter((e) => e.date === date)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  createEntry: async (date: string, title: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('diary_entries')
        .insert({
          user_id: user.id,
          date,
          title: title || null,
          content: content || null,
        })
        .select()
        .single()

      if (error) throw error

      const newEntry: DiaryEntry = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        title: data.title,
        content: data.content,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }

      set((state) => ({ entries: [newEntry, ...state.entries] }))
      return newEntry
    } catch (error) {
      console.error('Error creating diary entry:', error)
      return null
    }
  },

  updateEntry: async (id: string, title: string, content: string) => {
    try {
      const { error } = await supabase
        .from('diary_entries')
        .update({
          title: title || null,
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
      console.error('Error updating diary entry:', error)
      return false
    }
  },

  deleteEntry: async (id: string) => {
    try {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
      }))
      return true
    } catch (error) {
      console.error('Error deleting diary entry:', error)
      return false
    }
  },

  getEntriesCountByDate: () => {
    const { entries } = get()
    const counts: Record<string, number> = {}
    entries.forEach((e) => {
      counts[e.date] = (counts[e.date] || 0) + 1
    })
    return counts
  },
}))
