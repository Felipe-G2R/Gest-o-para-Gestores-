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

// Modelos disponíveis do Gemini (Atualizados Dez/2025)
export const GEMINI_MODELS: GeminiModel[] = [
  // Gemini 3 (Mais recentes - Dezembro 2025)
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', description: 'Modelo mais avançado e capaz' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', description: 'Rápido e eficiente' },
  { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Pro Image', description: 'Geração de imagens avançada', isImageModel: true },

  // Gemini 2.5 (Estáveis)
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Alto desempenho com thinking' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Melhor custo-benefício' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', description: 'Ultra-rápido e econômico' },
  { id: 'gemini-2.5-flash-image', name: 'Nano Banana', description: 'Geração de imagens (Flash Image)', isImageModel: true },
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
export const generateImage = async (prompt: string, modelId: string = 'gemini-2.5-flash-image') => {
  const model = genAI.getGenerativeModel({ model: modelId })

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
