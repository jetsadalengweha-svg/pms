import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', dob:'', phone:'', disease:'', note:'' })

  useEffect(() => { fetchPatients() }, [])

  const fetchPatients = async () => {
    setLoading(true)
    const { data } = await supabase.from('patients').select('*').order('name')
    setPatients(data || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!form.name) return
    await supabase.from('patients').insert([form])
    setForm({ name:'', dob:'', phone:'', disease:'', note:'' })
    setShowForm(false)
    fetchPatients()
  }

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search) ||
    p.disease?.toLowerCase().includes(search.toLowerCase())
  )

  const inp = { width:'100%', padding:'8px 10px', borderRadius:6,
    border:'1px solid #e2e8f0', marginTop:4, fontFamily:'inherit' }

  const calcAge = (dob) => {
    if (!dob) return '-'
    const diff = Date.now() - new Date(dob).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365)) + ' ปี'
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:700 }}>ติดตามผู้ป่วย</h1>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding:'8px 16px', background:'#0f766e', color:'#fff',
          border:'none', borderRadius:7, cursor:'pointer', fontFamily:'inherit'
        }}>+ เพิ่มผู้ป่วย</button>
      </div>

      {showForm && (
        <div style={{ background:'#fff', padding:20, borderRadius:10, marginBottom:20, boxShadow:'0 2px 8px #0001' }}>
          <h3 style={{ marginBottom:16 }}>เพิ่มผู้ป่วยใหม่</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={{ fontSize:13 }}>ชื่อ-นามสกุล *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inp} />
            </div>
            <div>
              <label style={{ fontSize:13 }}>วันเกิด</label>
              <input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} style={inp} />
            </div>
            <div>
              <label style={{ fontSize:13 }}>เบอร์โทร</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={inp} />
            </div>
            <div>
              <label style={{ fontSize:13 }}>โรคประจำตัว</label>
              <input value={form.disease} onChange={e => setForm({...form, disease: e.target.value})} style={inp} />
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ fontSize:13 }}>หมายเหตุ</label>
              <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})}
                style={{ ...inp, height:80, resize:'vertical' }} />
            </div>
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

      <input placeholder="ค้นหาชื่อ เบอร์โทร หรือโรค..."
        value={search} onChange={e => setSearch(e.target.value)}
        style={{ ...inp, marginBottom:16, width:300 }} />

      {loading ? <p>กำลังโหลด...</p> : (
        <div style={{ background:'#fff', borderRadius:10, overflow:'hidden', boxShadow:'0 2px 8px #0001' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['ชื่อ-นามสกุล','อายุ','เบอร์โทร','โรคประจำตัว','หมายเหตุ'].map(h => (
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:13, color:'#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderTop:'1px solid #f1f5f9' }}>
                  <td style={{ padding:'10px 12px', fontWeight:500 }}>{p.name}</td>
                  <td style={{ padding:'10px 12px', fontSize:13 }}>{calcAge(p.dob)}</td>
                  <td style={{ padding:'10px 12px', fontSize:13 }}>{p.phone}</td>
                  <td style={{ padding:'10px 12px' }}>
                    {p.disease && (
                      <span style={{ padding:'2px 8px', borderRadius:20, fontSize:12,
                        background:'#fef3c7', color:'#d97706' }}>{p.disease}</span>
                    )}
                  </td>
                  <td style={{ padding:'10px 12px', fontSize:13, color:'#64748b' }}>{p.note}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ padding:24, textAlign:'center', color:'#94a3b8' }}>ไม่พบข้อมูล</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
