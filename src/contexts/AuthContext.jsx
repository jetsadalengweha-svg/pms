import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [role, setRole]       = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (uid) => {
    const { data } = await supabase.from('users').select('*').eq('id', uid).single()
    if (data) { setProfile(data); setRole(data.role) }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setRole(null) }
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, pw) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (error) throw error
  }
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null); setProfile(null); setRole(null)
  }
  const can = (roles) => roles.includes(role)

  return (
    <AuthContext.Provider value={{ user, profile, role, signIn, signOut, can }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}