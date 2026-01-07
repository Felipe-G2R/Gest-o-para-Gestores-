import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Client, ClientFormData } from '@/types'

interface ClientsState {
  clients: Client[]
  selectedClient: Client | null
  loading: boolean
  error: string | null

  // Computed
  totalClients: () => number
  activeClients: () => number
  totalBudget: () => number
  clientsByPayment: () => { pix: number; card: number }

  // Actions
  fetchClients: () => Promise<void>
  getClient: (id: string) => Promise<Client | null>
  createClient: (data: ClientFormData, userId: string) => Promise<Client | null>
  updateClient: (id: string, data: Partial<ClientFormData>) => Promise<Client | null>
  deleteClient: (id: string) => Promise<boolean>
  setSelectedClient: (client: Client | null) => void
}

const mapClient = (dbClient: any): Client => ({
  id: dbClient.id,
  userId: dbClient.user_id,
  name: dbClient.name,
  medicalSpecialty: dbClient.medical_specialty || null,
  professionalRegistry: dbClient.professional_registry || null,
  location: dbClient.location,
  paymentMethod: dbClient.payment_method,
  monthlyBudget: parseFloat(dbClient.monthly_budget),
  campaignLink: dbClient.campaign_link,
  whatsappGroup: dbClient.whatsapp_group,
  whatsappContact: dbClient.whatsapp_contact,
  notes: dbClient.notes,
  status: dbClient.status,
  hasSecretary: dbClient.has_secretary || false,
  secretaryName: dbClient.secretary_name || null,
  secretaryPhone: dbClient.secretary_phone || null,
  instagramUrl: dbClient.instagram_url || null,
  hasSeller: dbClient.has_seller || false,
  sellerName: dbClient.seller_name || null,
  createdAt: dbClient.created_at,
  updatedAt: dbClient.updated_at,
})

export const useClientsStore = create<ClientsState>((set, get) => ({
  clients: [],
  selectedClient: null,
  loading: false,
  error: null,

  // Computed
  totalClients: () => get().clients.length,
  activeClients: () => get().clients.filter(c => c.status === 'active').length,
  totalBudget: () => get().clients.reduce((sum, c) => sum + (c.monthlyBudget || 0), 0),
  clientsByPayment: () => ({
    pix: get().clients.filter(c => c.paymentMethod === 'pix').length,
    card: get().clients.filter(c => c.paymentMethod === 'card').length
  }),

  // Actions
  fetchClients: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      set({
        clients: (data || []).map(mapClient),
        loading: false
      })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  getClient: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return mapClient(data)
    } catch (error) {
      console.error('Error fetching client:', error)
      return null
    }
  },

  createClient: async (data: ClientFormData, userId: string) => {
    set({ loading: true, error: null })
    try {
      const { data: result, error } = await supabase
        .from('clients')
        .insert({
          user_id: userId,
          name: data.name,
          medical_specialty: data.medicalSpecialty,
          professional_registry: data.professionalRegistry,
          location: data.location,
          payment_method: data.paymentMethod,
          monthly_budget: data.monthlyBudget,
          campaign_link: data.campaignLink,
          whatsapp_group: data.whatsappGroup,
          whatsapp_contact: data.whatsappContact,
          notes: data.notes,
          status: data.status,
          has_secretary: data.hasSecretary,
          secretary_name: data.secretaryName,
          secretary_phone: data.secretaryPhone,
          instagram_url: data.instagramUrl,
          has_seller: data.hasSeller,
          seller_name: data.sellerName,
        })
        .select()
        .single()

      if (error) throw error

      const newClient = mapClient(result)
      set({
        clients: [newClient, ...get().clients],
        loading: false
      })

      return newClient
    } catch (error: any) {
      set({ error: error.message, loading: false })
      return null
    }
  },

  updateClient: async (id: string, data: Partial<ClientFormData>) => {
    set({ loading: true, error: null })
    try {
      const updateData: any = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.medicalSpecialty !== undefined) updateData.medical_specialty = data.medicalSpecialty
      if (data.professionalRegistry !== undefined) updateData.professional_registry = data.professionalRegistry
      if (data.location !== undefined) updateData.location = data.location
      if (data.paymentMethod !== undefined) updateData.payment_method = data.paymentMethod
      if (data.monthlyBudget !== undefined) updateData.monthly_budget = data.monthlyBudget
      if (data.campaignLink !== undefined) updateData.campaign_link = data.campaignLink
      if (data.whatsappGroup !== undefined) updateData.whatsapp_group = data.whatsappGroup
      if (data.whatsappContact !== undefined) updateData.whatsapp_contact = data.whatsappContact
      if (data.notes !== undefined) updateData.notes = data.notes
      if (data.status !== undefined) updateData.status = data.status
      if (data.hasSecretary !== undefined) updateData.has_secretary = data.hasSecretary
      if (data.secretaryName !== undefined) updateData.secretary_name = data.secretaryName
      if (data.secretaryPhone !== undefined) updateData.secretary_phone = data.secretaryPhone
      if (data.instagramUrl !== undefined) updateData.instagram_url = data.instagramUrl
      if (data.hasSeller !== undefined) updateData.has_seller = data.hasSeller
      if (data.sellerName !== undefined) updateData.seller_name = data.sellerName

      const { data: result, error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const updatedClient = mapClient(result)
      const updatedClients = get().clients.map(c => c.id === id ? updatedClient : c)

      set({
        clients: updatedClients,
        loading: false
      })

      if (get().selectedClient?.id === id) {
        set({ selectedClient: updatedClient })
      }

      return updatedClient
    } catch (error: any) {
      set({ error: error.message, loading: false })
      return null
    }
  },

  deleteClient: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (error) throw error

      set({
        clients: get().clients.filter(c => c.id !== id),
        loading: false
      })

      if (get().selectedClient?.id === id) {
        set({ selectedClient: null })
      }

      return true
    } catch (error: any) {
      set({ error: error.message, loading: false })
      return false
    }
  },

  setSelectedClient: (client: Client | null) => {
    set({ selectedClient: client })
  }
}))
