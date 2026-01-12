-- =====================================================
-- STORAGE: Bucket para imagens do Diário de Bordo
-- =====================================================

-- 1. Criar o bucket (executar no Supabase Dashboard > Storage)
-- Nome: diary-images
-- Public: Sim (para que as imagens sejam acessíveis)

-- OU executar via SQL:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'diary-images',
  'diary-images',
  true,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- POLÍTICAS RLS para o bucket
-- =====================================================

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view diary images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;

-- Permitir que usuários autenticados façam upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'diary-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir leitura pública das imagens
CREATE POLICY "Anyone can view diary images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'diary-images');

-- Permitir que usuários deletem suas próprias imagens
CREATE POLICY "Users can delete own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'diary-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir que usuários atualizem suas próprias imagens
CREATE POLICY "Users can update own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'diary-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
