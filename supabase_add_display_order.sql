-- =============================================
-- SQL para adicionar campo de Ordem de Exibição (display_order)
-- Execute este script no Supabase SQL Editor
-- =============================================

-- 1. Adicionar coluna display_order (ordem de exibição para reordenação)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- 2. Criar índice para melhor performance na ordenação
CREATE INDEX IF NOT EXISTS idx_clients_display_order ON clients(display_order);

-- 3. Atualizar clientes existentes para terem ordem sequencial baseada na data de criação
-- (Isso garante que clientes antigos tenham uma ordem inicial)
WITH ordered_clients AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as new_order
  FROM clients
)
UPDATE clients
SET display_order = ordered_clients.new_order
FROM ordered_clients
WHERE clients.id = ordered_clients.id;

-- =============================================
-- VERIFICAÇÃO: Conferir se a coluna foi adicionada
-- =============================================
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'clients'
-- AND column_name = 'display_order';

-- =============================================
-- LISTAR CLIENTES COM A NOVA COLUNA
-- =============================================
-- SELECT name, display_order FROM clients ORDER BY display_order;

-- =============================================
-- FIM DO SCRIPT
-- =============================================
