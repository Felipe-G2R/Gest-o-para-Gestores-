import { useState, useRef } from 'react'
import { MainLayout } from '@/components/layout'
import { useAuthStore } from '@/hooks/useAuthStore'
import { useThemeStore } from '@/hooks/useThemeStore'
import { User, Moon, Sun, Save, Info, Camera, Loader2 } from 'lucide-react'

export function SettingsPage() {
  const { user, updateProfile, uploadAvatar } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    setSaving(true)
    await updateProfile({ name })
    setSaving(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    await uploadAvatar(file)
    setUploading(false)
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold">Configurações</h2>

        {/* Profile */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title gap-2">
              <User className="w-5 h-5" />
              Perfil
            </h3>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary bg-base-200 flex items-center justify-center">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-base-content/20" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 btn btn-circle btn-primary btn-sm"
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-base-content/60">
                Clique na câmera para alterar sua foto de perfil
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-medium">Nome</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered"
              />
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                value={user?.email || ''}
                type="email"
                className="input input-bordered"
                disabled
              />
            </div>

            <div className="card-actions justify-end mt-4">
              <button
                onClick={handleSave}
                className={`btn btn-primary gap-2 ${saving ? 'loading' : ''}`}
                disabled={saving}
              >
                {!saving && <Save className="w-5 h-5" />}
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title gap-2">
              {theme === 'light' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              Tema
            </h3>

            <div className="form-control mt-4">
              <label className="label cursor-pointer">
                <span className="label-text">Modo Escuro</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title gap-2">
              <Info className="w-5 h-5" />
              Sobre o Sistema
            </h3>

            <div className="mt-4 space-y-2 text-sm text-base-content/70">
              <p>
                <strong>Versão:</strong> 1.0.0
              </p>
              <p>
                <strong>Sistema:</strong> Gestão para Gestores
              </p>
              <p>
                <strong>Desenvolvido com:</strong> React + Vite + Tailwind CSS
              </p>
              <p>
                <strong>Banco de Dados:</strong> Supabase (PostgreSQL)
              </p>
              <p>
                <strong>Storage:</strong> Supabase Storage
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
