import { useState, useEffect } from 'react'
import type { Client, ClientFormData } from '@/types'
import { useClientsStore } from '@/hooks/useClientsStore'
import { useAuthStore } from '@/hooks/useAuthStore'
import { X, Save, Users, MessageCircle, Instagram, UserCheck } from 'lucide-react'

interface ClientFormModalProps {
  show: boolean
  client: Client | null
  onClose: () => void
}

const initialFormData: ClientFormData = {
  name: '',
  medicalSpecialty: null,
  professionalRegistry: null,
  location: '',
  paymentMethod: 'pix',
  monthlyBudget: 0,
  campaignLink: null,
  whatsappGroup: null,
  whatsappContact: null,
  notes: null,
  status: 'active',
  hasSecretary: false,
  secretaryName: null,
  secretaryPhone: null,
  instagramUrl: null,
}

export function ClientFormModal({ show, client, onClose }: ClientFormModalProps) {
  const [form, setForm] = useState<ClientFormData>(initialFormData)
  const [loading, setLoading] = useState(false)

  const { createClient, updateClient } = useClientsStore()
  const { user, isAdmin } = useAuthStore()

  useEffect(() => {
    if (show && client) {
      setForm({
        name: client.name,
        medicalSpecialty: client.medicalSpecialty,
        professionalRegistry: client.professionalRegistry,
        location: client.location,
        paymentMethod: client.paymentMethod,
        monthlyBudget: client.monthlyBudget,
        campaignLink: client.campaignLink,
        whatsappGroup: client.whatsappGroup,
        whatsappContact: client.whatsappContact,
        notes: client.notes,
        status: client.status,
        hasSecretary: client.hasSecretary || false,
        secretaryName: client.secretaryName,
        secretaryPhone: client.secretaryPhone,
        instagramUrl: client.instagramUrl,
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
      <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
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

            {/* Especialidade Médica */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Especialidade Médica</span>
              </label>
              <input
                type="text"
                value={form.medicalSpecialty || ''}
                onChange={(e) => setForm({ ...form, medicalSpecialty: e.target.value || null })}
                placeholder="Cardiologia, Dermatologia, etc."
                className="input input-bordered"
              />
            </div>

            {/* Registro Profissional */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Registro Profissional</span>
              </label>
              <input
                type="text"
                value={form.professionalRegistry || ''}
                onChange={(e) => setForm({ ...form, professionalRegistry: e.target.value || null })}
                placeholder="CRM 12345-SP"
                className="input input-bordered"
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Ex: CRM 12345-SP, CRO 6789-RJ
                </span>
              </label>
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

            {/* Instagram - Apenas Admin */}
            {isAdmin() && (
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-500" />
                    Instagram
                  </span>
                </label>
                <input
                  type="url"
                  value={form.instagramUrl || ''}
                  onChange={(e) =>
                    setForm({ ...form, instagramUrl: e.target.value || null })
                  }
                  placeholder="https://instagram.com/dra.mariasilva"
                  className="input input-bordered"
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Link completo do perfil do Instagram
                  </span>
                </label>
              </div>
            )}

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

            {/* Grupo do WhatsApp */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-success" />
                  Grupo do WhatsApp
                </span>
              </label>
              <input
                type="url"
                value={form.whatsappGroup || ''}
                onChange={(e) =>
                  setForm({ ...form, whatsappGroup: e.target.value || null })
                }
                placeholder="https://chat.whatsapp.com/..."
                className="input input-bordered"
              />
            </div>

            {/* Contato WhatsApp */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-success" />
                  Contato Pessoal (WhatsApp)
                </span>
              </label>
              <input
                type="tel"
                value={form.whatsappContact || ''}
                onChange={(e) =>
                  setForm({ ...form, whatsappContact: e.target.value || null })
                }
                placeholder="5511999999999 (apenas números com DDD)"
                className="input input-bordered"
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Digite o número com código do país e DDD. Ex: 5511999999999
                </span>
              </label>
            </div>

            {/* Divider - Secretária - Apenas Admin */}
            {isAdmin() && (
              <>
                <div className="md:col-span-2 divider">
                  <span className="flex items-center gap-2 text-sm">
                    <UserCheck className="w-4 h-4" />
                    Informações da Secretária
                  </span>
                </div>

                {/* Tem Secretária */}
                <div className="form-control md:col-span-2">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input
                      type="checkbox"
                      checked={form.hasSecretary}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          hasSecretary: e.target.checked,
                          secretaryName: e.target.checked ? form.secretaryName : null,
                          secretaryPhone: e.target.checked ? form.secretaryPhone : null,
                        })
                      }
                      className="checkbox checkbox-primary"
                    />
                    <span className="label-text font-medium">Possui Secretária</span>
                  </label>
                </div>

                {/* Campos da Secretária (só aparecem se hasSecretary = true) */}
                {form.hasSecretary && (
                  <>
                    {/* Nome da Secretária */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Nome da Secretária</span>
                      </label>
                      <input
                        type="text"
                        value={form.secretaryName || ''}
                        onChange={(e) =>
                          setForm({ ...form, secretaryName: e.target.value || null })
                        }
                        placeholder="Ana Paula"
                        className="input input-bordered"
                      />
                    </div>

                    {/* Telefone da Secretária */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Telefone da Secretária</span>
                      </label>
                      <input
                        type="tel"
                        value={form.secretaryPhone || ''}
                        onChange={(e) =>
                          setForm({ ...form, secretaryPhone: e.target.value || null })
                        }
                        placeholder="5511999999999"
                        className="input input-bordered"
                      />
                    </div>
                  </>
                )}
              </>
            )}

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
                    status: e.target.value as 'active' | 'inactive' | 'paused' | 'seller_on' | 'seller_off',
                  })
                }
                className="select select-bordered"
              >
                <option value="active">Ativo</option>
                <option value="paused">Pausado</option>
                <option value="inactive">Inativo</option>
                <option value="seller_on">Seller/ON</option>
                <option value="seller_off">Seller/OFF</option>
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
