import { useNavigate } from 'react-router-dom'
import type { Client } from '@/types'
import { useClientsStore } from '@/hooks/useClientsStore'
import { formatCurrency } from '@/utils/format'
import { Eye, Edit, Trash2, ExternalLink, CreditCard, Banknote } from 'lucide-react'

interface ClientTableProps {
  clients: Client[]
  loading: boolean
  onEdit: (client: Client) => void
}

export function ClientTable({ clients, loading, onEdit }: ClientTableProps) {
  const navigate = useNavigate()
  const { deleteClient } = useClientsStore()

  const handleDelete = (client: Client) => {
    if (window.confirm(`Deseja excluir o cliente "${client.name}"?`)) {
      deleteClient(client.id)
    }
  }

  const statusConfig = {
    active: { label: 'Ativo', class: 'badge-success' },
    inactive: { label: 'Inativo', class: 'badge-error' },
    paused: { label: 'Pausado', class: 'badge-warning' },
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Localidade</th>
              <th>Pagamento</th>
              <th>Verba Mensal</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-base-content/60">
                  Nenhum cliente encontrado
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="hover">
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
                  <td>
                    <span className={`badge ${statusConfig[client.status].class}`}>
                      {statusConfig[client.status].label}
                    </span>
                  </td>
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
