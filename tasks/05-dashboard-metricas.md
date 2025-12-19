# Task 05: Dashboard com Métricas

**Duração estimada**: 1.5 horas
**Prioridade**: Média
**Dependências**: Task 04

## Objetivo

Implementar o dashboard principal com métricas e visão geral dos clientes.

## Checklist

### 1. Criar StatsCard Component

**src/components/dashboard/StatsCard.vue**:
```vue
<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  value: string | number
  icon: Component
  color?: 'primary' | 'success' | 'warning' | 'error'
  change?: string
}>()
</script>

<template>
  <div class="card bg-base-100 shadow hover:shadow-lg transition-shadow">
    <div class="card-body">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-base-content/60 text-sm font-medium">{{ title }}</p>
          <p class="text-3xl font-bold mt-1">{{ value }}</p>
          <p v-if="change" class="text-sm mt-1" :class="`text-${color}`">
            {{ change }}
          </p>
        </div>
        <div
          class="w-14 h-14 rounded-xl flex items-center justify-center"
          :class="`bg-${color || 'primary'}/10`"
        >
          <component
            :is="icon"
            class="w-7 h-7"
            :class="`text-${color || 'primary'}`"
          />
        </div>
      </div>
    </div>
  </div>
</template>
```

### 2. Criar PaymentChart Component

**src/components/dashboard/PaymentChart.vue**:
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { CreditCard, Banknote } from 'lucide-vue-next'

const props = defineProps<{
  pixCount: number
  cardCount: number
}>()

const total = computed(() => props.pixCount + props.cardCount)
const pixPercent = computed(() =>
  total.value ? Math.round((props.pixCount / total.value) * 100) : 0
)
const cardPercent = computed(() =>
  total.value ? Math.round((props.cardCount / total.value) * 100) : 0
)
</script>

<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h3 class="card-title text-base">Formas de Pagamento</h3>

      <div class="mt-4 space-y-4">
        <!-- PIX -->
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="flex items-center gap-2">
              <Banknote class="w-4 h-4 text-primary" />
              PIX
            </span>
            <span class="font-medium">{{ pixCount }} ({{ pixPercent }}%)</span>
          </div>
          <progress
            class="progress progress-primary"
            :value="pixPercent"
            max="100"
          ></progress>
        </div>

        <!-- Cartão -->
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="flex items-center gap-2">
              <CreditCard class="w-4 h-4 text-success" />
              Cartão
            </span>
            <span class="font-medium">{{ cardCount }} ({{ cardPercent }}%)</span>
          </div>
          <progress
            class="progress progress-success"
            :value="cardPercent"
            max="100"
          ></progress>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 3. Criar RecentClients Component

**src/components/dashboard/RecentClients.vue**:
```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Client } from '@/types/client'
import { ExternalLink, Eye, CreditCard, Banknote } from 'lucide-vue-next'

defineProps<{
  clients: Client[]
}>()

const router = useRouter()

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}
</script>

<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <div class="flex justify-between items-center mb-4">
        <h3 class="card-title text-base">Clientes Recentes</h3>
        <router-link to="/clients" class="btn btn-ghost btn-sm">
          Ver todos
        </router-link>
      </div>

      <div v-if="clients.length === 0" class="text-center py-8 text-base-content/60">
        Nenhum cliente cadastrado
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="client in clients"
          :key="client.id"
          class="flex items-center justify-between p-3 rounded-lg hover:bg-base-200 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="avatar placeholder">
              <div class="bg-primary text-primary-content rounded-full w-10">
                <span class="text-lg">{{ client.name.charAt(0) }}</span>
              </div>
            </div>
            <div>
              <p class="font-medium">{{ client.name }}</p>
              <p class="text-sm text-base-content/60">{{ client.location }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="text-right">
              <p class="font-mono font-medium">
                {{ formatCurrency(client.monthly_budget) }}
              </p>
              <span
                class="badge badge-sm gap-1"
                :class="client.payment_method === 'pix' ? 'badge-primary' : 'badge-success'"
              >
                <Banknote v-if="client.payment_method === 'pix'" class="w-3 h-3" />
                <CreditCard v-else class="w-3 h-3" />
                {{ client.payment_method === 'pix' ? 'PIX' : 'Cartão' }}
              </span>
            </div>

            <div class="flex gap-1">
              <button
                @click="router.push(`/clients/${client.id}`)"
                class="btn btn-ghost btn-sm btn-square"
              >
                <Eye class="w-4 h-4" />
              </button>
              <a
                v-if="client.campaign_link"
                :href="client.campaign_link"
                target="_blank"
                class="btn btn-ghost btn-sm btn-square text-primary"
              >
                <ExternalLink class="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 4. Atualizar DashboardView

**src/views/DashboardView.vue**:
```vue
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import StatsCard from '@/components/dashboard/StatsCard.vue'
import PaymentChart from '@/components/dashboard/PaymentChart.vue'
import RecentClients from '@/components/dashboard/RecentClients.vue'
import { useClientsStore } from '@/stores/clients'
import { useAuthStore } from '@/stores/auth'
import {
  Users, DollarSign, UserCheck, TrendingUp, Plus
} from 'lucide-vue-next'

const clientsStore = useClientsStore()
const authStore = useAuthStore()

onMounted(() => {
  clientsStore.fetchClients()
})

// Computed metrics
const totalBudgetFormatted = computed(() => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(clientsStore.totalBudget)
})

const pixCount = computed(() =>
  clientsStore.clients.filter(c => c.payment_method === 'pix').length
)
const cardCount = computed(() =>
  clientsStore.clients.filter(c => c.payment_method === 'card').length
)

const recentClients = computed(() =>
  clientsStore.clients.slice(0, 5)
)

const avgBudget = computed(() => {
  if (clientsStore.totalClients === 0) return 'R$ 0,00'
  const avg = clientsStore.totalBudget / clientsStore.totalClients
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(avg)
})
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <!-- Welcome -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold">
            Olá, {{ authStore.user?.profile?.name || 'Gestor' }}!
          </h2>
          <p class="text-base-content/60">
            Aqui está o resumo do seu squad
          </p>
        </div>

        <router-link to="/clients" class="btn btn-primary">
          <Plus class="w-5 h-5 mr-2" />
          Novo Cliente
        </router-link>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Clientes"
          :value="clientsStore.totalClients"
          :icon="Users"
          color="primary"
        />

        <StatsCard
          title="Clientes Ativos"
          :value="clientsStore.activeClients"
          :icon="UserCheck"
          color="success"
        />

        <StatsCard
          title="Verba Total"
          :value="totalBudgetFormatted"
          :icon="DollarSign"
          color="warning"
        />

        <StatsCard
          title="Ticket Médio"
          :value="avgBudget"
          :icon="TrendingUp"
          color="primary"
        />
      </div>

      <!-- Charts & Lists -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Payment Chart -->
        <PaymentChart
          :pix-count="pixCount"
          :card-count="cardCount"
        />

        <!-- Recent Clients -->
        <div class="lg:col-span-2">
          <RecentClients :clients="recentClients" />
        </div>
      </div>
    </div>
  </MainLayout>
</template>
```

## Critérios de Aceite

- [ ] Cards de métricas exibindo dados corretos
- [ ] Gráfico de formas de pagamento funcionando
- [ ] Lista de clientes recentes funcionando
- [ ] Botões de ação nos clientes funcionando
- [ ] Dashboard responsivo
- [ ] Visual estilo Facebook

## Próxima Task

→ Task 06: Visualização Detalhada do Cliente
