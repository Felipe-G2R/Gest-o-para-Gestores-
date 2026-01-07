-- Adicionar campos de Seller na tabela clients
-- Execute este SQL no Supabase SQL Editor

-- Adiciona coluna has_seller (boolean, default false)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS has_seller BOOLEAN DEFAULT false;

-- Adiciona coluna seller_name (texto opcional)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS seller_name TEXT;

-- Comentários para documentação
COMMENT ON COLUMN clients.has_seller IS 'Indica se o cliente possui um Seller associado';
COMMENT ON COLUMN clients.seller_name IS 'Primeiro nome do Seller responsável pelo cliente';
