import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await signIn(email, password) }
    catch { setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง') }
    finally { setLoading(false) }
  }

  const inp = {
    width:'100%',padding:'10px 12px',borderRadius:7,
    border:'1px solid #e2e8f0',fontSize:14,marginTop:4,
    outline:'none',fontFamily:'inherit',
  }
  return (
    

      

        

          
💊

          
ระบบบริหารร้านขายยา

          

ขย. ประเภท 1


        

        

          

            อีเมล
            setEmail(e.target.value)} placeholder="pharmacist@example.com" required/>
          

          

            รหัสผ่าน
            setPassword(e.target.value)} placeholder="••••••••" required/>
          

          {error && 
⚠️ {error}
}
          {loading?'กำลังเข้าสู่ระบบ...':'🔐 เข้าสู่ระบบ'}
        

      

    

  )
}
