-- =============================================
-- IMPORTANTE: Execute este SQL no Supabase
-- para corrigir o problema de exclusão de tasks
-- =============================================

-- Habilitar RLS na tabela tasks (se ainda não estiver)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver) para evitar conflitos
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can delete all tasks" ON tasks;

-- =============================================
-- POLÍTICAS PARA USUÁRIOS NORMAIS
-- =============================================

-- Usuários podem ver suas próprias tasks
CREATE POLICY "Users can view own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

-- Usuários podem criar suas próprias tasks
CREATE POLICY "Users can create own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias tasks
CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar suas próprias tasks
CREATE POLICY "Users can delete own tasks"
ON tasks FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- POLÍTICAS PARA ADMINS (opcional)
-- =============================================

-- Se você tem uma coluna 'role' na tabela profiles para admins,
-- descomente as linhas abaixo para permitir que admins
-- gerenciem todas as tasks:

-- CREATE POLICY "Admins can view all tasks"
-- ON tasks FOR SELECT
-- USING (
--   EXISTS (
--     SELECT 1 FROM profiles
--     WHERE profiles.id = auth.uid()
--     AND profiles.role = 'admin'
--   )
-- );

-- CREATE POLICY "Admins can delete all tasks"
-- ON tasks FOR DELETE
-- USING (
--   EXISTS (
--     SELECT 1 FROM profiles
--     WHERE profiles.id = auth.uid()
--     AND profiles.role = 'admin'
--   )
-- );

-- =============================================
-- VERIFICAÇÃO
-- =============================================
-- Após executar, você pode verificar as políticas com:
-- SELECT * FROM pg_policies WHERE tablename = 'tasks';
