import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout     from './components/Layout'
import Login      from './pages/Login'
import Stock      from './pages/Stock'
import POS        from './pages/POS'
import Purchase   from './pages/Purchase'
import Reports    from './pages/Reports'
import Customers  from './pages/Customers'
import Patients   from './pages/Patients'
import Staff      from './pages/Staff'
import Analytics  from './pages/Analytics'

function Guard({ children, roles }) {
  const { user, role } = useAuth()
  if (!user) return 
  if (roles && !roles.includes(role)) return 
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    
       : } />
      }>
        } />
        } />
        } />
        } />
        } />
        } />
        } />
        } />
        } />
      
    
  )
}

export default function App() {
  return (
    
      
    
  )
}
