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
      // Tenta inserir com todos os campos (incluindo os novos)
      let result = await supabase
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
        })
        .select()
        .single()

      // Se falhar por causa das colunas novas, tenta sem elas
      if (result.error && result.error.message.includes('column')) {
        result = await supabase
          .from('clients')
          .insert({
            user_id: userId,
            name: data.name,
            location: data.location,
            payment_method: data.paymentMethod,
            monthly_budget: data.monthlyBudget,
            campaign_link: data.campaignLink,
            whatsapp_group: data.whatsappGroup,
            whatsapp_contact: data.whatsappContact,
            notes: data.notes,
            status: data.status,
          })
          .select()
          .single()
      }

      if (result.error) throw result.error

      const newClient = mapClient(result.data)
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
      if (data.name) updateData.name = data.name
      if (data.medicalSpecialty !== undefined) updateData.medical_specialty = data.medicalSpecialty
      if (data.professionalRegistry !== undefined) updateData.professional_registry = data.professionalRegistry
      if (data.location !== undefined) updateData.location = data.location
      if (data.paymentMethod) updateData.payment_method = data.paymentMethod
      if (data.monthlyBudget !== undefined) updateData.monthly_budget = data.monthlyBudget
      if (data.campaignLink !== undefined) updateData.campaign_link = data.campaignLink
      if (data.whatsappGroup !== undefined) updateData.whatsapp_group = data.whatsappGroup
      if (data.whatsappContact !== undefined) updateData.whatsapp_contact = data.whatsappContact
      if (data.notes !== undefined) updateData.notes = data.notes
      if (data.status) updateData.status = data.status

      let result = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      // Se falhar por causa das colunas novas, tenta sem elas
      if (result.error && result.error.message.includes('column')) {
        delete updateData.medical_specialty
        delete updateData.professional_registry

        result = await supabase
          .from('clients')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()
      }

      if (result.error) throw result.error

      const updatedClient = mapClient(result.data)
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
