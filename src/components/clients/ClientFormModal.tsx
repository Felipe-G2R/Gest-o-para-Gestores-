import { useState, useEffect } from 'react'
import type { Client, ClientFormData } from '@/types'
import { useClientsStore } from '@/hooks/useClientsStore'
import { useAuthStore } from '@/hooks/useAuthStore'
import { X, Save } from 'lucide-react'

interface ClientFormModalProps {
  show: boolean
  client: Client | null
  onClose: () => void
}

const initialFormData: ClientFormData = {
  name: '',
  location: '',
  paymentMethod: 'pix',
  monthlyBudget: 0,
  campaignLink: null,
  notes: null,
  status: 'active',
}

export function ClientFormModal({ show, client, onClose }: ClientFormModalProps) {
  const [form, setForm] = useState<ClientFormData>(initialFormData)
  const [loading, setLoading] = useState(false)

  const { createClient, updateClient } = useClientsStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (show && client) {
      setForm({
        name: client.name,
        location: client.location,
        paymentMethod: client.paymentMethod,
        monthlyBudget: client.monthlyBudget,
        campaignLink: client.campaignLink,
        notes: client.notes,
        status: client.status,
      })
    } else if (show) {
      setForm(initialFormData)
    }
  }, [show, client])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (client) {
        await updateClient(client.id, form)
      } else {
        await createClient(form, user!.id)
      }
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">
            {client ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Nome *</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Dra. Maria Silva"
                className="input input-bordered"
                required
              />
            </div>

            {/* Localidade */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Localidade *</span>
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="São Paulo, SP"
                className="input input-bordered"
                required
              />
            </div>

            {/* Forma de Pagamento */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Forma de Pagamento *</span>
              </label>
              <select
                value={form.paymentMethod}
                onChange={(e) =>
                  setForm({ ...form, paymentMethod: e.target.value as 'pix' | 'card' })
                }
                className="select select-bordered"
              >
                <option value="pix">PIX</option>
                <option value="card">Cartão</option>
              </select>
            </div>

            {/* Verba Mensal */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Verba Mensal (R$) *</span>
              </label>
              <input
                type="number"
                value={form.monthlyBudget}
                onChange={(e) =>
                  setForm({ ...form, monthlyBudget: parseFloat(e.target.value) || 0 })
                }
                min="0"
                step="0.01"
                placeholder="5000.00"
                className="input input-bordered"
                required
              />
            </div>

            {/* Link da Campanha */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-medium">Link da Campanha</span>
              </label>
              <input
                type="url"
                value={form.campaignLink || ''}
                onChange={(e) =>
                  setForm({ ...form, campaignLink: e.target.value || null })
                }
                placeholder="https://business.facebook.com/..."
                className="input input-bordered"
              />
            </div>

            {/* Status */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Status</span>
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as 'active' | 'inactive' | 'paused',
                  })
                }
                className="select select-bordered"
              >
                <option value="active">Ativo</option>
                <option value="paused">Pausado</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>

          {/* Notas */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Notas / Observações</span>
            </label>
            <textarea
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value || null })}
              placeholder="Detalhes importantes sobre o cliente..."
              className="textarea textarea-bordered h-32"
            />
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancelar
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {!loading && <Save className="w-5 h-5 mr-2" />}
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}
