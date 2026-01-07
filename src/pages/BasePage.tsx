import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout'
import { useAuthStore } from '@/hooks/useAuthStore'
import { Database, Shield, Users, FileText, Settings } from 'lucide-react'

export function BasePage() {
  const { isAdmin } = useAuthStore()
  const navigate = useNavigate()

  // Redireciona se não for admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard')
    }
  }, [isAdmin, navigate])

  // Não renderiza nada se não for admin (enquanto redireciona)
  if (!isAdmin()) {
    return null
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Database className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">BASE</h1>
            <p className="text-base-content/60">Painel de Administração</p>
          </div>
        </div>

        {/* Admin Badge */}
        <div className="alert alert-info">
          <Shield className="w-5 h-5" />
          <span>Você está acessando a área de administração. Apenas administradores podem ver esta página.</span>
        </div>

        {/* Cards de Administração */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card - Gerenciar Usuários */}
          <div className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h2 className="card-title text-lg">Usuários</h2>
              </div>
              <p className="text-base-content/60 text-sm mt-2">
                Gerencie os usuários do sistema, altere permissões e roles.
              </p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary btn-sm" disabled>
                  Em breve
                </button>
              </div>
            </div>
          </div>

          {/* Card - Relatórios */}
          <div className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <FileText className="w-6 h-6 text-secondary" />
                </div>
                <h2 className="card-title text-lg">Relatórios</h2>
              </div>
              <p className="text-base-content/60 text-sm mt-2">
                Visualize relatórios completos de todos os clientes e métricas.
              </p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-secondary btn-sm" disabled>
                  Em breve
                </button>
              </div>
            </div>
          </div>

          {/* Card - Configurações do Sistema */}
          <div className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Settings className="w-6 h-6 text-accent" />
                </div>
                <h2 className="card-title text-lg">Sistema</h2>
              </div>
              <p className="text-base-content/60 text-sm mt-2">
                Configurações avançadas do sistema e integrações.
              </p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-accent btn-sm" disabled>
                  Em breve
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="font-semibold">Funcionalidades exclusivas para Admin:</h3>
            <ul className="list-disc list-inside text-base-content/70 space-y-1 mt-2">
              <li>Visualizar e editar informações de secretária dos clientes</li>
              <li>Ver e adicionar links do Instagram das doutoras</li>
              <li>Acesso a esta página de administração (BASE)</li>
              <li>Mais funcionalidades em breve...</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
