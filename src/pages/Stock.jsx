import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Stock() {
  const [drugs, setDrugs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name:'', generic_name:'', category:'',
    unit:'', price_buy:'', price_sell:'',
    stock_qty:'', min_qty:'', expire_date:'', barcode:''
  })

  useEffect(() => { fetchDrugs() }, [])

  const fetchDrugs = async () => {
    setLoading(true)
    const { data } = await supabase.from('drugs').select('*').order('name')
    setDrugs(data || [])
    setLoading(false)
  }

  const handleSave = async () => {
    await supabase.from('drugs').insert([form])
    setForm({ name:'', generic_name:'', category:'',
      unit:'', price_buy:'', price_sell:'',
      stock_qty:'', min_qty:'', expire_date:'', barcode:'' })
    setShowForm(false)
    fetchDrugs()
  }

  const filtered = drugs.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.barcode?.includes(search)
  )

  const inp = { width:'100%', padding:'8px 10px', borderRadius:6,
    border:'1px solid #e2e8f0', marginTop:4, fontFamily:'inherit' }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:700 }}>สต๊อกยา</h1>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding:'8px 16px', background:'#0f766e', color:'#fff',
          border:'none', borderRadius:7, cursor:'pointer', fontFamily:'inherit'
        }}>+ เพิ่มยา</button>
      </div>

      {showForm && (
        <div style={{ background:'#fff', padding:20, borderRadius:10, marginBottom:20, boxShadow:'0 2px 8px #0001' }}>
          <h3 style={{ marginBottom:16 }}>เพิ่มยาใหม่</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[['name','ชื่อยา*'],['generic_name','ชื่อสามัญ'],
              ['category','หมวดหมู่'],['unit','หน่วย'],
              ['price_buy','ราคาซื้อ'],['price_sell','ราคาขาย'],
              ['stock_qty','จำนวนสต๊อก'],['min_qty','สต๊อกขั้นต่ำ'],
              ['barcode','Barcode'],['expire_date','วันหมดอายุ']
            ].map(([key, label]) => (
              <div key={key}>
                <label style={{ fontSize:13 }}>{label}</label>
                <input
                  type={key === 'expire_date' ? 'date' : key.includes('price') || key.includes('qty') ? 'number' : 'text'}
                  value={form[key]}
                  onChange={e => setForm({...form, [key]: e.target.value})}
                  style={inp}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop:16, display:'flex', gap:8 }}>
            <button onClick={handleSave} style={{
              padding:'8px 20px', background:'#0f766e', color:'#fff',
              border:'none', borderRadius:6, cursor:'pointer', fontFamily:'inherit'
            }}>บันทึก</button>
            <button onClick={() => setShowForm(false)} style={{
              padding:'8px 20px', background:'#e2e8f0', color:'#333',
              border:'none', borderRadius:6, cursor:'pointer', fontFamily:'inherit'
            }}>ยกเลิก</button>
          </div>
        </div>
      )}

      <input placeholder="ค้นหายา หรือ barcode..."
        value={search} onChange={e => setSearch(e.target.value)}
        style={{ ...inp, marginBottom:16, width:300 }} />

      {loading ? <p>กำลังโหลด...</p> : (
        <div style={{ background:'#fff', borderRadius:10, overflow:'hidden', boxShadow:'0 2px 8px #0001' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['ชื่อยา','หมวดหมู่','หน่วย','ราคาขาย','สต๊อก','วันหมดอายุ','สถานะ'].map(h => (
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:13, color:'#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} style={{ borderTop:'1px solid #f1f5f9' }}>
                  <td style={{ padding:'10px 12px' }}>
                    <div style={{ fontWeight:500 }}>{d.name}</div>
                    <div style={{ fontSize:12, color:'#94a3b8' }}>{d.generic_name}</div>
                  </td>
                  <td style={{ padding:'10px 12px', fontSize:13 }}>{d.category}</td>
                  <td style={{ padding:'10px 12px', fontSize:13 }}>{d.unit}</td>
                  <td style={{ padding:'10px 12px', fontSize:13 }}>{d.price_sell?.toLocaleString()} บ.</td>
                  <td style={{ padding:'10px 12px', fontSize:13 }}>
                    <span style={{
                      color: d.stock_qty <= d.min_qty ? '#ef4444' : '#22c55e',
                      fontWeight:600
                    }}>{d.stock_qty}</span>
                  </td>
                  <td style={{ padding:'10px 12px', fontSize:13 }}>{d.expire_date}</td>
                  <td style={{ padding:'10px 12px' }}>
                    <span style={{
                      padding:'2px 8px', borderRadius:20, fontSize:12,
                      background: d.stock_qty <= d.min_qty ? '#fee2e2' : '#dcfce7',
                      color: d.stock_qty <= d.min_qty ? '#ef4444' : '#16a34a'
                    }}>
                      {d.stock_qty <= d.min_qty ? 'ใกล้หมด' : 'ปกติ'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding:24, textAlign:'center', color:'#94a3b8' }}>ไม่พบข้อมูล</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
