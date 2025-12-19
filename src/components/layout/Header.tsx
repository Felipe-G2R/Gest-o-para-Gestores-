import { useLocation } from 'react-router-dom'
import { useThemeStore } from '@/hooks/useThemeStore'
import { useAuthStore } from '@/hooks/useAuthStore'
import { Sun, Moon, Bell, User } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clients': 'Clientes',
  '/tmi': 'TMI - Tarefa Mais Importante',
  '/settings': 'Configurações',
}

export function Header() {
  const location = useLocation()
  const { theme, toggleTheme } = useThemeStore()
  const { user } = useAuthStore()

  const getPageTitle = () => {
    if (location.pathname.startsWith('/clients/') && location.pathname !== '/clients') {
      return 'Detalhes do Cliente'
    }
    return pageTitles[location.pathname] || 'Página'
  }

  return (
    <header className="h-16 bg-base-100 border-b border-base-300 flex items-center justify-between px-6">
      {/* Page Title */}
      <h1 className="text-xl font-bold">{getPageTitle()}</h1>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="btn btn-ghost btn-circle">
          <Bell className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="btn btn-ghost btn-circle">
          {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Avatar */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-primary-content" />
              )}
            </div>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300 z-50"
          >
            <li>
              <span className="font-medium">{user?.name}</span>
            </li>
            <li>
              <a href="/settings">Configurações</a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}
