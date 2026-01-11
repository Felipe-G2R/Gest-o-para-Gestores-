import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/hooks/useAuthStore'
import { useThemeStore } from '@/hooks/useThemeStore'
import {
  LoginPage,
  DashboardPage,
  ClientsPage,
  ClientDetailPage,
  SettingsPage,
  TMIPage,
  GerencIAPage,
  DiaryPage,
  CalendarPage,
  BasePage,
  RatariaPage,
  AccessPage,
} from '@/pages'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  const { init } = useThemeStore()

  useEffect(() => {
    init()
  }, [init])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <ClientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/:id"
          element={
            <ProtectedRoute>
              <ClientDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tmi"
          element={
            <ProtectedRoute>
              <TMIPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gerencia"
          element={
            <ProtectedRoute>
              <GerencIAPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/diary"
          element={
            <ProtectedRoute>
              <DiaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/base"
          element={
            <ProtectedRoute>
              <BasePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rataria"
          element={
            <ProtectedRoute>
              <RatariaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/acessos"
          element={
            <ProtectedRoute>
              <AccessPage />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
