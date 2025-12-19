# Task 03: Layout com Sidebar

**Duração estimada**: 1 hora
**Prioridade**: Alta
**Dependências**: Task 02

## Objetivo

Criar o layout principal com menu lateral (sidebar) navegável, estilo app moderno.

## Checklist

### 1. Criar MainLayout

**src/components/layout/MainLayout.vue**:
```vue
<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
</script>

<template>
  <div class="flex h-screen bg-base-200">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <Header />

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
```

### 2. Criar Sidebar

**src/components/layout/Sidebar.vue**:
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import { ref } from 'vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const collapsed = ref(false)

const menuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Clientes',
    path: '/clients',
    icon: Users
  },
  {
    name: 'Configurações',
    path: '/settings',
    icon: Settings
  }
]

const isActive = (path: string) => route.path === path || route.path.startsWith(path + '/')

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <aside
    class="bg-base-100 border-r border-base-300 flex flex-col transition-all duration-300"
    :class="collapsed ? 'w-20' : 'w-64'"
  >
    <!-- Logo -->
    <div class="h-16 flex items-center justify-between px-4 border-b border-base-300">
      <div v-if="!collapsed" class="flex items-center gap-2">
        <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <span class="text-lg font-bold text-white">GG</span>
        </div>
        <span class="font-bold text-lg">Gestão</span>
      </div>
      <div v-else class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mx-auto">
        <span class="text-lg font-bold text-white">GG</span>
      </div>

      <!-- Collapse Button -->
      <button
        @click="collapsed = !collapsed"
        class="btn btn-ghost btn-sm btn-circle"
        :class="{ 'absolute right-2': collapsed }"
      >
        <ChevronLeft v-if="!collapsed" class="w-5 h-5" />
        <ChevronRight v-else class="w-5 h-5" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4 space-y-2">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
        :class="[
          isActive(item.path)
            ? 'bg-primary text-primary-content'
            : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
        ]"
      >
        <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
        <span v-if="!collapsed" class="font-medium">{{ item.name }}</span>
      </router-link>
    </nav>

    <!-- User Info & Logout -->
    <div class="p-4 border-t border-base-300">
      <div v-if="!collapsed" class="mb-3">
        <p class="font-medium text-sm truncate">
          {{ authStore.user?.profile?.name || 'Usuário' }}
        </p>
        <p class="text-xs text-base-content/60 truncate">
          {{ authStore.user?.email }}
        </p>
      </div>

      <button
        @click="handleLogout"
        class="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-error hover:bg-error/10 transition-colors"
      >
        <LogOut class="w-5 h-5 flex-shrink-0" />
        <span v-if="!collapsed" class="font-medium">Sair</span>
      </button>
    </div>
  </aside>
</template>
```

### 3. Criar Header

**src/components/layout/Header.vue**:
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { Sun, Moon, Bell, User } from 'lucide-vue-next'

const route = useRoute()
const themeStore = useThemeStore()
const authStore = useAuthStore()

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/clients': 'Clientes',
    '/settings': 'Configurações'
  }

  // Check for client detail page
  if (route.path.startsWith('/clients/') && route.params.id) {
    return 'Detalhes do Cliente'
  }

  return titles[route.path] || 'Página'
})

const isDark = computed(() => themeStore.theme === 'dark')
</script>

<template>
  <header class="h-16 bg-base-100 border-b border-base-300 flex items-center justify-between px-6">
    <!-- Page Title -->
    <h1 class="text-xl font-bold">{{ pageTitle }}</h1>

    <!-- Actions -->
    <div class="flex items-center gap-2">
      <!-- Notifications -->
      <button class="btn btn-ghost btn-circle">
        <Bell class="w-5 h-5" />
      </button>

      <!-- Theme Toggle -->
      <button @click="themeStore.toggleTheme" class="btn btn-ghost btn-circle">
        <Sun v-if="!isDark" class="w-5 h-5" />
        <Moon v-else class="w-5 h-5" />
      </button>

      <!-- User Avatar -->
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full bg-primary flex items-center justify-center">
            <User class="w-5 h-5 text-primary-content" />
          </div>
        </label>
        <ul tabindex="0" class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300">
          <li>
            <span class="font-medium">{{ authStore.user?.profile?.name }}</span>
          </li>
          <li>
            <router-link to="/settings">Configurações</router-link>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>
```

### 4. Atualizar App.vue

**src/App.vue**:
```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.init()
})
</script>

<template>
  <router-view />
</template>
```

### 5. Criar DashboardView com Layout

**src/views/DashboardView.vue**:
```vue
<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue'
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <h2 class="text-2xl font-bold">Bem-vindo ao Dashboard!</h2>
      <p class="text-base-content/60">
        Aqui você terá uma visão geral dos seus clientes.
      </p>

      <!-- Placeholder cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title text-primary">Total de Clientes</h3>
            <p class="text-3xl font-bold">0</p>
          </div>
        </div>

        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title text-success">Verba Total</h3>
            <p class="text-3xl font-bold">R$ 0,00</p>
          </div>
        </div>

        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title text-warning">Clientes Ativos</h3>
            <p class="text-3xl font-bold">0</p>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
```

### 6. Atualizar Rotas

**src/router/index.ts**:
```typescript
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/clients',
    name: 'Clients',
    component: () => import('@/views/ClientsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/clients/:id',
    name: 'ClientDetail',
    component: () => import('@/views/ClientDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true }
  }
]
```

## Critérios de Aceite

- [ ] Sidebar com navegação funcional
- [ ] Sidebar colapsável
- [ ] Header com título da página dinâmico
- [ ] Toggle de tema no header
- [ ] Logout funcional
- [ ] Indicador visual de página ativa
- [ ] Layout responsivo
- [ ] Visual estilo Facebook

## Próxima Task

→ Task 04: CRUD de Clientes
