import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/hooks/useAuthStore'
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Target,
  Bot,
  BookOpen,
  Calendar,
  Rat,
} from 'lucide-react'

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, adminOnly: false },
  { name: 'Clientes', path: '/clients', icon: Users, adminOnly: false },
  { name: 'TMI', path: '/tmi', icon: Target, adminOnly: false },
  { name: 'Diário de Bordo', path: '/diary', icon: BookOpen, adminOnly: false },
  { name: 'Calendário', path: '/calendar', icon: Calendar, adminOnly: false },
  { name: 'Gerenc[IA]', path: '/gerencia', icon: Bot, adminOnly: false },
  { name: 'Rataria', path: '/rataria', icon: Rat, adminOnly: false },
  { name: 'Configurações', path: '/settings', icon: Settings, adminOnly: false },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, signOut, isAdmin } = useAuthStore()
  const navigate = useNavigate()

  // Filtra os itens do menu baseado no role do usuário
  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin())

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside
      className={`bg-base-100 border-r border-base-300 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-base-300">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg">Gerenc<span className="text-primary">[IA]</span></span>
          </div>
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mx-auto">
            <Bot className="w-6 h-6 text-white" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`btn btn-ghost btn-sm btn-circle ${collapsed ? 'absolute right-2' : ''}`}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                ? 'bg-primary text-primary-content'
                : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-base-300">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-base-300 bg-base-200 flex items-center justify-center">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-base-content/20" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.name || 'Usuário'}</p>
              <p className="text-xs text-base-content/60 truncate">{user?.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-error hover:bg-error/10 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  )
}
