# Task 01: Setup do Projeto

**Duração estimada**: 30 minutos
**Prioridade**: Alta
**Dependências**: Nenhuma

## Objetivo

Criar a estrutura base do projeto Vue 3 + TypeScript com todas as dependências configuradas.

## Checklist

### 1. Criar projeto Vue

```bash
npm create vite@latest gestao-para-gestores -- --template vue-ts
cd gestao-para-gestores
```

### 2. Instalar dependências

```bash
# Core
npm install vue-router@4 pinia @supabase/supabase-js

# UI
npm install -D tailwindcss postcss autoprefixer daisyui
npm install lucide-vue-next

# Utils
npm install @vueuse/core
```

### 3. Configurar Tailwind CSS

```bash
npx tailwindcss init -p
```

**tailwind.config.js**:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        facebook: {
          primary: '#1877F2',
          'primary-hover': '#166FE5',
          'primary-light': '#E7F3FF',
          background: '#F0F2F5',
          surface: '#FFFFFF',
          divider: '#DADDE1',
          'text-primary': '#050505',
          'text-secondary': '#65676B',
          success: '#31A24C',
          warning: '#F7B928',
          error: '#F02849',
        }
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", {
      facebook: {
        "primary": "#1877F2",
        "primary-focus": "#166FE5",
        "primary-content": "#FFFFFF",
        "secondary": "#65676B",
        "accent": "#31A24C",
        "neutral": "#F0F2F5",
        "base-100": "#FFFFFF",
        "base-200": "#F0F2F5",
        "base-300": "#DADDE1",
        "base-content": "#050505",
        "info": "#1877F2",
        "success": "#31A24C",
        "warning": "#F7B928",
        "error": "#F02849",
      }
    }],
  },
}
```

### 4. Configurar CSS base

**src/assets/main.css**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #app {
  height: 100%;
}
```

### 5. Estrutura de pastas

```
src/
├── assets/
│   └── main.css
├── components/
│   ├── layout/
│   ├── clients/
│   ├── dashboard/
│   └── ui/
├── views/
├── stores/
├── router/
├── types/
├── utils/
├── lib/
│   └── supabase.ts
├── App.vue
└── main.ts
```

### 6. Configurar Supabase

**src/lib/supabase.ts**:
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
```

**.env.example**:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 7. Configurar Router base

**src/router/index.ts**:
```typescript
import { createRouter, createWebHistory } from 'vue-router'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

### 8. Configurar Pinia

**src/main.ts**:
```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

## Critérios de Aceite

- [ ] Projeto criado e rodando com `npm run dev`
- [ ] Tailwind CSS funcionando com tema Facebook
- [ ] DaisyUI configurado
- [ ] Supabase client criado
- [ ] Router configurado
- [ ] Pinia instalado
- [ ] Estrutura de pastas criada

## Próxima Task

→ Task 02: Sistema de Autenticação
