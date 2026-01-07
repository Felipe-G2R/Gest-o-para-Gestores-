-- =====================================================
-- TABELA: rataria_entries (Malandragem For Med)
-- Descrição: Anotações pontuais e dicas
-- =====================================================

-- Criar tabela rataria_entries
CREATE TABLE IF NOT EXISTS rataria_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Sem título',
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índice para busca por usuário
CREATE INDEX IF NOT EXISTS idx_rataria_entries_user_id ON rataria_entries(user_id);

-- Criar índice para ordenação por data de criação
CREATE INDEX IF NOT EXISTS idx_rataria_entries_created_at ON rataria_entries(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE rataria_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas suas próprias entradas
CREATE POLICY "Users can view own rataria entries" ON rataria_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Usuários podem criar suas próprias entradas
CREATE POLICY "Users can create own rataria entries" ON rataria_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar suas próprias entradas
CREATE POLICY "Users can update own rataria entries" ON rataria_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Usuários podem deletar suas próprias entradas
CREATE POLICY "Users can delete own rataria entries" ON rataria_entries
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE rataria_entries IS 'Tabela para armazenar anotações do Malandragem For Med';
COMMENT ON COLUMN rataria_entries.id IS 'ID único da entrada';
COMMENT ON COLUMN rataria_entries.user_id IS 'ID do usuário dono da entrada';
COMMENT ON COLUMN rataria_entries.title IS 'Título/Nome da anotação';
COMMENT ON COLUMN rataria_entries.content IS 'Conteúdo HTML da anotação';
COMMENT ON COLUMN rataria_entries.created_at IS 'Data de criação';
COMMENT ON COLUMN rataria_entries.updated_at IS 'Data da última atualização';
