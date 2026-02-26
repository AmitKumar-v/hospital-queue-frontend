import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import ReceptionistPage from './pages/receptionist/ReceptionistPage'
import DoctorQueue from './pages/doctor/DoctorQueue'
import TokenTracker from './pages/TokenTracker'

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-blue-600 text-xl">Loading...</div>
    </div>
  )

  if (!user) return <Navigate to="/login" />
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" />

  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/track" element={<TokenTracker />} />
      <Route path="/" element={
        user ? (
          user.role === 'ADMIN' ? <Navigate to="/admin/dashboard" /> :
          user.role === 'RECEPTIONIST' ? <Navigate to="/receptionist/register" /> :
          <Navigate to="/doctor/queue" />
        ) : <Navigate to="/login" />
      } />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRole="ADMIN">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/receptionist/register" element={
        <ProtectedRoute allowedRole="RECEPTIONIST">
          <ReceptionistPage />
        </ProtectedRoute>
      } />
      <Route path="/doctor/queue" element={
        <ProtectedRoute allowedRole="DOCTOR">
          <DoctorQueue />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}