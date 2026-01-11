-- =====================================================
-- SCHEMA: Login/Senhas (Acessos)
-- Versão: 2.0 - Com pastas e documentos
-- =====================================================

-- =====================================================
-- TABELA 1: access_folders (Pastas)
-- =====================================================

CREATE TABLE IF NOT EXISTS access_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Nova Pasta',
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_folders_user_id ON access_folders(user_id);

ALTER TABLE access_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own access folders" ON access_folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own access folders" ON access_folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own access folders" ON access_folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own access folders" ON access_folders
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE access_folders IS 'Pastas para organizar acessos e documentos';
COMMENT ON COLUMN access_folders.name IS 'Nome da pasta';
COMMENT ON COLUMN access_folders.color IS 'Cor da pasta (hex)';

-- =====================================================
-- TABELA 2: access_entries (Acessos/Credenciais)
-- =====================================================

-- Se a tabela já existir sem folder_id, adicionar a coluna
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'access_entries' AND column_name = 'folder_id'
  ) THEN
    ALTER TABLE access_entries ADD COLUMN folder_id UUID REFERENCES access_folders(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS access_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES access_folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Sem título',
  url TEXT,
  username TEXT,
  password TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_entries_user_id ON access_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_access_entries_folder_id ON access_entries(folder_id);
CREATE INDEX IF NOT EXISTS idx_access_entries_created_at ON access_entries(created_at DESC);

ALTER TABLE access_entries ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Users can view own access entries" ON access_entries;
DROP POLICY IF EXISTS "Users can create own access entries" ON access_entries;
DROP POLICY IF EXISTS "Users can update own access entries" ON access_entries;
DROP POLICY IF EXISTS "Users can delete own access entries" ON access_entries;

CREATE POLICY "Users can view own access entries" ON access_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own access entries" ON access_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own access entries" ON access_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own access entries" ON access_entries
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE access_entries IS 'Credenciais de acesso (Login/Senhas)';
COMMENT ON COLUMN access_entries.folder_id IS 'Pasta onde o acesso está organizado';
COMMENT ON COLUMN access_entries.title IS 'Nome do serviço/aplicação';
COMMENT ON COLUMN access_entries.url IS 'URL/Link do serviço';
COMMENT ON COLUMN access_entries.username IS 'Nome de usuário/email de login';
COMMENT ON COLUMN access_entries.password IS 'Senha de acesso';
COMMENT ON COLUMN access_entries.notes IS 'Observações adicionais';

-- =====================================================
-- TABELA 3: access_documents (Documentos/Anotações)
-- =====================================================

CREATE TABLE IF NOT EXISTS access_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES access_folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Sem título',
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_documents_user_id ON access_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_access_documents_folder_id ON access_documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_access_documents_created_at ON access_documents(created_at DESC);

ALTER TABLE access_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own access documents" ON access_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own access documents" ON access_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own access documents" ON access_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own access documents" ON access_documents
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE access_documents IS 'Documentos/Anotações organizados por pasta';
COMMENT ON COLUMN access_documents.folder_id IS 'Pasta onde o documento está organizado';
COMMENT ON COLUMN access_documents.title IS 'Título do documento';
COMMENT ON COLUMN access_documents.content IS 'Conteúdo HTML do documento';
