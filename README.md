# Gestão para Gestores 1.0

Sistema de Gerenciamento de Clientes para Gestores de Tráfego

## Sobre o Projeto

Sistema desenvolvido para gestores de tráfego que precisam gerenciar múltiplos clientes (doutoras/médicos) de forma centralizada e organizada.

### Problema que Resolve

- Informações de clientes espalhadas em várias ferramentas
- Dificuldade de acessar rapidamente links de campanhas
- Falta de visibilidade sobre verbas e formas de pagamento
- Notas e detalhes perdidos em diferentes locais

### Funcionalidades Principais

1. **Autenticação Segura** - Login com email e senha
2. **Cadastro de Clientes** - CRUD completo com campos específicos
3. **Menu Lateral** - Navegação intuitiva estilo app moderno
4. **Dashboard** - Visão geral com métricas do squad
5. **Acesso Rápido** - Botão direto para links de campanhas

## Tech Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | Vue 3 + TypeScript |
| Estilização | Tailwind CSS + DaisyUI |
| State | Pinia |
| Routing | Vue Router |
| Backend | Supabase (Auth + Database) |
| Deploy | Vercel |

## Paleta de Cores (Facebook)

| Cor | Hex | Uso |
|-----|-----|-----|
| Azul Principal | `#1877F2` | Botões, links, elementos destacados |
| Azul Hover | `#166FE5` | Estados hover |
| Background | `#F0F2F5` | Fundo geral |
| Branco | `#FFFFFF` | Cards, modais |
| Texto Principal | `#050505` | Títulos, texto importante |
| Texto Secundário | `#65676B` | Labels, descrições |

## Estrutura do Projeto

```
gestao-para-gestores/
├── src/
│   ├── assets/           # Imagens, fontes
│   ├── components/       # Componentes reutilizáveis
│   │   ├── layout/       # Sidebar, Header
│   │   ├── clients/      # Componentes de clientes
│   │   ├── dashboard/    # Cards, métricas
│   │   └── ui/           # Buttons, inputs, modals
│   ├── views/            # Páginas principais
│   │   ├── LoginView.vue
│   │   ├── DashboardView.vue
│   │   ├── ClientsView.vue
│   │   ├── ClientDetailView.vue
│   │   └── SettingsView.vue
│   ├── stores/           # Pinia stores
│   │   ├── auth.ts
│   │   ├── clients.ts
│   │   └── theme.ts
│   ├── router/           # Configuração de rotas
│   ├── types/            # TypeScript interfaces
│   └── utils/            # Funções utilitárias
├── public/               # Assets estáticos
├── docs/                 # Documentação
└── ...config files
```

## Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd gestao-para-gestores

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase

# Execute em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Variáveis de Ambiente

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Executa linter |
| `npm run type-check` | Verifica tipos TypeScript |

## Documentação Adicional

- [Especificação MVP](./spec.md)
- [Arquitetura do Sistema](./docs/architecture.md)
- [Modelo de Dados](./docs/data-model.md)
- [Paleta de Cores](./docs/color-palette.md)

## Roadmap

### MVP (v1.0) - Atual
- [x] Planejamento e especificação
- [ ] Autenticação
- [ ] CRUD de clientes
- [ ] Dashboard
- [ ] Menu lateral
- [ ] Deploy

### v1.1 - Melhorias
- [ ] Filtros avançados
- [ ] Busca de clientes
- [ ] Exportar dados (CSV)

### v2.0 - Futuro
- [ ] Integração Meta Ads API
- [ ] Relatórios em PDF
- [ ] Multi-tenancy
- [ ] App mobile

## Licença

Projeto privado - Todos os direitos reservados.

---

**Desenvolvido com Work High Fast Framework**
