import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function Reports() {
  const [sales, setSales] = useState([])
  const [dailyData, setDailyData] = useState([])
  const [topDrugs, setTopDrugs] = useState([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState(7)

  useEffect(() => { fetchData() }, [range])

  const fetchData = async () => {
    setLoading(true)
    const from = new Date()
    from.setDate(from.getDate() - range)

    const { data: salesData } = await supabase
      .from('sales')
      .select('*, sale_items(*, drugs(name))')
      .gte('created_at', from.toISOString())
      .order('created_at', { ascending: false })

    setSales(salesData || [])

    const daily = {}
    for (const s of salesData || []) {
      const date = new Date(s.created_at).toLocaleDateString('th-TH', { day:'2-digit', month:'short' })
      daily[date] = (daily[date] || 0) + s.total
    }
    setDailyData(Object.entries(daily).map(([date, total]) => ({ date, total })))

    const drugCount = {}
    for (const s of salesData || []) {
      for (const item of s.sale_items || []) {
        const name = item.drugs?.name || 'unknown'
        drugCount[name] = (drugCount[name] || 0) + item.qty
      }
    }
    setTopDrugs(
      Object.entries(drugCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, qty]) => ({ name, qty }))
    )
    setLoading(false)
  }

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0)
  const totalOrders = sales.length
  const avgPerOrder = totalOrders ? totalRevenue / totalOrders : 0

  const card = (label, value, color) => (
    <div style={{ background:'#fff', padding:20, borderRadius:10, boxShadow:'0 2px 8px #0001' }}>
      <div style={{ color:'#64748b', fontSize:13 }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:700, color, marginTop:4 }}>{value}</div>
    </div>
  )

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:700 }}>รายงานการขาย</h1>
        <select value={range} onChange={e => setRange(Number(e.target.value))}
          style={{ padding:'7px 12px', borderRadius:7, border:'1px solid #e2e8f0', fontFamily:'inherit' }}>
          <option value={7}>7 วันล่าสุด</option>
          <option value={30}>30 วันล่าสุด</option>
          <option value={90}>90 วันล่าสุด</option>
        </select>
      </div>

      {loading ? <p>กำลังโหลด...</p> : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
            {card('รายได้รวม', `${totalRevenue.toLocaleString()} บ.`, '#0f766e')}
            {card('จำนวนบิล', `${totalOrders} ใบ`, '#3b82f6')}
            {card('เฉลี่ย/บิล', `${Math.round(avgPerOrder).toLocaleString()} บ.`, '#8b5cf6')}
          </div>

          <div style={{ background:'#fff', padding:20, borderRadius:10, boxShadow:'0 2px 8px #0001', marginBottom:20 }}>
            <h3 style={{ marginBottom:16 }}>ยอดขายรายวัน</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyData}>
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={v => `${v.toLocaleString()} บ.`} />
                <Line type="monotone" dataKey="total" stroke="#0f766e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background:'#fff', padding:20, borderRadius:10, boxShadow:'0 2px 8px #0001', marginBottom:20 }}>
            <h3 style={{ marginBottom:16 }}>ยาขายดี Top 10</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topDrugs} layout="vertical">
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="name" type="category" fontSize={11} width={120} />
                <Tooltip />
                <Bar dataKey="qty" fill="#0f766e" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background:'#fff', borderRadius:10, overflow:'hidden', boxShadow:'0 2px 8px #0001' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f8fafc' }}>
                  {['วันที่/เวลา','รายการ','รวม','รับเงิน','ทอน'].map(h => (
                    <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:13, color:'#64748b' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s.id} style={{ borderTop:'1px solid #f1f5f9' }}>
                    <td style={{ padding:'10px 12px', fontSize:13 }}>
                      {new Date(s.created_at).toLocaleString('th-TH')}
                    </td>
                    <td style={{ padding:'10px 12px', fontSize:13 }}>
                      {s.sale_items?.length} รายการ
                    </td>
                    <td style={{ padding:'10px 12px', fontWeight:600, color:'#0f766e' }}>
                      {s.total?.toLocaleString()} บ.
                    </td>
                    <td style={{ padding:'10px 12px', fontSize:13 }}>
                      {s.paid?.toLocaleString()} บ.
                    </td>
                    <td style={{ padding:'10px 12px', fontSize:13 }}>
                      {(s.paid - s.total)?.toLocaleString()} บ.
                    </td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr><td colSpan={5} style={{ padding:24, textAlign:'center', color:'#94a3b8' }}>ยังไม่มีข้อมูล</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
