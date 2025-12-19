# Gestão para Gestores 1.0 - Especificação MVP

**Projeto**: Gestão para Gestores - Sistema de Gerenciamento de Clientes para Gestores de Tráfego
**Cliente**: Squad do Irmão (Gestores de Tráfego)
**Criado**: 2025-12-18
**Target**: MVP em 6-8 horas
**Status**: Draft → Approved → In Development → Done
**Framework**: Work High Fast (WHF)

---

## 1. Problem Statement

Gestores de tráfego que trabalham com múltiplos clientes (doutoras/médicos) precisam de um sistema centralizado para:
- Gerenciar informações de todos os clientes em um único lugar
- Acompanhar dados de pagamento e verba mensal de anúncios
- Acessar rapidamente links das campanhas de cada cliente
- Manter anotações e detalhes importantes de cada cliente

**Problema atual**: Informações espalhadas em Google Docs, Notion, Excel e várias outras ferramentas, dificultando a gestão organizada e eficiente do squad.

**Por que soluções existentes não funcionam**: Ferramentas genéricas não são otimizadas para o fluxo de trabalho específico de gestores de tráfego que precisam de acesso rápido a links de campanhas, controle de verbas e formas de pagamento.

---

## 2. Target Users

### Persona 1: Gestor de Tráfego (Usuário Principal)
- **Quem é**: Profissional que gerencia campanhas de anúncios para múltiplos clientes médicos
- **Pain Point**: Perde tempo procurando informações em várias ferramentas diferentes
- **Como usa**: Cadastra clientes, acessa links de campanhas, anota detalhes importantes

### Persona 2: Gestor do Squad (Admin)
- **Quem é**: Responsável pelo squad de gestores
- **Pain Point**: Não tem visibilidade centralizada de todos os clientes do squad
- **Como usa**: Dashboard com visão geral, gerenciamento de usuários

---

## 3. MVP Features (80/20 - Max 5 Features Core)

### Feature 1: Sistema de Autenticação
- **Descrição**: Login simples com email e senha (estilo Formed)
- **Campos**: Email, senha
- **User Value**: Segurança e acesso controlado ao sistema
- **Acceptance**: Usuário consegue fazer login e acessar o dashboard
- **Time Estimate**: 1 hora

### Feature 2: Cadastro de Clientes (CRUD Completo)
- **Descrição**: Sistema completo de gerenciamento de clientes com campos específicos
- **Campos**:
  - Nome do cliente (doutora/doutor)
  - Localidade (cidade/estado)
  - Forma de pagamento da conta de anúncio (Cartão ou PIX)
  - Verba mensal de anúncios
  - Link da campanha (botão de acesso direto)
  - Bloco de notas (detalhes e observações)
- **User Value**: Base centralizada de todos os clientes com acesso rápido às informações
- **Acceptance**: Usuário consegue criar, editar, visualizar e excluir clientes
- **Time Estimate**: 2.5 horas

### Feature 3: Menu Lateral (Sidebar)
- **Descrição**: Navegação lateral estilo aplicativo moderno com links para todas as seções
- **Componentes**: Logo, links de navegação, toggle dark/light mode
- **User Value**: Navegação intuitiva e rápida entre seções
- **Acceptance**: Menu lateral funcional com navegação entre todas as views
- **Time Estimate**: 1 hora

### Feature 4: Dashboard Principal
- **Descrição**: Visão geral com métricas importantes do squad
- **Métricas**:
  - Total de clientes
  - Verba total mensal
  - Clientes por forma de pagamento
  - Cards com resumo dos clientes
- **User Value**: Visão rápida da saúde do squad
- **Acceptance**: Dashboard exibe métricas e cards funcionando
- **Time Estimate**: 1.5 horas

### Feature 5: Visualização e Edição de Cliente
- **Descrição**: Tela detalhada do cliente com todas as informações e botão de acesso à campanha
- **Componentes**: Card com dados, botão "Acessar Campanha", editor de notas
- **User Value**: Acesso rápido a todas as informações e link direto para a campanha
- **Acceptance**: Usuário visualiza cliente e consegue clicar no botão para ir à campanha
- **Time Estimate**: 1 hora

---

## 4. Tech Stack (WHF Standard - Baseado no Med Manager)

### Frontend
- **Vue 3** com Composition API (TypeScript)
- **Tailwind CSS** + **DaisyUI** (componentes)
- **Pinia** (state management)
- **Vue Router** (navegação)
- **Lucide Icons** (ícones)

### Backend
- **Supabase** (BaaS - autenticação + banco de dados)
- **PostgreSQL** (via Supabase)

### Infraestrutura
- **Build**: Vite 5+
- **Deploy**: Vercel
- **Linting**: ESLint + Prettier

### Paleta de Cores (Facebook)
- **Azul Principal**: #1877F2
- **Azul Hover**: #166FE5
- **Background**: #F0F2F5
- **Branco**: #FFFFFF
- **Texto Principal**: #050505
- **Texto Secundário**: #65676B

---

## 5. Data Model (Core Entities)

### User (Usuário do Sistema)
```
id, name, email, password_hash, role (admin/user), created_at, updated_at
```

### Client (Cliente/Doutora)
```
id, user_id, name, location, payment_method (card/pix),
monthly_budget, campaign_link, notes, status (active/inactive),
created_at, updated_at
```

---

## 6. Success Metrics

| Métrica | Target |
|---------|--------|
| Time to MVP | < 8 horas |
| Test Coverage | > 60% |
| Core User Flow | < 3 steps |
| Queries Performance | < 200ms |
| AI Code Generation | > 70% |

---

## 7. Explicitly Out of Scope (MVP)

- [ ] Multi-tenancy avançado (MVP é single-tenant por squad)
- [ ] Integração com Meta Ads API
- [ ] Relatórios em PDF
- [ ] Notificações push
- [ ] App mobile
- [ ] Histórico de alterações
- [ ] Integração com WhatsApp
- [ ] Dashboard de performance de campanhas
- [ ] Sistema de tags/categorias avançado

---

## 8. Timeline Commitment (WHF Standard)

| Fase | Duração | Entregáveis |
|------|---------|-------------|
| Discovery & Planning | 1 hora | spec.md, architecture.md, data-model |
| Scaffolding | 30 min | Projeto estruturado, deps instaladas |
| Feature 1: Autenticação | 1 hora | Login/Logout funcionando |
| Feature 2: CRUD Clientes | 2.5 horas | Cadastro completo |
| Feature 3: Menu Lateral | 1 hora | Sidebar navegável |
| Feature 4: Dashboard | 1.5 horas | Métricas funcionando |
| Feature 5: View Cliente | 1 hora | Detalhes + botão campanha |
| Testing & Polish | 30 min | Ajustes finais |
| **TOTAL** | **~8 horas** | MVP completo |

---

## 9. User Interface Specs

### Tela de Login
- Logo centralizado
- Campos de email e senha
- Botão "Entrar" azul Facebook
- Link para "Esqueci minha senha" (V2)
- Tema claro/escuro toggle

### Dashboard
- Header com nome do usuário e logout
- Cards com métricas principais
- Lista/Grid de clientes recentes
- Botão "Novo Cliente" proeminente

### Lista de Clientes
- Tabela responsiva com colunas: Nome, Localidade, Pagamento, Verba, Ações
- Filtros: Por pagamento, por status
- Busca por nome
- Ações: Ver, Editar, Excluir

### Detalhes do Cliente
- Card com todas as informações
- Botão destacado "Acessar Campanha" (abre em nova aba)
- Editor de notas com salvamento automático
- Botões de editar e excluir

### Sidebar
- Logo no topo
- Links: Dashboard, Clientes, Configurações
- Indicador de página ativa
- Toggle dark/light mode
- Info do usuário logado no rodapé

---

## 10. Approval Checklist

- [ ] Problem statement validado
- [ ] Features priorizadas (80/20)
- [ ] Tech stack confirmada
- [ ] Data model aprovado
- [ ] Timeline aceito
- [ ] Out of scope claro
- [ ] Paleta de cores definida (Facebook)

**Aprovado por**: ________________
**Data**: ________________

---

*Powered by Work High Fast Framework*
