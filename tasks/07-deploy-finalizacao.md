# Task 07: Deploy e Finalização

**Duração estimada**: 30 minutos
**Prioridade**: Alta
**Dependências**: Tasks 01-06

## Objetivo

Fazer o deploy do sistema e realizar testes finais.

## Checklist

### 1. Preparar para Produção

**Criar .env.example**:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Atualizar .gitignore**:
```
# Logs
logs
*.log
npm-debug.log*

# Dependencies
node_modules
.pnp
.pnp.js

# Build
dist
dist-ssr
*.local

# Editor
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### 2. Configurar Vercel

**vercel.json**:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 3. Build e Teste Local

```bash
# Build para produção
npm run build

# Preview local
npm run preview

# Verificar se tudo funciona:
# - Login
# - Dashboard
# - CRUD de clientes
# - Botão de campanha
# - Notas
# - Tema dark/light
```

### 4. Deploy na Vercel

```bash
# Opção 1: Via CLI
npm i -g vercel
vercel login
vercel --prod

# Opção 2: Via GitHub
# 1. Push para GitHub
git init
git add .
git commit -m "feat: Gestão para Gestores 1.0 - MVP completo"
git remote add origin <seu-repo>
git push -u origin main

# 2. Conectar no Vercel Dashboard
# 3. Importar projeto do GitHub
# 4. Configurar variáveis de ambiente
# 5. Deploy automático
```

### 5. Configurar Variáveis no Vercel

No dashboard da Vercel:
1. Project Settings → Environment Variables
2. Adicionar:
   - `VITE_SUPABASE_URL` = sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = sua chave anon do Supabase

### 6. Criar Usuário de Teste

No Supabase Dashboard → Authentication → Users:
1. Clicar em "Add user"
2. Preencher email e senha
3. Criar usuário

Ou via SQL:
```sql
-- O usuário será criado com o trigger automático de profile
```

### 7. Testes Finais em Produção

Checklist de testes:
- [ ] Acessar URL de produção
- [ ] Fazer login
- [ ] Verificar dashboard vazio
- [ ] Criar primeiro cliente
- [ ] Verificar métricas atualizadas
- [ ] Editar cliente
- [ ] Testar botão de campanha
- [ ] Salvar notas
- [ ] Excluir cliente
- [ ] Testar toggle de tema
- [ ] Fazer logout
- [ ] Verificar redirect para login

### 8. Documentação Final

**Criar DEPLOYMENT.md**:
```markdown
# Guia de Deploy - Gestão para Gestores 1.0

## Pré-requisitos

1. Conta no Supabase (https://supabase.com)
2. Conta na Vercel (https://vercel.com)
3. Node.js 18+

## Configuração do Supabase

1. Criar novo projeto no Supabase
2. Executar SQL de criação de tabelas (ver docs/data-model.md)
3. Copiar URL e ANON KEY do projeto

## Deploy na Vercel

1. Fork/clone este repositório
2. Conectar com Vercel
3. Adicionar variáveis de ambiente:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
4. Deploy!

## Criando Primeiro Usuário

1. Acessar Supabase Dashboard
2. Authentication → Users → Add User
3. Definir email e senha
4. Pronto para login!
```

## Critérios de Aceite

- [ ] Build de produção sem erros
- [ ] Deploy na Vercel funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Usuário de teste criado
- [ ] Todos os fluxos testados em produção
- [ ] Documentação de deploy criada

## MVP Completo!

Parabéns! O sistema "Gestão para Gestores 1.0" está pronto para uso.

### Funcionalidades Entregues

1. **Autenticação**: Login/logout com email e senha
2. **Dashboard**: Visão geral com métricas do squad
3. **CRUD de Clientes**: Cadastro, edição, visualização e exclusão
4. **Campos do Cliente**:
   - Nome
   - Localidade
   - Forma de pagamento (Cartão/PIX)
   - Verba mensal
   - Link da campanha
   - Notas/observações
   - Status (Ativo/Inativo/Pausado)
5. **Botão de Campanha**: Acesso direto ao link da campanha
6. **Menu Lateral**: Navegação intuitiva
7. **Tema**: Light/Dark mode
8. **Paleta Facebook**: Visual profissional

### Próximos Passos (V1.1+)

- [ ] Filtros avançados
- [ ] Exportar para CSV/Excel
- [ ] Histórico de alterações
- [ ] Multi-tenancy (squads)
- [ ] Integração Meta Ads API
- [ ] Notificações
- [ ] App mobile

---

*Desenvolvido com Work High Fast Framework*
