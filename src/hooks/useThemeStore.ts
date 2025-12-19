import { create } from 'zustand'
import { getStoredTheme, setStoredTheme } from '@/utils/storage'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  init: () => void
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute(
    'data-theme',
    theme === 'dark' ? 'facebook-dark' : 'facebook'
  )
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',

  init: () => {
    const theme = getStoredTheme()
    set({ theme })
    applyTheme(theme)
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light'
    set({ theme: newTheme })
    setStoredTheme(newTheme)
    applyTheme(newTheme)
  },

  setTheme: (theme: Theme) => {
    set({ theme })
    setStoredTheme(theme)
    applyTheme(theme)
  }
}))
