import { useNavigate } from 'react-router-dom'
import type { Client } from '@/types'
import { formatCurrency } from '@/utils/format'
import { ExternalLink, Eye, CreditCard, Banknote } from 'lucide-react'

interface RecentClientsProps {
  clients: Client[]
}

export function RecentClients({ clients }: RecentClientsProps) {
  const navigate = useNavigate()

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h3 className="card-title text-base">Clientes Recentes</h3>
          <button onClick={() => navigate('/clients')} className="btn btn-ghost btn-sm">
            Ver todos
          </button>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-8 text-base-content/60">
            Nenhum cliente cadastrado
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content rounded-full w-10">
                      <span className="text-lg">{client.name.charAt(0)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-base-content/60">{client.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-mono font-medium">
                      {formatCurrency(client.monthlyBudget)}
                    </p>
                    <span
                      className={`badge badge-sm gap-1 ${
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
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => navigate(`/clients/${client.id}`)}
                      className="btn btn-ghost btn-sm btn-square"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {client.campaignLink && (
                      <a
                        href={client.campaignLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm btn-square text-primary"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
