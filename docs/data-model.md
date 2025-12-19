# Modelo de Dados - Gestão para Gestores 1.0

## Diagrama ER

```
┌─────────────────────────────────────────────────────────────────┐
│                          USERS                                   │
├─────────────────────────────────────────────────────────────────┤
│ id          UUID         PK    NOT NULL                         │
│ email       VARCHAR(255)       NOT NULL UNIQUE                  │
│ name        VARCHAR(255)       NOT NULL                         │
│ role        ENUM               NOT NULL DEFAULT 'user'          │
│ avatar_url  TEXT               NULL                             │
│ created_at  TIMESTAMPTZ        NOT NULL DEFAULT now()           │
│ updated_at  TIMESTAMPTZ        NOT NULL DEFAULT now()           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID         PK    NOT NULL                     │
│ user_id         UUID         FK    NOT NULL → users(id)         │
│ name            VARCHAR(255)       NOT NULL                     │
│ location        VARCHAR(255)       NOT NULL                     │
│ payment_method  ENUM               NOT NULL (card/pix)          │
│ monthly_budget  DECIMAL(12,2)      NOT NULL DEFAULT 0           │
│ campaign_link   TEXT               NULL                         │
│ notes           TEXT               NULL                         │
│ status          ENUM               NOT NULL DEFAULT 'active'    │
│ created_at      TIMESTAMPTZ        NOT NULL DEFAULT now()       │
│ updated_at      TIMESTAMPTZ        NOT NULL DEFAULT now()       │
└─────────────────────────────────────────────────────────────────┘
```

## Tabelas Detalhadas

### Users (Usuários)

Gerenciada pelo Supabase Auth com extensão na tabela `profiles`.

```sql
-- Tabela criada automaticamente pelo Supabase Auth
-- Extendemos com uma tabela de perfil

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
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID do usuário (FK para auth.users) |
| `name` | VARCHAR(255) | Nome completo do usuário |
| `role` | ENUM | Papel: 'admin' ou 'user' |
| `avatar_url` | TEXT | URL da foto de perfil |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Data de atualização |

### Clients (Clientes/Doutoras)

```sql
-- Enum para forma de pagamento
CREATE TYPE payment_method AS ENUM ('card', 'pix');

-- Enum para status do cliente
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

-- Índices para performance
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_payment_method ON clients(payment_method);

-- Trigger para atualizar updated_at
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
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do cliente |
| `user_id` | UUID | ID do gestor responsável |
| `name` | VARCHAR(255) | Nome da doutora/cliente |
| `location` | VARCHAR(255) | Cidade/Estado |
| `payment_method` | ENUM | 'card' ou 'pix' |
| `monthly_budget` | DECIMAL(12,2) | Verba mensal em R$ |
| `campaign_link` | TEXT | Link da campanha no Meta Ads |
| `notes` | TEXT | Bloco de notas/observações |
| `status` | ENUM | 'active', 'inactive', 'paused' |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Data de atualização |

## Row Level Security (RLS)

```sql
-- Habilitar RLS na tabela clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só veem seus próprios clientes
CREATE POLICY "Users can view own clients"
ON clients FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuários só podem criar seus próprios clientes
CREATE POLICY "Users can create own clients"
ON clients FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários só podem atualizar seus próprios clientes
CREATE POLICY "Users can update own clients"
ON clients FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários só podem deletar seus próprios clientes
CREATE POLICY "Users can delete own clients"
ON clients FOR DELETE
USING (auth.uid() = user_id);

-- RLS para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

## TypeScript Interfaces

```typescript
// types/database.ts

export type PaymentMethod = 'card' | 'pix'
export type ClientStatus = 'active' | 'inactive' | 'paused'
export type UserRole = 'admin' | 'user'

export interface Profile {
  id: string
  name: string
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

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

// Tipos para inserção (sem campos auto-gerados)
export type ClientInsert = Omit<Client, 'id' | 'created_at' | 'updated_at'>

// Tipos para atualização (todos opcionais exceto id)
export type ClientUpdate = Partial<Omit<Client, 'id' | 'user_id' | 'created_at'>>

// Tipos do Supabase gerados
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      clients: {
        Row: Client
        Insert: ClientInsert
        Update: ClientUpdate
      }
    }
    Enums: {
      payment_method: PaymentMethod
      client_status: ClientStatus
      user_role: UserRole
    }
  }
}
```

## Queries Comuns

### Listar Clientes do Usuário

```typescript
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .order('created_at', { ascending: false })
```

### Buscar Cliente por ID

```typescript
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('id', clientId)
  .single()
```

### Criar Novo Cliente

```typescript
const { data, error } = await supabase
  .from('clients')
  .insert({
    user_id: userId,
    name: 'Dra. Maria Silva',
    location: 'São Paulo, SP',
    payment_method: 'pix',
    monthly_budget: 5000,
    campaign_link: 'https://business.facebook.com/...',
    notes: 'Cliente desde 2024'
  })
  .select()
  .single()
```

### Atualizar Cliente

```typescript
const { data, error } = await supabase
  .from('clients')
  .update({
    monthly_budget: 6000,
    notes: 'Aumentou verba em Dezembro'
  })
  .eq('id', clientId)
  .select()
  .single()
```

### Deletar Cliente

```typescript
const { error } = await supabase
  .from('clients')
  .delete()
  .eq('id', clientId)
```

### Métricas do Dashboard

```typescript
// Total de clientes e soma de verbas
const { data, error } = await supabase
  .from('clients')
  .select('id, monthly_budget, payment_method, status')

const metrics = {
  totalClients: data?.length || 0,
  totalBudget: data?.reduce((sum, c) => sum + c.monthly_budget, 0) || 0,
  byPayment: {
    card: data?.filter(c => c.payment_method === 'card').length || 0,
    pix: data?.filter(c => c.payment_method === 'pix').length || 0
  },
  byStatus: {
    active: data?.filter(c => c.status === 'active').length || 0,
    inactive: data?.filter(c => c.status === 'inactive').length || 0,
    paused: data?.filter(c => c.status === 'paused').length || 0
  }
}
```

---

*Documento atualizado em: 2025-12-18*
