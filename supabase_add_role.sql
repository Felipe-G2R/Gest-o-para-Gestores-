-- =============================================
-- SQL para adicionar sistema de ROLES (Admin/User)
-- Execute este script no Supabase SQL Editor
-- =============================================

-- 1. Adicionar coluna role na tabela profiles (se ainda não existir)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
CHECK (role IN ('admin', 'user'));

-- 2. Criar índice para melhor performance em consultas por role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 3. (OPCIONAL) Definir um usuário específico como admin pelo email
-- Substitua 'seu-email-admin@exemplo.com' pelo email do admin
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE email = 'seu-email-admin@exemplo.com';

-- 4. (OPCIONAL) Definir um usuário específico como admin pelo ID
-- Substitua 'uuid-do-usuario' pelo ID do usuário
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE id = 'uuid-do-usuario';

-- =============================================
-- VERIFICAÇÃO: Conferir se a coluna foi adicionada
-- =============================================
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'profiles' AND column_name = 'role';

-- =============================================
-- LISTAR USUÁRIOS COM SEUS ROLES
-- =============================================
-- SELECT id, email, full_name, role FROM profiles;

-- =============================================
-- FIM DO SCRIPT
-- =============================================
