import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Client } from '@/types'
import { useClientsStore } from '@/hooks/useClientsStore'
import { useAuthStore } from '@/hooks/useAuthStore'
import { formatCurrency } from '@/utils/format'
import { Eye, Edit, Trash2, ExternalLink, CreditCard, Banknote, Instagram, GripVertical } from 'lucide-react'

interface ClientTableProps {
  clients: Client[]
  loading: boolean
  onEdit: (client: Client) => void
}

export function ClientTable({ clients, loading, onEdit }: ClientTableProps) {
  const navigate = useNavigate()
  const { deleteClient, reorderClients } = useClientsStore()
  const isAdmin = useAuthStore((state) => state.isAdmin)

  // Estados para drag-and-drop
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const handleDelete = (client: Client) => {
    if (window.confirm(`Deseja excluir o cliente "${client.name}"?`)) {
      deleteClient(client.id)
    }
  }

  // Handlers de drag-and-drop (apenas para admin)
  const handleDragStart = (e: React.DragEvent, clientId: string) => {
    setDraggedId(clientId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', clientId)
  }

  const handleDragOver = (e: React.DragEvent, clientId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (clientId !== draggedId) {
      setDragOverId(clientId)
    }
  }

  const handleDragLeave = () => {
    setDragOverId(null)
  }

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    setDragOverId(null)

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null)
      return
    }

    // Calcular nova ordem
    const currentIds = clients.map(c => c.id)
    const draggedIndex = currentIds.indexOf(draggedId)
    const targetIndex = currentIds.indexOf(targetId)

    // Remover item arrastado e inserir na nova posição
    const newIds = [...currentIds]
    newIds.splice(draggedIndex, 1)
    newIds.splice(targetIndex, 0, draggedId)

    await reorderClients(newIds)
    setDraggedId(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverId(null)
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              {isAdmin() && <th className="w-10"></th>}
              <th>Nome</th>
              <th>Localidade</th>
              <th>Pagamento</th>
              <th>Verba Mensal</th>
              {isAdmin() && <th>Secretária</th>}
              {isAdmin() && <th>Instagram</th>}
              {isAdmin() && <th>Seller</th>}
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isAdmin() ? 9 : 5} className="text-center py-8">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={isAdmin() ? 9 : 5} className="text-center py-8 text-base-content/60">
                  Nenhum cliente encontrado
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr
                  key={client.id}
                  className={`hover transition-all ${
                    draggedId === client.id ? 'opacity-50' : ''
                  } ${
                    dragOverId === client.id ? 'bg-primary/10 border-t-2 border-primary' : ''
                  }`}
                  onDragOver={isAdmin() ? (e) => handleDragOver(e, client.id) : undefined}
                  onDragLeave={isAdmin() ? handleDragLeave : undefined}
                  onDrop={isAdmin() ? (e) => handleDrop(e, client.id) : undefined}
                >
                  {isAdmin() && (
                    <td className="w-10">
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, client.id)}
                        onDragEnd={handleDragEnd}
                        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-base-200"
                      >
                        <GripVertical className="w-4 h-4 text-base-content/40 hover:text-base-content/70" />
                      </div>
                    </td>
                  )}
                  <td>
                    <div className="flex flex-col">
                      <span className="font-medium">{client.name}</span>
                      {client.medicalSpecialty && (
                        <span className="text-xs text-primary">
                          {client.medicalSpecialty}
                          {client.professionalRegistry && ` • ${client.professionalRegistry}`}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{client.location}</td>
                  <td>
                    <span
                      className={`badge gap-1 ${
                        client.paymentMethod === 'pix' ? 'badge-primary' : 'badge-success'
                      }`}
                    >
                      {client.paymentMethod === 'pix' ? (
                        <Banknote className="w-3 h-3" />
                      ) : (
                        <CreditCard className="w-3 h-3" />
                      )}
                      {client.paymentMethod === 'pix' ? 'PIX' : 'Cartão'}
                    </span>
                  </td>
                  <td className="font-mono">{formatCurrency(client.monthlyBudget)}</td>
                  {isAdmin() && (
                    <td>
                      <div className="flex flex-col items-start gap-1">
                        <span className={`badge ${client.hasSecretary ? 'badge-success' : 'badge-ghost'}`}>
                          {client.hasSecretary ? 'Sim' : 'Não'}
                        </span>
                        {client.hasSecretary && client.secretaryName && (
                          <span className="text-xs text-base-content/70">{client.secretaryName}</span>
                        )}
                      </div>
                    </td>
                  )}
                  {isAdmin() && (
                    <td>
                      {client.instagramUrl ? (
                        <a
                          href={client.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-circle btn-sm bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 border-0 text-white hover:opacity-80"
                          title="Abrir Instagram"
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-base-content/30">-</span>
                      )}
                    </td>
                  )}
                  {isAdmin() && (
                    <td>
                      <div className="flex flex-col items-start gap-1">
                        <span className={`badge ${client.hasSeller ? 'badge-success' : 'badge-ghost'}`}>
                          {client.hasSeller ? 'Sim' : 'Não'}
                        </span>
                        {client.hasSeller && client.sellerName && (
                          <span className="text-xs text-base-content/70">{client.sellerName}</span>
                        )}
                      </div>
                    </td>
                  )}
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => navigate(`/clients/${client.id}`)}
                        className="btn btn-ghost btn-sm btn-square"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {client.campaignLink && (
                        <a
                          href={client.campaignLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm btn-square text-primary"
                          title="Abrir campanha"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        onClick={() => onEdit(client)}
                        className="btn btn-ghost btn-sm btn-square"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(client)}
                        className="btn btn-ghost btn-sm btn-square text-error"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
