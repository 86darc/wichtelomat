import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import ActionsListPage from './pages/actions/ActionsListPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import CreateActionPage from './pages/actions/CreateActionPage'
import ActionDetailPage from './pages/actions/ActionDetailPage'
import InvitationPage from './pages/invitation/InvitationPage'
import ProfilePage from './pages/profile/ProfilePage'

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <div>Laden...</div>
  return session ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Öffentlich */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/invitation/:token" element={<InvitationPage />} />

      {/* Geschützt */}
      <Route path="/" element={
        <ProtectedRoute><ActionsListPage /></ProtectedRoute>
      } />
      <Route path="/actions/new" element={
        <ProtectedRoute><CreateActionPage /></ProtectedRoute>
      } />
      <Route path="/actions/:id" element={
        <ProtectedRoute><ActionDetailPage /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><ProfilePage /></ProtectedRoute>
      } />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App