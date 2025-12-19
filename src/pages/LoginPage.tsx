import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/hooks/useAuthStore'
import { useThemeStore } from '@/hooks/useThemeStore'
import { LogIn, Mail, Lock, AlertCircle, Sun, Moon, UserPlus } from 'lucide-react'

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const navigate = useNavigate()
  const { signIn, signUp, isAuthenticated, error, loading } = useAuthStore()
  const { theme, toggleTheme, init } = useThemeStore()

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let success = false
    if (isLogin) {
      success = await signIn(email, password)
    } else {
      success = await signUp(email, password, name)
    }
    if (success) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 btn btn-ghost btn-circle"
      >
        {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl font-bold text-white">GG</span>
          </div>
          <h1 className="text-3xl font-bold">
            Gestão para <span className="text-primary">Gestores</span>
          </h1>
          <p className="text-base-content/60 mt-2">
            Sistema de Gerenciamento de Clientes
          </p>
        </div>

        {/* Auth Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title justify-center mb-4">
              {isLogin ? 'Entrar na sua conta' : 'Criar sua conta'}
            </h2>

            {/* Error Alert */}
            {error && (
              <div className="alert alert-error mb-4">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name (only for signup) */}
              {!isLogin && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Nome Completo</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                      <UserPlus className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      className="input input-bordered w-full pl-10"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="input input-bordered w-full pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Senha</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input input-bordered w-full pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {!loading && (isLogin ? <LogIn className="w-5 h-5 mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />)}
                {loading ? (isLogin ? 'Entrando...' : 'Criando conta...') : (isLogin ? 'Entrar' : 'Criar Conta')}
              </button>
            </form>

            <div className="divider">ou</div>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="btn btn-ghost w-full"
              disabled={loading}
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-base-content/40 mt-6">
          Gestão para Gestores &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
