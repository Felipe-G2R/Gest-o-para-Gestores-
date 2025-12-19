import { useState, useEffect, useMemo } from 'react'
import { MainLayout } from '@/components/layout'
import { ClientTable, ClientFormModal } from '@/components/clients'
import { useClientsStore } from '@/hooks/useClientsStore'
import type { Client } from '@/types'
import { Plus, Search } from 'lucide-react'

export function ClientsPage() {
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPayment, setFilterPayment] = useState('')

  const { clients, loading, fetchClients } = useClientsStore()

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const filteredClients = useMemo(() => {
    let result = clients

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.location.toLowerCase().includes(query)
      )
    }

    // Filter by payment
    if (filterPayment) {
      result = result.filter((c) => c.paymentMethod === filterPayment)
    }

    return result
  }, [clients, searchQuery, filterPayment])

  const openCreateModal = () => {
    setEditingClient(null)
    setShowFormModal(true)
  }

  const openEditModal = (client: Client) => {
    setEditingClient(client)
    setShowFormModal(true)
  }

  const closeModal = () => {
    setShowFormModal(false)
    setEditingClient(null)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex-1 flex gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cliente..."
                className="input input-bordered w-full pl-10"
              />
            </div>

            {/* Filter */}
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="select select-bordered"
            >
              <option value="">Todos</option>
              <option value="pix">PIX</option>
              <option value="card">Cartão</option>
            </select>
          </div>

          {/* Add Button */}
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Novo Cliente
          </button>
        </div>

        {/* Table */}
        <ClientTable
          clients={filteredClients}
          loading={loading}
          onEdit={openEditModal}
        />

        {/* Form Modal */}
        <ClientFormModal
          show={showFormModal}
          client={editingClient}
          onClose={closeModal}
        />
      </div>
    </MainLayout>
  )
}
