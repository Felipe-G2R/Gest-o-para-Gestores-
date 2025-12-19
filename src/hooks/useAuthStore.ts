import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  error: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, name: string) => Promise<boolean>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
  updateProfile: (updates: { name?: string; avatarUrl?: string | null }) => Promise<boolean>
  uploadAvatar: (file: File) => Promise<string | null>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  loading: false,

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: profile?.full_name || data.user.email?.split('@')[0] || 'Usuário',
          fullName: profile?.full_name,
          avatarUrl: profile?.avatar_url,
          role: 'user', // Default role
          createdAt: data.user.created_at,
        }

        set({ user, isAuthenticated: true, loading: false })
        return true
      }
      return false
    } catch (error: any) {
      set({ error: error.message, loading: false })
      return false
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        // Profile is created via trigger or manually if no trigger
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: name,
          email: email,
        })

        if (profileError) console.error('Error creating profile:', profileError)

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: name,
          fullName: name,
          role: 'user',
          createdAt: data.user.created_at,
        }

        set({ user, isAuthenticated: true, loading: false })
        return true
      }
      return false
    } catch (error: any) {
      set({ error: error.message, loading: false })
      return false
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    set({ loading: true })
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      const user: User = {
        id: session.user.id,
        email: session.user.email!,
        name: profile?.full_name || session.user.email?.split('@')[0] || 'Usuário',
        fullName: profile?.full_name,
        avatarUrl: profile?.avatar_url,
        role: 'user',
        createdAt: session.user.created_at,
      }
      set({ user, isAuthenticated: true, loading: false })
    } else {
      set({ user: null, isAuthenticated: false, loading: false })
    }
  },

  updateProfile: async (updates) => {
    const { user } = get()
    if (!user) return false

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.name,
          avatar_url: updates.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      set({
        user: {
          ...user,
          name: updates.name || user.name,
          fullName: updates.name || user.fullName,
          avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : user.avatarUrl,
        },
      })
      return true
    } catch (error) {
      console.error('Error updating profile:', error)
      return false
    }
  },

  uploadAvatar: async (file: File) => {
    const { user } = get()
    if (!user) return null

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      await get().updateProfile({ avatarUrl: publicUrl })
      return publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      return null
    }
  }
}))
