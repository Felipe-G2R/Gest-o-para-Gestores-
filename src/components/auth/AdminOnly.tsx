import { ReactNode } from 'react'
import { useAuthStore } from '@/hooks/useAuthStore'

interface AdminOnlyProps {
  children: ReactNode
  fallback?: ReactNode // O que mostrar para usuários não-admin (opcional)
}

/**
 * Componente que renderiza conteúdo apenas para usuários admin.
 *
 * @example
 * // Esconde completamente para usuários comuns
 * <AdminOnly>
 *   <button>Configurações Avançadas</button>
 * </AdminOnly>
 *
 * @example
 * // Mostra mensagem alternativa para usuários comuns
 * <AdminOnly fallback={<p>Acesso restrito</p>}>
 *   <AdminPanel />
 * </AdminOnly>
 */
export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const isAdmin = useAuthStore((state) => state.isAdmin)

  if (!isAdmin()) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Componente inverso: renderiza apenas para usuários NÃO-admin
 */
interface UserOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

export function UserOnly({ children, fallback = null }: UserOnlyProps) {
  const isAdmin = useAuthStore((state) => state.isAdmin)

  if (isAdmin()) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
