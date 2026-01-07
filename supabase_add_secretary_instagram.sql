-- =============================================
-- SQL para adicionar campos de Secretária e Instagram
-- Execute este script no Supabase SQL Editor
-- =============================================

-- 1. Adicionar coluna has_secretary (boolean)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS has_secretary BOOLEAN NOT NULL DEFAULT false;

-- 2. Adicionar coluna secretary_name (nome da secretária)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS secretary_name TEXT;

-- 3. Adicionar coluna secretary_phone (telefone da secretária)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS secretary_phone TEXT;

-- 4. Adicionar coluna instagram_url (link do Instagram)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- 5. Criar índice para melhor performance em consultas por secretária
CREATE INDEX IF NOT EXISTS idx_clients_has_secretary ON clients(has_secretary);

-- =============================================
-- VERIFICAÇÃO: Conferir se as colunas foram adicionadas
-- =============================================
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'clients'
-- AND column_name IN ('has_secretary', 'secretary_name', 'secretary_phone', 'instagram_url');

-- =============================================
-- LISTAR CLIENTES COM OS NOVOS CAMPOS
-- =============================================
-- SELECT name, has_secretary, secretary_name, secretary_phone, instagram_url FROM clients;

-- =============================================
-- FIM DO SCRIPT
-- =============================================
