# Task 06: Visualização Detalhada do Cliente

**Duração estimada**: 1 hora
**Prioridade**: Média
**Dependências**: Task 04

## Objetivo

Implementar a tela de detalhes do cliente com todas as informações, botão de acesso à campanha e editor de notas.

## Checklist

### 1. Criar CampaignButton Component

**src/components/clients/CampaignButton.vue**:
```vue
<script setup lang="ts">
import { ExternalLink } from 'lucide-vue-next'

defineProps<{
  link: string | null
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <a
    v-if="link"
    :href="link"
    target="_blank"
    rel="noopener noreferrer"
    class="btn btn-primary gap-2"
    :class="{
      'btn-sm': size === 'sm',
      'btn-lg': size === 'lg'
    }"
  >
    <ExternalLink class="w-5 h-5" />
    Acessar Campanha
  </a>
  <button
    v-else
    class="btn btn-disabled gap-2"
    :class="{
      'btn-sm': size === 'sm',
      'btn-lg': size === 'lg'
    }"
    disabled
  >
    <ExternalLink class="w-5 h-5" />
    Sem Link
  </button>
</template>
```

### 2. Criar NotesEditor Component

**src/components/clients/NotesEditor.vue**:
```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { Save, FileText } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string | null
  saving?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  save: []
}>()

const localValue = ref(props.modelValue || '')
const hasChanges = ref(false)

watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal || ''
  hasChanges.value = false
})

function handleInput() {
  hasChanges.value = localValue.value !== (props.modelValue || '')
  emit('update:modelValue', localValue.value)
}

function handleSave() {
  emit('save')
  hasChanges.value = false
}
</script>

<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <div class="flex justify-between items-center mb-4">
        <h3 class="card-title text-base gap-2">
          <FileText class="w-5 h-5" />
          Notas e Observações
        </h3>
        <button
          v-if="hasChanges"
          @click="handleSave"
          class="btn btn-primary btn-sm gap-2"
          :class="{ 'loading': saving }"
          :disabled="saving"
        >
          <Save v-if="!saving" class="w-4 h-4" />
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>

      <textarea
        v-model="localValue"
        @input="handleInput"
        placeholder="Adicione notas e observações importantes sobre este cliente..."
        class="textarea textarea-bordered w-full h-48 resize-none"
      ></textarea>

      <p v-if="hasChanges" class="text-sm text-warning mt-2">
        * Alterações não salvas
      </p>
    </div>
  </div>
</template>
```

### 3. Criar ClientDetailView

**src/views/ClientDetailView.vue**:
```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import CampaignButton from '@/components/clients/CampaignButton.vue'
import NotesEditor from '@/components/clients/NotesEditor.vue'
import ClientFormModal from '@/components/clients/ClientFormModal.vue'
import { useClientsStore } from '@/stores/clients'
import {
  ArrowLeft, Edit, Trash2, MapPin, CreditCard, Banknote,
  DollarSign, Calendar, Clock
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const clientsStore = useClientsStore()

const showEditModal = ref(false)
const savingNotes = ref(false)

onMounted(async () => {
  const id = route.params.id as string
  await clientsStore.fetchClient(id)
})

const client = computed(() => clientsStore.selectedClient)

const formattedBudget = computed(() => {
  if (!client.value) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(client.value.monthly_budget)
})

const formattedDate = computed(() => {
  if (!client.value) return ''
  return new Date(client.value.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
})

const statusConfig = computed(() => {
  if (!client.value) return { label: '', class: '' }

  const configs = {
    active: { label: 'Ativo', class: 'badge-success' },
    inactive: { label: 'Inativo', class: 'badge-error' },
    paused: { label: 'Pausado', class: 'badge-warning' }
  }

  return configs[client.value.status]
})

async function saveNotes() {
  if (!client.value) return

  savingNotes.value = true
  await clientsStore.updateClient(client.value.id, {
    notes: client.value.notes
  })
  savingNotes.value = false
}

async function deleteClient() {
  if (!client.value) return

  if (confirm(`Deseja excluir o cliente "${client.value.name}"?`)) {
    await clientsStore.deleteClient(client.value.id)
    router.push('/clients')
  }
}

function goBack() {
  router.push('/clients')
}
</script>

<template>
  <MainLayout>
    <!-- Loading -->
    <div v-if="clientsStore.loading" class="flex justify-center py-20">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Not Found -->
    <div v-else-if="!client" class="text-center py-20">
      <p class="text-xl text-base-content/60">Cliente não encontrado</p>
      <button @click="goBack" class="btn btn-primary mt-4">
        Voltar para lista
      </button>
    </div>

    <!-- Content -->
    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="btn btn-ghost btn-circle">
            <ArrowLeft class="w-6 h-6" />
          </button>

          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold">{{ client.name }}</h1>
              <span class="badge" :class="statusConfig.class">
                {{ statusConfig.label }}
              </span>
            </div>
            <p class="text-base-content/60 flex items-center gap-1 mt-1">
              <MapPin class="w-4 h-4" />
              {{ client.location }}
            </p>
          </div>
        </div>

        <div class="flex gap-2">
          <CampaignButton :link="client.campaign_link" size="md" />

          <button @click="showEditModal = true" class="btn btn-outline gap-2">
            <Edit class="w-5 h-5" />
            Editar
          </button>

          <button @click="deleteClient" class="btn btn-error btn-outline gap-2">
            <Trash2 class="w-5 h-5" />
            Excluir
          </button>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Payment Method -->
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="text-base-content/60 text-sm font-medium">
              Forma de Pagamento
            </h3>
            <div class="flex items-center gap-3 mt-2">
              <div
                class="w-12 h-12 rounded-lg flex items-center justify-center"
                :class="client.payment_method === 'pix' ? 'bg-primary/10' : 'bg-success/10'"
              >
                <Banknote
                  v-if="client.payment_method === 'pix'"
                  class="w-6 h-6 text-primary"
                />
                <CreditCard v-else class="w-6 h-6 text-success" />
              </div>
              <span class="text-2xl font-bold">
                {{ client.payment_method === 'pix' ? 'PIX' : 'Cartão' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Monthly Budget -->
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="text-base-content/60 text-sm font-medium">
              Verba Mensal
            </h3>
            <div class="flex items-center gap-3 mt-2">
              <div class="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <DollarSign class="w-6 h-6 text-warning" />
              </div>
              <span class="text-2xl font-bold font-mono">
                {{ formattedBudget }}
              </span>
            </div>
          </div>
        </div>

        <!-- Created At -->
        <div class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="text-base-content/60 text-sm font-medium">
              Cliente Desde
            </h3>
            <div class="flex items-center gap-3 mt-2">
              <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar class="w-6 h-6 text-primary" />
              </div>
              <span class="text-lg font-medium">
                {{ formattedDate }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Campaign Link Card -->
      <div v-if="client.campaign_link" class="card bg-base-100 shadow">
        <div class="card-body">
          <h3 class="card-title text-base">Link da Campanha</h3>
          <div class="flex items-center gap-4 mt-2">
            <input
              :value="client.campaign_link"
              readonly
              class="input input-bordered flex-1 font-mono text-sm"
            />
            <CampaignButton :link="client.campaign_link" />
          </div>
        </div>
      </div>

      <!-- Notes -->
      <NotesEditor
        v-model="client.notes"
        :saving="savingNotes"
        @save="saveNotes"
      />

      <!-- Edit Modal -->
      <ClientFormModal
        :show="showEditModal"
        :client="client"
        @close="showEditModal = false"
      />
    </div>
  </MainLayout>
</template>
```

### 4. Criar SettingsView (Placeholder)

**src/views/SettingsView.vue**:
```vue
<script setup lang="ts">
import { ref } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { User, Moon, Sun, Save } from 'lucide-vue-next'

const authStore = useAuthStore()
const themeStore = useThemeStore()

const name = ref(authStore.user?.profile?.name || '')
const saving = ref(false)

async function handleSave() {
  saving.value = true
  // TODO: Implement profile update
  setTimeout(() => {
    saving.value = false
  }, 1000)
}
</script>

<template>
  <MainLayout>
    <div class="max-w-2xl mx-auto space-y-6">
      <h2 class="text-2xl font-bold">Configurações</h2>

      <!-- Profile -->
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h3 class="card-title gap-2">
            <User class="w-5 h-5" />
            Perfil
          </h3>

          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text font-medium">Nome</span>
            </label>
            <input
              v-model="name"
              type="text"
              class="input input-bordered"
            />
          </div>

          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text font-medium">Email</span>
            </label>
            <input
              :value="authStore.user?.email"
              type="email"
              class="input input-bordered"
              disabled
            />
          </div>

          <div class="card-actions justify-end mt-4">
            <button
              @click="handleSave"
              class="btn btn-primary gap-2"
              :class="{ 'loading': saving }"
              :disabled="saving"
            >
              <Save v-if="!saving" class="w-5 h-5" />
              {{ saving ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Theme -->
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h3 class="card-title gap-2">
            <Sun v-if="themeStore.theme === 'light'" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
            Tema
          </h3>

          <div class="form-control mt-4">
            <label class="label cursor-pointer">
              <span class="label-text">Modo Escuro</span>
              <input
                type="checkbox"
                class="toggle toggle-primary"
                :checked="themeStore.theme === 'dark'"
                @change="themeStore.toggleTheme"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
```

## Critérios de Aceite

- [ ] Página de detalhes exibindo todas as informações
- [ ] Botão "Acessar Campanha" funcionando (abre em nova aba)
- [ ] Editor de notas com salvamento
- [ ] Botão de editar abrindo modal
- [ ] Botão de excluir funcionando
- [ ] Navegação de volta para lista
- [ ] Visual estilo Facebook
- [ ] Página de configurações básica

## Próxima Task

→ Task 07: Deploy e Finalização
