// LocalStorage utilities
const STORAGE_KEYS = {
  USER: 'gg_user',
  CLIENTS: 'gg_clients',
  THEME: 'gg_theme',
} as const

export function getStoredUser() {
  const data = localStorage.getItem(STORAGE_KEYS.USER)
  return data ? JSON.parse(data) : null
}

export function setStoredUser(user: unknown) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}

export function removeStoredUser() {
  localStorage.removeItem(STORAGE_KEYS.USER)
}

export function getStoredClients() {
  const data = localStorage.getItem(STORAGE_KEYS.CLIENTS)
  return data ? JSON.parse(data) : []
}

export function setStoredClients(clients: unknown[]) {
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients))
}

export function getStoredTheme(): 'light' | 'dark' {
  const theme = localStorage.getItem(STORAGE_KEYS.THEME)
  if (theme === 'dark' || theme === 'light') return theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function setStoredTheme(theme: 'light' | 'dark') {
  localStorage.setItem(STORAGE_KEYS.THEME, theme)
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
