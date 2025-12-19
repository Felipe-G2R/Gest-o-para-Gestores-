# Task 04: CRUD de Clientes

**Duração estimada**: 2.5 horas
**Prioridade**: Alta
**Dependências**: Task 03

## Objetivo

Implementar o sistema completo de cadastro, edição, visualização e exclusão de clientes.

## Checklist

### 1. Criar tabela no Supabase

```sql
-- Enums
CREATE TYPE payment_method AS ENUM ('card', 'pix');
CREATE TYPE client_status AS ENUM ('active', 'inactive', 'paused');

-- Tabela de clientes
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'pix',
  monthly_budget DECIMAL(12,2) NOT NULL DEFAULT 0,
  campaign_link TEXT,
  notes TEXT,
  status client_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_status ON clients(status);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients"
ON clients FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own clients"
ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
ON clients FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
ON clients FOR DELETE USING (auth.uid() = user_id);
```

### 2. Criar Types

**src/types/client.ts**:
```typescript
export type PaymentMethod = 'card' | 'pix'
export type ClientStatus = 'active' | 'inactive' | 'paused'

export interface Client {
  id: string
  user_id: string
  name: string
  location: string
  payment_method: PaymentMethod
  monthly_budget: number
  campaign_link: string | null
  notes: string | null
  status: ClientStatus
  created_at: string
  updated_at: string
}

export type ClientInsert = Omit<Client, 'id' | 'created_at' | 'updated_at'>
export type ClientUpdate = Partial<Omit<Client, 'id' | 'user_id' | 'created_at'>>
```

### 3. Criar Clients Store

**src/stores/clients.ts**:
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import type { Client, ClientInsert, ClientUpdate } from '@/types/client'

export const useClientsStore = defineStore('clients', () => {
  const clients = ref<Client[]>([])
  const selectedClient = ref<Client | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()

  // Computed
  const totalClients = computed(() => clients.value.length)
  const activeClients = computed(() =>
    clients.value.filter(c => c.status === 'active').length
  )
  const totalBudget = computed(() =>
    clients.value.reduce((sum, c) => sum + Number(c.monthly_budget), 0)
  )

  // Actions
  async function fetchClients() {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      clients.value = data || []
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchClient(id: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()

      if (err) throw err
      selectedClient.value = data
      return data
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function createClient(client: Omit<ClientInsert, 'user_id'>) {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('clients')
        .insert({
          ...client,
          user_id: authStore.user!.id
        })
        .select()
        .single()

      if (err) throw err

      clients.value.unshift(data)
      return data
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateClient(id: string, updates: ClientUpdate) {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      const index = clients.value.findIndex(c => c.id === id)
      if (index !== -1) {
        clients.value[index] = data
      }
      if (selectedClient.value?.id === id) {
        selectedClient.value = data
      }

      return data
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteClient(id: string) {
    loading.value = true
    error.value = null

    try {
      const { error: err } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (err) throw err

      clients.value = clients.value.filter(c => c.id !== id)
      if (selectedClient.value?.id === id) {
        selectedClient.value = null
      }

      return true
    } catch (e: any) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    clients,
    selectedClient,
    loading,
    error,
    totalClients,
    activeClients,
    totalBudget,
    fetchClients,
    fetchClient,
    createClient,
    updateClient,
    deleteClient
  }
})
```

### 4. Criar ClientsView

**src/views/ClientsView.vue**:
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import ClientTable from '@/components/clients/ClientTable.vue'
import ClientFormModal from '@/components/clients/ClientFormModal.vue'
import { useClientsStore } from '@/stores/clients'
import { Plus, Search } from 'lucide-vue-next'

const clientsStore = useClientsStore()
const showFormModal = ref(false)
const editingClient = ref(null)
const searchQuery = ref('')
const filterPayment = ref<string>('')

onMounted(() => {
  clientsStore.fetchClients()
})

function openCreateModal() {
  editingClient.value = null
  showFormModal.value = true
}

function openEditModal(client: any) {
  editingClient.value = client
  showFormModal.value = true
}

function closeModal() {
  showFormModal.value = false
  editingClient.value = null
}
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between gap-4">
        <div class="flex-1 flex gap-4">
          <!-- Search -->
          <div class="relative flex-1 max-w-md">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar cliente..."
              class="input input-bordered w-full pl-10"
            />
          </div>

          <!-- Filter -->
          <select v-model="filterPayment" class="select select-bordered">
            <option value="">Todos</option>
            <option value="pix">PIX</option>
            <option value="card">Cartão</option>
          </select>
        </div>

        <!-- Add Button -->
        <button @click="openCreateModal" class="btn btn-primary">
          <Plus class="w-5 h-5 mr-2" />
          Novo Cliente
        </button>
      </div>

      <!-- Table -->
      <ClientTable
        :clients="clientsStore.clients"
        :loading="clientsStore.loading"
        :search="searchQuery"
        :filter-payment="filterPayment"
        @edit="openEditModal"
      />

      <!-- Form Modal -->
      <ClientFormModal
        :show="showFormModal"
        :client="editingClient"
        @close="closeModal"
      />
    </div>
  </MainLayout>
</template>
```

### 5. Criar ClientTable

**src/components/clients/ClientTable.vue**:
```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useClientsStore } from '@/stores/clients'
import type { Client } from '@/types/client'
import {
  Eye, Edit, Trash2, ExternalLink, CreditCard, Banknote
} from 'lucide-vue-next'

const props = defineProps<{
  clients: Client[]
  loading: boolean
  search: string
  filterPayment: string
}>()

const emit = defineEmits<{
  edit: [client: Client]
}>()

const router = useRouter()
const clientsStore = useClientsStore()

const filteredClients = computed(() => {
  let result = props.clients

  // Filter by search
  if (props.search) {
    const query = props.search.toLowerCase()
    result = result.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.location.toLowerCase().includes(query)
    )
  }

  // Filter by payment
  if (props.filterPayment) {
    result = result.filter(c => c.payment_method === props.filterPayment)
  }

  return result
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

function viewClient(id: string) {
  router.push(`/clients/${id}`)
}

async function deleteClient(client: Client) {
  if (confirm(`Deseja excluir o cliente "${client.name}"?`)) {
    await clientsStore.deleteClient(client.id)
  }
}
</script>

<template>
  <div class="card bg-base-100 shadow">
    <div class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Localidade</th>
            <th>Pagamento</th>
            <th>Verba Mensal</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading -->
          <tr v-if="loading">
            <td colspan="6" class="text-center py-8">
              <span class="loading loading-spinner loading-lg text-primary"></span>
            </td>
          </tr>

          <!-- Empty -->
          <tr v-else-if="filteredClients.length === 0">
            <td colspan="6" class="text-center py-8 text-base-content/60">
              Nenhum cliente encontrado
            </td>
          </tr>

          <!-- Data -->
          <tr v-else v-for="client in filteredClients" :key="client.id" class="hover">
            <td class="font-medium">{{ client.name }}</td>
            <td>{{ client.location }}</td>
            <td>
              <span
                class="badge gap-1"
                :class="client.payment_method === 'pix' ? 'badge-primary' : 'badge-success'"
              >
                <Banknote v-if="client.payment_method === 'pix'" class="w-3 h-3" />
                <CreditCard v-else class="w-3 h-3" />
                {{ client.payment_method === 'pix' ? 'PIX' : 'Cartão' }}
              </span>
            </td>
            <td class="font-mono">{{ formatCurrency(client.monthly_budget) }}</td>
            <td>
              <span
                class="badge"
                :class="{
                  'badge-success': client.status === 'active',
                  'badge-error': client.status === 'inactive',
                  'badge-warning': client.status === 'paused'
                }"
              >
                {{ client.status === 'active' ? 'Ativo' :
                   client.status === 'inactive' ? 'Inativo' : 'Pausado' }}
              </span>
            </td>
            <td>
              <div class="flex gap-1">
                <!-- View -->
                <button
                  @click="viewClient(client.id)"
                  class="btn btn-ghost btn-sm btn-square"
                  title="Ver detalhes"
                >
                  <Eye class="w-4 h-4" />
                </button>

                <!-- Campaign Link -->
                <a
                  v-if="client.campaign_link"
                  :href="client.campaign_link"
                  target="_blank"
                  class="btn btn-ghost btn-sm btn-square text-primary"
                  title="Abrir campanha"
                >
                  <ExternalLink class="w-4 h-4" />
                </a>

                <!-- Edit -->
                <button
                  @click="emit('edit', client)"
                  class="btn btn-ghost btn-sm btn-square"
                  title="Editar"
                >
                  <Edit class="w-4 h-4" />
                </button>

                <!-- Delete -->
                <button
                  @click="deleteClient(client)"
                  class="btn btn-ghost btn-sm btn-square text-error"
                  title="Excluir"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
```

### 6. Criar ClientFormModal

**src/components/clients/ClientFormModal.vue**:
```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useClientsStore } from '@/stores/clients'
import type { Client } from '@/types/client'
import { X, Save } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  client: Client | null
}>()

const emit = defineEmits<{
  close: []
}>()

const clientsStore = useClientsStore()

const form = ref({
  name: '',
  location: '',
  payment_method: 'pix' as 'pix' | 'card',
  monthly_budget: 0,
  campaign_link: '',
  notes: '',
  status: 'active' as 'active' | 'inactive' | 'paused'
})

const loading = ref(false)

watch(() => props.show, (show) => {
  if (show && props.client) {
    // Edit mode - populate form
    form.value = {
      name: props.client.name,
      location: props.client.location,
      payment_method: props.client.payment_method,
      monthly_budget: props.client.monthly_budget,
      campaign_link: props.client.campaign_link || '',
      notes: props.client.notes || '',
      status: props.client.status
    }
  } else if (show) {
    // Create mode - reset form
    form.value = {
      name: '',
      location: '',
      payment_method: 'pix',
      monthly_budget: 0,
      campaign_link: '',
      notes: '',
      status: 'active'
    }
  }
})

async function handleSubmit() {
  loading.value = true

  try {
    if (props.client) {
      // Update
      await clientsStore.updateClient(props.client.id, form.value)
    } else {
      // Create
      await clientsStore.createClient(form.value)
    }
    emit('close')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="show" class="modal modal-open">
    <div class="modal-box max-w-2xl">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-bold text-lg">
          {{ client ? 'Editar Cliente' : 'Novo Cliente' }}
        </h3>
        <button @click="emit('close')" class="btn btn-ghost btn-sm btn-circle">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Nome -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Nome *</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Dra. Maria Silva"
              class="input input-bordered"
              required
            />
          </div>

          <!-- Localidade -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Localidade *</span>
            </label>
            <input
              v-model="form.location"
              type="text"
              placeholder="São Paulo, SP"
              class="input input-bordered"
              required
            />
          </div>

          <!-- Forma de Pagamento -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Forma de Pagamento *</span>
            </label>
            <select v-model="form.payment_method" class="select select-bordered">
              <option value="pix">PIX</option>
              <option value="card">Cartão</option>
            </select>
          </div>

          <!-- Verba Mensal -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Verba Mensal (R$) *</span>
            </label>
            <input
              v-model.number="form.monthly_budget"
              type="number"
              min="0"
              step="0.01"
              placeholder="5000.00"
              class="input input-bordered"
              required
            />
          </div>

          <!-- Link da Campanha -->
          <div class="form-control md:col-span-2">
            <label class="label">
              <span class="label-text font-medium">Link da Campanha</span>
            </label>
            <input
              v-model="form.campaign_link"
              type="url"
              placeholder="https://business.facebook.com/..."
              class="input input-bordered"
            />
          </div>

          <!-- Status -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Status</span>
            </label>
            <select v-model="form.status" class="select select-bordered">
              <option value="active">Ativo</option>
              <option value="paused">Pausado</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>

        <!-- Notas -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Notas / Observações</span>
          </label>
          <textarea
            v-model="form.notes"
            placeholder="Detalhes importantes sobre o cliente..."
            class="textarea textarea-bordered h-32"
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="modal-action">
          <button type="button" @click="emit('close')" class="btn btn-ghost">
            Cancelar
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :class="{ 'loading': loading }"
            :disabled="loading"
          >
            <Save v-if="!loading" class="w-5 h-5 mr-2" />
            {{ loading ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
    <div class="modal-backdrop" @click="emit('close')"></div>
  </div>
</template>
```

## Critérios de Aceite

- [ ] Tabela clients criada no Supabase
- [ ] RLS configurado corretamente
- [ ] Listagem de clientes funcionando
- [ ] Criação de cliente funcionando
- [ ] Edição de cliente funcionando
- [ ] Exclusão de cliente funcionando
- [ ] Busca por nome funcionando
- [ ] Filtro por pagamento funcionando
- [ ] Botão de acesso à campanha funcionando
- [ ] Visual estilo Facebook

## Próxima Task

→ Task 05: Dashboard com Métricas
