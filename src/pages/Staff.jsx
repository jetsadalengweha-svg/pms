import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Staff() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email:'', full_name:'', role:'staff', phone:'' })
  const [saving, setSaving] = useState(false)

  const ROLES = { admin:'ผู้ดูแลระบบ', pharmacist:'เภสัชกร', manager:'ผู้จัดการ', staff:'พนักงานขาย' }

  useEffect(() => { fetchStaff() }, [])

  const fetchStaff = async () => {
    setLoading(true)
    const { data } = await supabase.from('users').select('*').order('full_name')
    setStaff(data || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!form.email || !form.full_name) return
    setSaving(true)
    const { data, error } = await supabase.auth.admin.createUser({
      email: form.email,
      password: 'Pharmacy@1234',
      email_confirm: true
    })
    if (!error && data.user) {
      await supabase.from('users').insert([{
        id: data.user.id,
        full_name: form.full_name,
        role: form.role,
        phone: form.phone
      }])
    }
    setForm({ email:'', full_name:'', role:'staff', phone:'' })
    setShowForm(false)
    setSaving(false)
    fetchStaff()
  }

  const inp = { width:'100%', padding:'8px 10px', borderRadius:6,
    border:'1px solid #e2e8f0', marginTop:4, fontFamily:'inherit' }

  const roleColor = { admin:'#dbeafe', pharmacist:'#dcfce7', manager:'#fef3c7', staff:'#f1f5f9' }
  const roleText = { admin:'#1d4ed8', pharmacist:'#16a34a', manager:'#d97706', staff:'#475569' }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:700 }}>พนักงาน</h1>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding:'8px 16px', background:'#0f766e', color:'#fff',
          border:'none', borderRadius:7, cursor:'pointer', fontFamily:'inherit'
        }}>+ เพิ่มพนักงาน</button>
      </div>

      {showForm && (
        <div style={{ background:'#fff', padding:20, borderRadius:10, marginBottom:20, boxShadow:'0 2px 8px #0001' }}>
          <h3 style={{ marginBottom:16 }}>เพิ่มพนักงานใหม่</h3>
          <p style={{ fontSize:13, color:'#64748b', marginBottom:12 }}>
            รหัสผ่านเริ่มต้น: <strong>Pharmacy@1234</strong> (แนะนำให้เปลี่ยนหลัง login)
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={{ fontSize:13 }}>ชื่อ-นามสกุล *</label>
              <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} style={inp} />
            </div>
            <div>
              <label style={{ fontSize:13 }}>อีเมล *</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={inp} />
            </div>
            <div>
              <label style={{ fontSize:13 }}>เบอร์โทร</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={inp} />
            </div>
            <div>
              <label style={{ fontSize:13 }}>ตำแหน่ง</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                style={{ ...inp }}>
                {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop:16, display:'flex', gap:8 }}>
            <button onClick={handleSave} disabled={saving} style={{
              padding:'8px 20px', background:'#0f766e', color:'#fff',
              border:'none', borderRadius:6, cursor:'pointer', fontFamily:'inherit'
            }}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
            <button onClick={() => setShowForm(false)} style={{
              padding:'8px 20px', background:'#e2e8f0',
              border:'none', borderRadius:6, cursor:'pointer', fontFamily:'inherit'
            }}>ยกเลิก</button>
          </div>
        </div>
      )}

      {loading ? <p>กำลังโหลด...</p> : (
        <div style={{ background:'#fff', borderRadius:10, overflow:'hidden', boxShadow:'0 2px 8px #0001' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['ชื่อ-นามสกุล','เบอร์โทร','ตำแหน่ง'].map(h => (
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:13, color:'#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.id} style={{ borderTop:'1px solid #f1f5f9' }}>
                  <td style={{ padding:'10px 12px', fontWeight:500 }}>{s.full_name}</td>
                  <td style={{ padding:'10px 12px', fontSize:13 }}>{s.phone}</td>
                  <td style={{ padding:'10px 12px' }}>
                    <span style={{ padding:'2px 10px', borderRadius:20, fontSize:12,
                      background: roleColor[s.role], color: roleText[s.role] }}>
                      {ROLES[s.role] || s.role}
                    </span>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr><td colSpan={3} style={{ padding:24, textAlign:'center', color:'#94a3b8' }}>ไม่พบข้อมูล</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
