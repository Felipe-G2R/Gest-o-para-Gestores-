export type PaymentMethod = 'card' | 'pix'
export type ClientStatus = 'active' | 'inactive' | 'paused'
export type UserRole = 'admin' | 'user'

export interface User {
  id: string
  email: string
  name: string
  fullName?: string
  avatarUrl?: string | null
  role: UserRole
  createdAt: string
}

export interface Client {
  id: string
  userId: string
  name: string
  medicalSpecialty: string | null
  professionalRegistry: string | null
  location: string
  paymentMethod: PaymentMethod
  monthlyBudget: number
  campaignLink: string | null
  whatsappGroup: string | null
  whatsappContact: string | null
  notes: string | null
  status: ClientStatus
  createdAt: string
  updatedAt: string
}

export type ClientFormData = Omit<Client, 'id' | 'userId' | 'createdAt' | 'updatedAt'>

// Task Types
export type TaskStatus = 'done' | 'not_done' | 'pending'
export type TaskPriority = 'urgent' | 'important' | 'normal'

export interface Task {
  id: string
  userId: string
  title: string
  description: string | null
  dueDate: string
  status: TaskStatus
  priority: TaskPriority
  isUrgent: boolean
  createdAt: string
  updatedAt: string
}

export type TaskFormData = Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>

// Chat Types
export interface ChatMessage {
  id: string
  sessionId: string
  role: 'user' | 'model'
  content: string
  imageUrl?: string | null
  modelId: string
  createdAt: string
}

export interface ChatSession {
  id: string
  userId: string
  title: string
  modelId: string
  createdAt: string
  updatedAt: string
}

// Diary Types
export interface DiaryEntry {
  id: string
  userId: string
  date: string // YYYY-MM-DD
  title: string | null
  content: string | null
  createdAt: string
  updatedAt: string
}

export type DiaryEntryFormData = Omit<DiaryEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
