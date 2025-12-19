import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout'
import { CampaignButton, NotesEditor, ClientFormModal } from '@/components/clients'
import { useClientsStore } from '@/hooks/useClientsStore'
import { formatCurrency, formatDate } from '@/utils/format'
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  CreditCard,
  Banknote,
  DollarSign,
  Calendar,
} from 'lucide-react'

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { clients, loading, fetchClients, getClient, updateClient, deleteClient } =
    useClientsStore()

  const [client, setClient] = useState<Client | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [fetchingClient, setFetchingClient] = useState(false)

  useEffect(() => {
    const loadClient = async () => {
      if (!id) return
      setFetchingClient(true)
      const data = await getClient(id)
      setClient(data)
      setFetchingClient(false)
    }
    loadClient()
  }, [id, getClient, clients])

  const statusConfig = {
    active: { label: 'Ativo', class: 'badge-success' },
    inactive: { label: 'Inativo', class: 'badge-error' },
    paused: { label: 'Pausado', class: 'badge-warning' },
  }

  const handleSaveNotes = async (notes: string | null) => {
    if (!client) return
    setSavingNotes(true)
    await updateClient(client.id, { notes })
    setSavingNotes(false)
  }

  const handleDelete = async () => {
    if (!client) return
    if (window.confirm(`Deseja excluir o cliente "${client.name}"?`)) {
      await deleteClient(client.id)
      navigate('/clients')
    }
  }

  const goBack = () => navigate('/clients')

  if (loading || fetchingClient) {
    return (
      <MainLayout>
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </MainLayout>
    )
  }

  if (!client) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <p className="text-xl text-base-content/60">Cliente não encontrado</p>
          <button onClick={goBack} className="btn btn-primary mt-4">
            Voltar para lista
          </button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="btn btn-ghost btn-circle">
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{client.name}</h1>
                <span className={`badge ${statusConfig[client.status].class}`}>
                  {statusConfig[client.status].label}
                </span>
              </div>
              <p className="text-base-content/60 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {client.location}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <CampaignButton link={client.campaignLink} size="md" />

            <button
              onClick={() => setShowEditModal(true)}
              className="btn btn-outline gap-2"
            >
              <Edit className="w-5 h-5" />
              Editar
            </button>

            <button onClick={handleDelete} className="btn btn-error btn-outline gap-2">
              <Trash2 className="w-5 h-5" />
              Excluir
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payment Method */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="text-base-content/60 text-sm font-medium">
                Forma de Pagamento
              </h3>
              <div className="flex items-center gap-3 mt-2">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${client.paymentMethod === 'pix' ? 'bg-primary/10' : 'bg-success/10'
                    }`}
                >
                  {client.paymentMethod === 'pix' ? (
                    <Banknote className="w-6 h-6 text-primary" />
                  ) : (
                    <CreditCard className="w-6 h-6 text-success" />
                  )}
                </div>
                <span className="text-2xl font-bold">
                  {client.paymentMethod === 'pix' ? 'PIX' : 'Cartão'}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Budget */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="text-base-content/60 text-sm font-medium">Verba Mensal</h3>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-warning" />
                </div>
                <span className="text-2xl font-bold font-mono">
                  {formatCurrency(client.monthlyBudget)}
                </span>
              </div>
            </div>
          </div>

          {/* Created At */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="text-base-content/60 text-sm font-medium">Cliente Desde</h3>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <span className="text-lg font-medium">
                  {formatDate(client.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Link Card */}
        {client.campaignLink && (
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="card-title text-base">Link da Campanha</h3>
              <div className="flex items-center gap-4 mt-2">
                <input
                  value={client.campaignLink}
                  readOnly
                  className="input input-bordered flex-1 font-mono text-sm"
                />
                <CampaignButton link={client.campaignLink} />
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <NotesEditor
          value={client.notes}
          onSave={handleSaveNotes}
          saving={savingNotes}
        />

        {/* Edit Modal */}
        <ClientFormModal
          show={showEditModal}
          client={client}
          onClose={() => setShowEditModal(false)}
        />
      </div>
    </MainLayout>
  )
}
