import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { sendMessage, generateImage, GEMINI_MODELS, type GeminiModelId } from '@/lib/gemini'
import type { ChatMessage, ChatSession } from '@/types'

interface ChatState {
  sessions: ChatSession[]
  currentSession: ChatSession | null
  messages: ChatMessage[]
  selectedModel: GeminiModelId
  loading: boolean
  sending: boolean
  error: string | null

  // Actions
  setSelectedModel: (model: GeminiModelId) => void
  fetchSessions: (userId: string) => Promise<void>
  createSession: (userId: string, title: string) => Promise<ChatSession | null>
  loadSession: (sessionId: string) => Promise<void>
  deleteSession: (sessionId: string) => Promise<boolean>
  sendChatMessage: (content: string, userId: string) => Promise<void>
  clearCurrentSession: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSession: null,
  messages: [],
  selectedModel: 'gemini-2.0-flash',
  loading: false,
  sending: false,
  error: null,

  setSelectedModel: (model: GeminiModelId) => {
    set({ selectedModel: model })
  },

  fetchSessions: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error

      const sessions: ChatSession[] = (data || []).map((s: any) => ({
        id: s.id,
        userId: s.user_id,
        title: s.title,
        modelId: s.model_id,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      }))

      set({ sessions, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  createSession: async (userId: string, title: string) => {
    try {
      const { selectedModel } = get()
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          title,
          model_id: selectedModel,
        })
        .select()
        .single()

      if (error) throw error

      const newSession: ChatSession = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        modelId: data.model_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }

      set({
        sessions: [newSession, ...get().sessions],
        currentSession: newSession,
        messages: [],
      })

      return newSession
    } catch (error: any) {
      set({ error: error.message })
      return null
    }
  },

  loadSession: async (sessionId: string) => {
    set({ loading: true, error: null })
    try {
      // Buscar sessão
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError) throw sessionError

      const session: ChatSession = {
        id: sessionData.id,
        userId: sessionData.user_id,
        title: sessionData.title,
        modelId: sessionData.model_id,
        createdAt: sessionData.created_at,
        updatedAt: sessionData.updated_at,
      }

      // Buscar mensagens
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError

      const messages: ChatMessage[] = (messagesData || []).map((m: any) => ({
        id: m.id,
        sessionId: m.session_id,
        role: m.role,
        content: m.content,
        imageUrl: m.image_url,
        modelId: m.model_id,
        createdAt: m.created_at,
      }))

      set({
        currentSession: session,
        messages,
        selectedModel: session.modelId as GeminiModelId,
        loading: false,
      })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  deleteSession: async (sessionId: string) => {
    try {
      // Deletar mensagens primeiro
      await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId)

      // Deletar sessão
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error

      set({
        sessions: get().sessions.filter(s => s.id !== sessionId),
        ...(get().currentSession?.id === sessionId ? { currentSession: null, messages: [] } : {}),
      })

      return true
    } catch (error: any) {
      set({ error: error.message })
      return false
    }
  },

  sendChatMessage: async (content: string, userId: string) => {
    const { currentSession, messages, selectedModel } = get()
    set({ sending: true, error: null })

    try {
      let session = currentSession

      // Criar nova sessão se não existir
      if (!session) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
        session = await get().createSession(userId, title)
        if (!session) throw new Error('Falha ao criar sessão')
      }

      // Adicionar mensagem do usuário localmente
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sessionId: session.id,
        role: 'user',
        content,
        modelId: selectedModel,
        createdAt: new Date().toISOString(),
      }

      set({ messages: [...get().messages, userMessage] })

      // Salvar mensagem do usuário no Supabase
      await supabase.from('chat_messages').insert({
        id: userMessage.id,
        session_id: session.id,
        role: 'user',
        content,
        model_id: selectedModel,
      })

      // Verificar se é modelo de imagem
      const modelInfo = GEMINI_MODELS.find(m => m.id === selectedModel)

      let responseContent = ''
      let imageUrl: string | null = null

      if (modelInfo?.isImageModel) {
        // Gerar imagem
        const imageResult = await generateImage(content)
        if (imageResult) {
          // Upload para Supabase Storage
          const fileName = `${session.id}/${crypto.randomUUID()}.png`
          const base64Data = imageResult.data
          const byteCharacters = atob(base64Data)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: imageResult.mimeType })

          const { error: uploadError } = await supabase.storage
            .from('chat-images')
            .upload(fileName, blob)

          if (uploadError) throw uploadError

          const { data: urlData } = supabase.storage
            .from('chat-images')
            .getPublicUrl(fileName)

          imageUrl = urlData.publicUrl
          responseContent = 'Imagem gerada com sucesso!'
        } else {
          responseContent = 'Não foi possível gerar a imagem. Tente novamente.'
        }
      } else {
        // Enviar mensagem de texto
        const history = messages.map(m => ({
          role: m.role as 'user' | 'model',
          parts: [{ text: m.content }],
        }))

        responseContent = await sendMessage(selectedModel, content, history)
      }

      // Adicionar resposta do modelo
      const modelMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sessionId: session.id,
        role: 'model',
        content: responseContent,
        imageUrl,
        modelId: selectedModel,
        createdAt: new Date().toISOString(),
      }

      set({ messages: [...get().messages, modelMessage] })

      // Salvar resposta no Supabase
      await supabase.from('chat_messages').insert({
        id: modelMessage.id,
        session_id: session.id,
        role: 'model',
        content: responseContent,
        image_url: imageUrl,
        model_id: selectedModel,
      })

      // Atualizar updated_at da sessão
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', session.id)

      set({ sending: false })
    } catch (error: any) {
      console.error('Error sending message:', error)
      set({ error: error.message, sending: false })
    }
  },

  clearCurrentSession: () => {
    set({ currentSession: null, messages: [] })
  },
}))
