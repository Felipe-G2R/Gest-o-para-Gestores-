import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Task, TaskStatus, TaskPriority } from '@/types'

interface TasksState {
  tasks: Task[]
  loading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  addTask: (task: {
    title: string
    description?: string | null
    dueDate: string
    priority: TaskPriority
    isUrgent: boolean
  }) => Promise<Task | null>
  updateTask: (id: string, updates: Partial<Task>) => Promise<boolean>
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<boolean>
  deleteTask: (id: string) => Promise<boolean>
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true })

      if (error) throw error

      const tasks: Task[] = (data || []).map((t) => ({
        id: t.id,
        userId: t.user_id,
        title: t.title,
        description: t.description,
        dueDate: t.due_date,
        status: t.status,
        priority: t.priority,
        isUrgent: t.is_urgent,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }))

      set({ tasks, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  addTask: async (taskData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: taskData.title,
          description: taskData.description || null,
          due_date: taskData.dueDate,
          status: 'pending',
          priority: taskData.priority,
          is_urgent: taskData.isUrgent,
        })
        .select()
        .single()

      if (error) throw error

      const newTask: Task = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description,
        dueDate: data.due_date,
        status: data.status,
        priority: data.priority,
        isUrgent: data.is_urgent,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }

      set((state) => ({ tasks: [...state.tasks, newTask] }))
      return newTask
    } catch (error) {
      console.error('Error adding task:', error)
      return null
    }
  },

  updateTask: async (id, updates) => {
    try {
      const dbUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      }
      if (updates.title !== undefined) dbUpdates.title = updates.title
      if (updates.description !== undefined) dbUpdates.description = updates.description
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate
      if (updates.status !== undefined) dbUpdates.status = updates.status
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority
      if (updates.isUrgent !== undefined) dbUpdates.is_urgent = updates.isUrgent

      const { error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: dbUpdates.updated_at } : t
        ),
      }))
      return true
    } catch (error) {
      console.error('Error updating task:', error)
      return false
    }
  },

  updateTaskStatus: async (id, status) => {
    return get().updateTask(id, { status })
  },

  deleteTask: async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }))
      return true
    } catch (error) {
      console.error('Error deleting task:', error)
      return false
    }
  },
}))
