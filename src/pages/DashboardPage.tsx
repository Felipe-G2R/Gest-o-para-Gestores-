import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout'
import { StatsCard, PaymentChart, RecentClients } from '@/components/dashboard'
import { useClientsStore } from '@/hooks/useClientsStore'
import { useAuthStore } from '@/hooks/useAuthStore'
import { formatCurrency } from '@/utils/format'
import { Users, DollarSign, UserCheck, TrendingUp, Plus } from 'lucide-react'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    clients,
    fetchClients,
    totalClients,
    activeClients,
    totalBudget,
    clientsByPayment,
  } = useClientsStore()

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const recentClients = useMemo(() => clients.slice(0, 5), [clients])

  const avgBudget = useMemo(() => {
    const total = totalClients()
    if (total === 0) return 'R$ 0,00'
    return formatCurrency(totalBudget() / total)
  }, [totalClients, totalBudget])

  const payment = clientsByPayment()

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              Olá, {user?.name || 'Gestor'}!
            </h2>
            <p className="text-base-content/60">
              Aqui está o resumo do seu squad
            </p>
          </div>

          <button onClick={() => navigate('/clients')} className="btn btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Novo Cliente
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Clientes"
            value={totalClients()}
            icon={Users}
            color="primary"
          />

          <StatsCard
            title="Clientes Ativos"
            value={activeClients()}
            icon={UserCheck}
            color="success"
          />

          <StatsCard
            title="Verba Total"
            value={formatCurrency(totalBudget())}
            icon={DollarSign}
            color="warning"
          />

          <StatsCard
            title="Ticket Médio"
            value={avgBudget}
            icon={TrendingUp}
            color="primary"
          />
        </div>

        {/* Charts & Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Chart */}
          <PaymentChart pixCount={payment.pix} cardCount={payment.card} />

          {/* Recent Clients */}
          <div className="lg:col-span-2">
            <RecentClients clients={recentClients} />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
