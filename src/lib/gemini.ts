import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

if (!apiKey) {
  throw new Error('Missing VITE_GEMINI_API_KEY environment variable')
}

export const genAI = new GoogleGenerativeAI(apiKey)

// Interface para modelo Gemini
interface GeminiModel {
  id: string
  name: string
  description: string
  isImageModel?: boolean
}

// Modelos disponíveis do Gemini
export const GEMINI_MODELS: GeminiModel[] = [
  // Gemini 2.5 (Mais recentes)
  { id: 'gemini-2.5-pro-preview-06-05', name: 'Gemini 2.5 Pro', description: 'Modelo mais avançado para tarefas complexas' },
  { id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash', description: 'Rápido e eficiente para uso geral' },

  // Gemini 2.0
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Velocidade otimizada' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', description: 'Versão leve e rápida' },

  // Gemini 1.5
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Alto desempenho geral' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Respostas rápidas' },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', description: 'Modelo compacto' },

  // Geração de Imagens
  { id: 'imagen-3.0-generate-002', name: 'Imagen 3', description: 'Geração de imagens de alta qualidade', isImageModel: true },
]

export type GeminiModelId = string

export const getModel = (modelId: string) => {
  return genAI.getGenerativeModel({ model: modelId })
}

// Função para enviar mensagem de texto
export const sendMessage = async (modelId: string, message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) => {
  const model = getModel(modelId)

  const chat = model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 8192,
    },
  })

  const result = await chat.sendMessage(message)
  const response = await result.response
  return response.text()
}

// Função para gerar imagem
export const generateImage = async (prompt: string) => {
  const model = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-002' })

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['image', 'text'],
    } as any,
  })

  const response = await result.response

  // Procurar por partes de imagem na resposta
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if ((part as any).inlineData) {
      return {
        mimeType: (part as any).inlineData.mimeType,
        data: (part as any).inlineData.data,
      }
    }
  }

  return null
}
