import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout    from './components/Layout'
import Login     from './pages/Login'
import Stock     from './pages/Stock'
import POS       from './pages/POS'
import Purchase  from './pages/Purchase'
import Reports   from './pages/Reports'
import Customers from './pages/Customers'
import Patients  from './pages/Patients'
import Staff     from './pages/Staff'
import Analytics from './pages/Analytics'

function Guard({ children, roles }) {
  const { user, role } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/stock" replace /> : <Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/stock" replace />} />
        <Route path="/stock"     element={<Guard><Stock /></Guard>} />
        <Route path="/pos"       element={<Guard><POS /></Guard>} />
        <Route path="/purchase"  element={<Guard><Purchase /></Guard>} />
        <Route path="/reports"   element={<Guard><Reports /></Guard>} />
        <Route path="/customers" element={<Guard><Customers /></Guard>} />
        <Route path="/patients"  element={<Guard><Patients /></Guard>} />
        <Route path="/staff"     element={<Guard><Staff /></Guard>} />
        <Route path="/analytics" element={<Guard><Analytics /></Guard>} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/pms">
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}