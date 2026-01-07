import { useAuthStore } from './useAuthStore'

/**
 * Hook simples para verificar se o usuário atual é admin.
 *
 * @returns true se o usuário é admin, false caso contrário
 *
 * @example
 * function MyComponent() {
 *   const isAdmin = useIsAdmin()
 *
 *   return (
 *     <div>
 *       <h1>Dashboard</h1>
 *       {isAdmin && <button>Excluir Tudo</button>}
 *     </div>
 *   )
 * }
 */
export function useIsAdmin(): boolean {
  const user = useAuthStore((state) => state.user)
  return user?.role === 'admin'
}

/**
 * Hook para obter o role do usuário atual.
 *
 * @returns 'admin' | 'user' | null (null se não estiver logado)
 *
 * @example
 * function MyComponent() {
 *   const role = useUserRole()
 *
 *   if (role === 'admin') {
 *     return <AdminDashboard />
 *   }
 *   return <UserDashboard />
 * }
 */
export function useUserRole(): 'admin' | 'user' | null {
  const user = useAuthStore((state) => state.user)
  return user?.role ?? null
}
