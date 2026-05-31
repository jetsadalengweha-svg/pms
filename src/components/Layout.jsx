import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ROLE_LABEL = {
  admin:'ผู้ดูแลระบบ', pharmacist:'เภสัชกร',
  manager:'ผู้จัดการ', staff:'พนักงานขาย',
}
const NAV = [
  { to:'/stock',     icon:'🧪', label:'สต๊อกยา',       roles:['admin','pharmacist','manager','staff'] },
  { to:'/pos',       icon:'🛒', label:'ขายยา (POS)',   roles:['admin','pharmacist','manager','staff'] },
  { to:'/purchase',  icon:'🚚', label:'จัดซื้อ',       roles:['admin','pharmacist','manager'] },
  { to:'/reports',   icon:'📋', label:'รายงาน ขย.',    roles:['admin','pharmacist'] },
  { to:'/customers', icon:'👤', label:'ลูกค้า (CRM)',  roles:['admin','pharmacist','manager','staff'] },
  { to:'/patients',  icon:'🩺', label:'ติดตามผู้ป่วย', roles:['admin','pharmacist','manager'] },
  { to:'/staff',     icon:'👔', label:'พนักงาน',       roles:['admin','manager'] },
  { to:'/analytics', icon:'📊', label:'รายงานธุรกิจ',  roles:['admin','manager'] },
]

export default function Layout() {
  const { profile, role, signOut } = useAuth()
  const navigate = useNavigate()
  const nav = NAV.filter(n => n.roles.includes(role))

  return (
    

      

        

          
💊 PMS

          
ระบบบริหารร้านขายยา

        

        

          {nav.map(n => (
            ({
              display:'flex',alignItems:'center',gap:10,
              padding:'9px 12px',borderRadius:7,marginBottom:2,
              textDecoration:'none',fontSize:13,fontWeight:500,
              background:isActive?'#0f766e':'transparent',
              color:isActive?'#fff':'#94a3b8',
            })}>
              {n.icon}{n.label}
            
          ))}
        

        

          
{profile?.full_name||'ผู้ใช้งาน'}

          
{ROLE_LABEL[role]||role}

          {await signOut();navigate('/login')}} style={{
            width:'100%',padding:'7px',borderRadius:6,border:'none',
            background:'#1e293b',color:'#94a3b8',cursor:'pointer',fontSize:12,
          }}>🚪 ออกจากระบบ
        

      

      

        
      

    

  )
}
