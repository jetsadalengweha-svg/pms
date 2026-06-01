import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', phone:'', address:'', allergy:'' })

  useEffect(() => { fetchCustomers() }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    const { data } = await supabase.from('customers').select('*').order('name')
    setCustomers(data || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!form.name) return
    await supabase.from('customers').insert([form])
    setForm({ name:'', phone:'', address:'', allergy:'' })
    setShowForm(false)
    fetchCustomers()
  }

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  const inp = { width:'100%', padding:'8px 10px', borderRadius:6,
    border:'1px solid #e2e8f0', marginTop:4, fontFamily:'inherit' }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:700 }}>ลูกค้า</h1>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding:'8px 16px', background:'#0f766e', color:'#fff',
          border:'none', borderRadius:7, cursor:'pointer', fontFamily:'inherit'
        }}>+ เพิ่มลูกค้า</button>
      </div>

      {showForm && (
        <div style={{ background:'#fff', padding:20, borderRadius:10, marginBottom:20, boxShadow:'0 2px 8px #0001' }}>
          <h3 style={{ marginBottom:16 }}>เพิ่มลูกค้าใหม่</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[['name','ชื่อ-นามสกุล *'],['phone','เบอร์โทร'],
              ['address','ที่อยู่'],['allergy','แพ้ยา']
            ].map(([key, label]) => (
              <div key={key}>
                <label style={{ fontSize:13 }}>{label}</label>
                <input value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} style={inp} />
              </div>
            ))}
          </div>
          <div style={{ marginTop:16, display:'flex', gap:8 }}>
            <button onClick={handleSave} style={{
              padding:'8px 20px', background:'#0f766e', color:'#fff',
              border:'none', borderRadius:6, cursor:'pointer', fontFamily:'inherit'
            }}>บันทึก</button>
            <button onClick={() => setShowForm(false)} style={{
              padding:'8px 20px', background:'#e2e8f0',
              border:'none', borderRadius:6, cursor:'pointer', fontFamily:'inherit'
            }}>ยกเลิก</button>
          </div>
        </div>
      )}

      <input placeholder="ค้นหาชื่อ หรือเบอร์โทร..."
        value={search} onChange={e => setSearch(e.target.value)}
        style={{ ...inp, marginBottom:16, width:300 }} />

      {loading ? <p>กำลังโหลด...</p> : (
        <div style={{ background:'#fff', borderRadius:10, overflow:'hidden', boxShadow:'0 2px 8px #0001' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['ชื่อ-นามสกุล','เบอร์โทร','ที่อยู่','แพ้ยา'].map(h => (
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:13, color:'#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderTop:'1px solid #f1f5f9' }}>
                  <td style={{ padding:'10px 12px', fontWeight:500 }}>{c.name}</td>
                  <td style={{ padding:'10px 12px', fontSize:13 }}>{c.phone}</td>
                  <td style={{ padding:'10px 12px', fontSize:13 }}>{c.address}</td>
                  <td style={{ padding:'10px 12px' }}>
                    {c.allergy && (
                      <span style={{ padding:'2px 8px', borderRadius:20, fontSize:12,
                        background:'#fee2e2', color:'#ef4444' }}>{c.allergy}</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} style={{ padding:24, textAlign:'center', color:'#94a3b8' }}>ไม่พบข้อมูล</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
