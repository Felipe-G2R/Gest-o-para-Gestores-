# Task 02: Sistema de Autenticação

**Duração estimada**: 1 hora
**Prioridade**: Alta
**Dependências**: Task 01

## Objetivo

Implementar sistema de login/logout com Supabase Auth, estilo similar ao Formed.

## Checklist

### 1. Criar tabelas no Supabase

```sql
-- Enum para roles
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Tabela de perfis (extensão do auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

### 2. Criar types

**src/types/auth.ts**:
```typescript
export type UserRole = 'admin' | 'user'

export interface Profile {
  id: string
  name: string
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  profile: Profile | null
}
```

### 3. Criar Auth Store

**src/stores/auth.ts**:
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { AuthUser, Profile } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.profile?.role === 'admin')

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        user.value = {
          id: data.user.id,
          email: data.user.email!,
          profile
        }

        return true
      }

      return false
    } catch (e: any) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
  }

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      user.value = {
        id: session.user.id,
        email: session.user.email!,
        profile
      }
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    checkAuth
  }
})
```

### 4. Criar Theme Store

**src/stores/theme.ts**:
```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<'light' | 'dark'>('light')

  function init() {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    theme.value = saved || (prefersDark ? 'dark' : 'light')
    applyTheme()
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', theme.value)
    applyTheme()
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme',
      theme.value === 'dark' ? 'facebook-dark' : 'facebook'
    )
  }

  return { theme, init, toggleTheme }
})
```

### 5. Criar LoginView

**src/views/LoginView.vue**:
```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { LogIn, Mail, Lock, AlertCircle, Sun, Moon } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

onMounted(() => {
  themeStore.init()
})

const isDark = computed(() => themeStore.theme === 'dark')

async function handleLogin() {
  error.value = ''
  loading.value = true

  const success = await authStore.login(email.value, password.value)

  if (success) {
    router.push('/dashboard')
  } else {
    error.value = authStore.error || 'Email ou senha incorretos'
  }

  loading.value = false
}
</script>

<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
    <!-- Theme Toggle -->
    <button
      @click="themeStore.toggleTheme"
      class="absolute top-4 right-4 btn btn-ghost btn-circle"
    >
      <Sun v-if="!isDark" class="w-5 h-5" />
      <Moon v-else class="w-5 h-5" />
    </button>

    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
          <span class="text-3xl font-bold text-white">GG</span>
        </div>
        <h1 class="text-3xl font-bold">
          Gestão para <span class="text-primary">Gestores</span>
        </h1>
        <p class="text-base-content/60 mt-2">
          Sistema de Gerenciamento de Clientes
        </p>
      </div>

      <!-- Login Card -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title justify-center mb-4">Entrar na sua conta</h2>

          <!-- Error Alert -->
          <div v-if="error" class="alert alert-error mb-4">
            <AlertCircle class="w-5 h-5" />
            <span>{{ error }}</span>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <!-- Email -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Email</span>
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                  <Mail class="w-5 h-5" />
                </span>
                <input
                  v-model="email"
                  type="email"
                  placeholder="seu@email.com"
                  class="input input-bordered w-full pl-10"
                  required
                />
              </div>
            </div>

            <!-- Password -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Senha</span>
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                  <Lock class="w-5 h-5" />
                </span>
                <input
                  v-model="password"
                  type="password"
                  placeholder="********"
                  class="input input-bordered w-full pl-10"
                  required
                />
              </div>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              class="btn btn-primary w-full"
              :class="{ 'loading': loading }"
              :disabled="loading"
            >
              <LogIn v-if="!loading" class="w-5 h-5 mr-2" />
              {{ loading ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-sm text-base-content/40 mt-6">
        Gestão para Gestores &copy; {{ new Date().getFullYear() }}
      </p>
    </div>
  </div>
</template>
```

### 6. Configurar Guard de Navegação

**src/router/index.ts** (atualizar):
```typescript
import { useAuthStore } from '@/stores/auth'

// ... routes ...

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Verificar autenticação se ainda não verificou
  if (!authStore.isAuthenticated) {
    await authStore.checkAuth()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})
```

## Critérios de Aceite

- [ ] Tabela profiles criada no Supabase
- [ ] RLS configurado corretamente
- [ ] Login funcionando com email/senha
- [ ] Logout funcionando
- [ ] Persistência de sessão (refresh não desloga)
- [ ] Guard de navegação protegendo rotas
- [ ] Toggle de tema funcionando
- [ ] Visual estilo Facebook

## Próxima Task

→ Task 03: Layout com Sidebar
