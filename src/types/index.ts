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
  location: string
  paymentMethod: PaymentMethod
  monthlyBudget: number
  campaignLink: string | null
  notes: string | null
  status: ClientStatus
  createdAt: string
  updatedAt: string
}

export type ClientFormData = Omit<Client, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
