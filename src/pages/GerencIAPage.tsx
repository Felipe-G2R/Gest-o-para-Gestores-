import { useState, useEffect, useRef } from 'react'
import { MainLayout } from '@/components/layout'
import { useChatStore } from '@/hooks/useChatStore'
import { useAuthStore } from '@/hooks/useAuthStore'
import { GEMINI_MODELS, type GeminiModelId } from '@/lib/gemini'
import {
  Send,
  Plus,
  Trash2,
  MessageSquare,
  Bot,
  User,
  Loader2,
  Image as ImageIcon,
  ChevronDown,
} from 'lucide-react'

export function GerencIAPage() {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()
  const {
    sessions,
    currentSession,
    messages,
    selectedModel,
    loading,
    sending,
    error,
    setSelectedModel,
    fetchSessions,
    loadSession,
    deleteSession,
    sendChatMessage,
    clearCurrentSession,
  } = useChatStore()

  useEffect(() => {
    if (user) {
      fetchSessions(user.id)
    }
  }, [user, fetchSessions])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || sending || !user) return
    const message = input
    setInput('')
    await sendChatMessage(message, user.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewChat = () => {
    clearCurrentSession()
  }

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Deseja excluir esta conversa?')) {
      await deleteSession(sessionId)
    }
  }

  const currentModelInfo = GEMINI_MODELS.find(m => m.id === selectedModel)

  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-4">
        {/* Sidebar de Sessões */}
        <div className="w-72 bg-base-100 rounded-lg shadow flex flex-col">
          <div className="p-4 border-b border-base-300">
            <button
              onClick={handleNewChat}
              className="btn btn-primary w-full gap-2"
            >
              <Plus className="w-5 h-5" />
              Nova Conversa
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-center text-base-content/50 py-4 text-sm">
                Nenhuma conversa ainda
              </p>
            ) : (
              sessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => loadSession(session.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer group transition-colors ${
                    currentSession?.id === session.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-base-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate text-sm">{session.title}</span>
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 btn btn-ghost btn-xs btn-circle text-error"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Área Principal do Chat */}
        <div className="flex-1 bg-base-100 rounded-lg shadow flex flex-col">
          {/* Header com seletor de modelo */}
          <div className="p-4 border-b border-base-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold">Gerenc<span className="text-primary">[IA]</span></h2>
                <p className="text-xs text-base-content/60">Assistente com IA</p>
              </div>
            </div>

            {/* Seletor de Modelo */}
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost gap-2">
                {currentModelInfo?.isImageModel && <ImageIcon className="w-4 h-4" />}
                {currentModelInfo?.name || 'Selecionar Modelo'}
                <ChevronDown className="w-4 h-4" />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-72 max-h-80 overflow-y-auto"
              >
                {GEMINI_MODELS.map(model => (
                  <li key={model.id}>
                    <button
                      onClick={() => setSelectedModel(model.id as GeminiModelId)}
                      className={selectedModel === model.id ? 'active' : ''}
                    >
                      <div className="flex flex-col items-start">
                        <span className="flex items-center gap-2">
                          {model.isImageModel && <ImageIcon className="w-4 h-4 text-warning" />}
                          {model.name}
                        </span>
                        <span className="text-xs text-base-content/60">
                          {model.description}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-base-content/50">
                <Bot className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">Olá! Como posso ajudar?</h3>
                <p className="text-sm text-center max-w-md">
                  Selecione um modelo e comece a conversar. Você pode usar modelos de texto
                  ou de geração de imagens.
                </p>
              </div>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-content'
                        : 'bg-base-200'
                    }`}
                  >
                    {message.imageUrl && (
                      <img
                        src={message.imageUrl}
                        alt="Imagem gerada"
                        className="rounded-lg mb-2 max-w-full"
                      />
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))
            )}

            {sending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-base-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Pensando...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-base-300">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  currentModelInfo?.isImageModel
                    ? 'Descreva a imagem que você quer gerar...'
                    : 'Digite sua mensagem...'
                }
                className="textarea textarea-bordered flex-1 resize-none"
                rows={2}
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="btn btn-primary btn-square"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-base-content/50 mt-2 text-center">
              Modelo: {currentModelInfo?.name} • Pressione Enter para enviar
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
