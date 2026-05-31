import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try { await signIn(email, password) }
    catch { setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc' }}>
      <div style={{ background:'#fff', padding:32, borderRadius:12, width:360, boxShadow:'0 4px 24px #0001' }}>
        <h2 style={{ textAlign:'center', marginBottom:24 }}>ระบบบริหารร้านขายยา</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:16 }}>
            <label>อีเมล</label>
            <input value={email} onChange={e=>setEmail(e.target.value)}
              style={{ width:'100%', padding:'10px 12px', borderRadius:7, border:'1px solid #e2e8f0', marginTop:4 }}
              placeholder="pharmacist@example.com" required />
          </div>
          <div style={{ marginBottom:16 }}>
            <label>รหัสผ่าน</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              style={{ width:'100%', padding:'10px 12px', borderRadius:7, border:'1px solid #e2e8f0', marginTop:4 }}
              placeholder="••••••••" required />
          </div>
          {error && <p style={{ color:'red', marginBottom:12 }}>{error}</p>}
          <button type="submit" style={{ width:'100%', padding:12, background:'#0f766e', color:'#fff', border:'none', borderRadius:7, cursor:'pointer' }}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  )
}