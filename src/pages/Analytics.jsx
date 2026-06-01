import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({ revenue:0, cost:0, profit:0, orders:0 })
  const [monthly, setMonthly] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [lowStock, setLowStock] = useState([])

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    const [{ data: sales }, { data: purchases }, { data: drugs }] = await Promise.all([
      supabase.from('sales').select('*, sale_items(*)'),
      supabase.from('purchases').select('*'),
      supabase.from('drugs').select('*')
    ])

    const revenue = (sales || []).reduce((s, x) => s + x.total, 0)
    const cost = (purchases || []).reduce((s, x) => s + x.total, 0)
    setSummary({ revenue, cost, profit: revenue - cost, orders: (sales || []).length })

    const mon = {}
    for (const s of sales || []) {
      const m = new Date(s.created_at).toLocaleDateString('th-TH', { month:'short', year:'2-digit' })
      mon[m] = (mon[m] || 0) + s.total
    }
    setMonthly(Object.entries(mon).map(([month, revenue]) => ({ month, revenue })))

    const cat = {}
    for (const d of drugs || []) {
      const c = d.category || 'อื่นๆ'
      cat[c] = (cat[c] || 0) + 1
    }
    setCategoryData(Object.entries(cat).map(([name, value]) => ({ name, value })))

    setLowStock((drugs || []).filter(d => d.stock_qty <= d.min_qty).sort((a, b) => a.stock_qty - b.stock_qty))
    setLoading(false)
  }

  const COLORS = ['#0f766e','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#10b981']

  const card = (label, value, color, sub) => (
    <div style={{ background:'#fff', padding:20, borderRadius:10, boxShadow:'0 2px 8px #0001' }}>
      <div style={{ color:'#64748b', fontSize:13 }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:700, color, marginTop:4 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'#94a3b8', marginTop:4 }}>{sub}</div>}
    </div>
  )

  return (
    <div>
      <h1 style={{ fontSize:22, fontWeight:700, marginBottom:20 }}>รายงานธุรกิจ</h1>

      {loading ? <p>กำลังโหลด...</p> : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
            {card('รายได้รวม', `${summary.revenue.toLocaleString()} บ.`, '#0f766e')}
            {card('ต้นทุนรวม', `${summary.cost.toLocaleString()} บ.`, '#ef4444')}
            {card('กำไรสุทธิ', `${(summary.revenue - summary.cost).toLocaleString()} บ.`,
              summary.revenue >= summary.cost ? '#16a34a' : '#ef4444')}
            {card('บิลทั้งหมด', `${summary.orders} ใบ`, '#3b82f6')}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:20 }}>
            <div style={{ background:'#fff', padding:20, borderRadius:10, boxShadow:'0 2px 8px #0001' }}>
              <h3 style={{ marginBottom:16 }}>รายได้รายเดือน</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthly}>
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={v => `${v.toLocaleString()} บ.`} />
                  <Bar dataKey="revenue" fill="#0f766e" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background:'#fff', padding:20, borderRadius:10, boxShadow:'0 2px 8px #0001' }}>
              <h3 style={{ marginBottom:16 }}>สัดส่วนยาตามหมวดหมู่</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend fontSize={12} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background:'#fff', borderRadius:10, overflow:'hidden', boxShadow:'0 2px 8px #0001' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9' }}>
              <h3>ยาใกล้หมด / ต้องสั่งซื้อ</h3>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f8fafc' }}>
                  {['ชื่อยา','หมวดหมู่','คงเหลือ','ขั้นต่ำ','สถานะ'].map(h => (
                    <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:13, color:'#64748b' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lowStock.map(d => (
                  <tr key={d.id} style={{ borderTop:'1px solid #f1f5f9' }}>
                    <td style={{ padding:'10px 12px', fontWeight:500 }}>{d.name}</td>
                    <td style={{ padding:'10px 12px', fontSize:13 }}>{d.category}</td>
                    <td style={{ padding:'10px 12px', fontWeight:700, color:'#ef4444' }}>{d.stock_qty}</td>
                    <td style={{ padding:'10px 12px', fontSize:13 }}>{d.min_qty}</td>
                    <td style={{ padding:'10px 12px' }}>
                      <span style={{ padding:'2px 8px', borderRadius:20, fontSize:12,
                        background: d.stock_qty === 0 ? '#fee2e2' : '#fef3c7',
                        color: d.stock_qty === 0 ? '#ef4444' : '#d97706' }}>
                        {d.stock_qty === 0 ? 'หมดแล้ว' : 'ใกล้หมด'}
                      </span>
                    </td>
                  </tr>
                ))}
                {lowStock.length === 0 && (
                  <tr><td colSpan={5} style={{ padding:24, textAlign:'center', color:'#94a3b8' }}>สต๊อกปกติทุกรายการ</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
