import { supabase } from '@/lib/supabase'

const BUCKET_NAME = 'diary-images'

interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Faz upload de uma imagem para o Supabase Storage
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  try {
    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP.',
      }
    }

    // Validar tamanho (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Arquivo muito grande. O tamanho máximo é 5MB.',
      }
    }

    // Obter usuário atual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'Usuário não autenticado.',
      }
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`

    // Fazer upload
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return {
        success: false,
        error: 'Erro ao fazer upload da imagem.',
      }
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    return {
      success: true,
      url: publicUrl,
    }
  } catch (error) {
    console.error('Image upload error:', error)
    return {
      success: false,
      error: 'Erro inesperado ao fazer upload.',
    }
  }
}

/**
 * Deleta uma imagem do Supabase Storage
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    // Extrair o path do arquivo da URL
    const bucketUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`
    if (!url.startsWith(bucketUrl)) {
      return false
    }

    const filePath = url.replace(bucketUrl, '')

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Image delete error:', error)
    return false
  }
}
