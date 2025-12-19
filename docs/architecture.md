# Arquitetura do Sistema - Gestão para Gestores 1.0

## Visão Geral

O sistema segue uma arquitetura moderna de SPA (Single Page Application) com Vue 3 no frontend e Supabase como BaaS (Backend as a Service).

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Vue 3 + TypeScript                    │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │  Views  │  │Components│  │ Stores  │  │ Router  │    │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│  │                      │                                   │   │
│  │              ┌───────┴───────┐                          │   │
│  │              │ Supabase SDK  │                          │   │
│  │              └───────────────┘                          │   │
│  └─────────────────────┬───────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┼───────────────────────────────────────┐
│                    SUPABASE (BaaS)                              │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │   Authentication    │  │    PostgreSQL DB    │              │
│  │   (GoTrue)          │  │                     │              │
│  └─────────────────────┘  └─────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## Camadas da Aplicação

### 1. Presentation Layer (Views)

Responsável pela renderização das páginas principais:

| View | Rota | Descrição |
|------|------|-----------|
| `LoginView` | `/login` | Tela de autenticação |
| `DashboardView` | `/dashboard` | Painel principal com métricas |
| `ClientsView` | `/clients` | Lista de todos os clientes |
| `ClientDetailView` | `/clients/:id` | Detalhes de um cliente |
| `SettingsView` | `/settings` | Configurações do usuário |

### 2. Component Layer

Componentes reutilizáveis organizados por domínio:

```
components/
├── layout/
│   ├── Sidebar.vue         # Menu lateral
│   ├── Header.vue          # Cabeçalho com usuário
│   └── MainLayout.vue      # Layout principal
├── clients/
│   ├── ClientCard.vue      # Card resumido do cliente
│   ├── ClientForm.vue      # Formulário de cadastro/edição
│   ├── ClientTable.vue     # Tabela de clientes
│   └── CampaignButton.vue  # Botão de acesso à campanha
├── dashboard/
│   ├── StatsCard.vue       # Card de métrica
│   ├── BudgetChart.vue     # Gráfico de verbas
│   └── PaymentPieChart.vue # Pizza de formas de pagamento
└── ui/
    ├── Button.vue          # Botão customizado
    ├── Input.vue           # Input customizado
    ├── Modal.vue           # Modal genérico
    └── Toast.vue           # Notificações
```

### 3. State Management Layer (Pinia)

```typescript
// stores/auth.ts
interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// stores/clients.ts
interface ClientsState {
  clients: Client[]
  selectedClient: Client | null
  loading: boolean
  error: string | null
}

// stores/theme.ts
interface ThemeState {
  mode: 'light' | 'dark'
}
```

### 4. Data Access Layer (Supabase)

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

## Fluxo de Dados

### Autenticação

```
┌──────────┐    1. Login     ┌──────────┐
│  Login   │ ───────────────>│  Auth    │
│   View   │                 │  Store   │
└──────────┘                 └────┬─────┘
                                  │ 2. signIn
                                  v
                            ┌──────────┐
                            │ Supabase │
                            │   Auth   │
                            └────┬─────┘
                                  │ 3. JWT Token
                                  v
                            ┌──────────┐
                            │  Local   │
                            │ Storage  │
                            └──────────┘
```

### CRUD de Clientes

```
┌──────────┐                 ┌──────────┐
│  Client  │ 1. Action       │ Clients  │
│   View   │ ───────────────>│  Store   │
└──────────┘                 └────┬─────┘
     ^                            │ 2. API Call
     │ 5. Re-render               v
     │                      ┌──────────┐
     │                      │ Supabase │
     │                      │    DB    │
     │                      └────┬─────┘
     │                            │ 3. Data
     │                            v
     │                      ┌──────────┐
     └──────────────────────│  State   │
           4. Update        │  Update  │
                            └──────────┘
```

## Roteamento

```typescript
// router/index.ts
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/clients',
    name: 'Clients',
    component: ClientsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/clients/:id',
    name: 'ClientDetail',
    component: ClientDetailView,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: { requiresAuth: true }
  }
]
```

### Guard de Navegação

```typescript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})
```

## Segurança

### Row Level Security (RLS) - Supabase

```sql
-- Política: Usuários só veem seus próprios clientes
CREATE POLICY "Users can only see own clients"
ON clients
FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuários só podem inserir seus próprios clientes
CREATE POLICY "Users can only insert own clients"
ON clients
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários só podem atualizar seus próprios clientes
CREATE POLICY "Users can only update own clients"
ON clients
FOR UPDATE
USING (auth.uid() = user_id);

-- Política: Usuários só podem deletar seus próprios clientes
CREATE POLICY "Users can only delete own clients"
ON clients
FOR DELETE
USING (auth.uid() = user_id);
```

## Performance

### Estratégias de Otimização

1. **Lazy Loading de Rotas**
```typescript
const ClientsView = () => import('@/views/ClientsView.vue')
```

2. **Paginação de Clientes**
```typescript
const { data, count } = await supabase
  .from('clients')
  .select('*', { count: 'exact' })
  .range(0, 9) // 10 por página
```

3. **Cache de Dados**
```typescript
// Usando Pinia para cache local
// Revalidação em background quando necessário
```

## Deploy

### Vercel

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Variáveis de Ambiente (Vercel)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

*Documento atualizado em: 2025-12-18*
