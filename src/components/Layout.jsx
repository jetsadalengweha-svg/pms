import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const NAV = [
  { to:'/stock',     label:'สต๊อกยา',       roles:['admin','pharmacist','manager','staff'] },
  { to:'/pos',       label:'ขายยา (POS)',    roles:['admin','pharmacist','manager','staff'] },
  { to:'/purchase',  label:'จัดซื้อ',        roles:['admin','pharmacist','manager'] },
  { to:'/reports',   label:'รายงาน',         roles:['admin','pharmacist'] },
  { to:'/customers', label:'ลูกค้า',         roles:['admin','pharmacist','manager','staff'] },
  { to:'/patients',  label:'ติดตามผู้ป่วย',  roles:['admin','pharmacist','manager'] },
  { to:'/staff',     label:'พนักงาน',        roles:['admin','manager'] },
  { to:'/analytics', label:'รายงานธุรกิจ',   roles:['admin','manager'] },
]

export default function Layout() {
  const { profile, role, signOut } = useAuth()
  const navigate = useNavigate()
  const nav = NAV.filter(n => n.roles.includes(role))

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <div style={{ width:200, background:'#0f172a', padding:16, display:'flex', flexDirection:'column' }}>
        <div style={{ color:'#fff', fontWeight:700, marginBottom:24 }}>PMS ร้านขายยา</div>
        <nav>
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} style={({ isActive }) => ({
              display:'block', padding:'8px 12px', borderRadius:6, marginBottom:2,
              textDecoration:'none', fontSize:13,
              background: isActive ? '#0f766e' : 'transparent',
              color: isActive ? '#fff' : '#94a3b8',
            })}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop:'auto', color:'#94a3b8', fontSize:12 }}>
          <div>{profile?.full_name || 'ผู้ใช้งาน'}</div>
          <button onClick={async () => { await signOut(); navigate('/login') }}
            style={{ marginTop:8, width:'100%', padding:7, borderRadius:6, border:'none', background:'#1e293b', color:'#94a3b8', cursor:'pointer' }}>
            ออกจากระบบ
          </button>
        </div>
      </div>
      <div style={{ flex:1, padding:24 }}>
        <Outlet />
      </div>
    </div>
  )
}