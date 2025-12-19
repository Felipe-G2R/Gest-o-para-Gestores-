import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout'
import { CampaignButton, NotesEditor, ClientFormModal } from '@/components/clients'
import { useClientsStore } from '@/hooks/useClientsStore'
import { formatCurrency, formatDate } from '@/utils/format'
import type { Client, ClientStatus } from '@/types'
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  CreditCard,
  Banknote,
  DollarSign,
  Calendar,
  Users,
  MessageCircle,
  ExternalLink,
} from 'lucide-react'

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { clients, loading, getClient, updateClient, deleteClient } =
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

  const statusConfig: Record<ClientStatus, { label: string; class: string }> = {
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

        {/* WhatsApp Cards */}
        {(client.whatsappGroup || client.whatsappContact) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grupo do WhatsApp */}
            {client.whatsappGroup && (
              <div className="card bg-success/5 border border-success/20 shadow">
                <div className="card-body">
                  <h3 className="card-title text-base text-success gap-2">
                    <Users className="w-5 h-5" />
                    Grupo do WhatsApp
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <input
                      value={client.whatsappGroup}
                      readOnly
                      className="input input-bordered flex-1 font-mono text-sm"
                    />
                    <a
                      href={client.whatsappGroup}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Abrir Grupo
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Contato WhatsApp */}
            {client.whatsappContact && (
              <div className="card bg-success/5 border border-success/20 shadow">
                <div className="card-body">
                  <h3 className="card-title text-base text-success gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Contato Pessoal
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <input
                      value={client.whatsappContact}
                      readOnly
                      className="input input-bordered flex-1 font-mono text-sm"
                    />
                    <a
                      href={`https://wa.me/${client.whatsappContact.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            )}
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
