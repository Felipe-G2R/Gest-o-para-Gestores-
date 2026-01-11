-- =====================================================
-- TABELA: access_entries (Login/Senhas)
-- Descrição: Armazena credenciais e acessos
-- =====================================================

-- Criar tabela access_entries
CREATE TABLE IF NOT EXISTS access_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Sem título',
  url TEXT,
  username TEXT,
  password TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índice para busca por usuário
CREATE INDEX IF NOT EXISTS idx_access_entries_user_id ON access_entries(user_id);

-- Criar índice para ordenação por data de criação
CREATE INDEX IF NOT EXISTS idx_access_entries_created_at ON access_entries(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE access_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas suas próprias entradas
CREATE POLICY "Users can view own access entries" ON access_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Usuários podem criar suas próprias entradas
CREATE POLICY "Users can create own access entries" ON access_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar suas próprias entradas
CREATE POLICY "Users can update own access entries" ON access_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Usuários podem deletar suas próprias entradas
CREATE POLICY "Users can delete own access entries" ON access_entries
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE access_entries IS 'Tabela para armazenar credenciais de acesso (Login/Senhas)';
COMMENT ON COLUMN access_entries.id IS 'ID único da entrada';
COMMENT ON COLUMN access_entries.user_id IS 'ID do usuário dono da entrada';
COMMENT ON COLUMN access_entries.title IS 'Nome do serviço/aplicação';
COMMENT ON COLUMN access_entries.url IS 'URL/Link do serviço';
COMMENT ON COLUMN access_entries.username IS 'Nome de usuário/email de login';
COMMENT ON COLUMN access_entries.password IS 'Senha de acesso';
COMMENT ON COLUMN access_entries.notes IS 'Observações adicionais';
COMMENT ON COLUMN access_entries.created_at IS 'Data de criação';
COMMENT ON COLUMN access_entries.updated_at IS 'Data da última atualização';
