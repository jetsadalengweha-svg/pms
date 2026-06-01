import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function POS() {
  const { profile } = useAuth()
  const [drugs, setDrugs] = useState([])
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [paid, setPaid] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchDrugs() }, [])

  const fetchDrugs = async () => {
    const { data } = await supabase.from('drugs').select('*').order('name')
    setDrugs(data || [])
  }

  const addToCart = (drug) => {
    const existing = cart.find(c => c.id === drug.id)
    if (existing) {
      setCart(cart.map(c => c.id === drug.id ? {...c, qty: c.qty + 1} : c))
    } else {
      setCart([...cart, {...drug, qty: 1}])
    }
  }

  const removeFromCart = (id) => setCart(cart.filter(c => c.id !== id))

  const total = cart.reduce((sum, c) => sum + (c.price_sell * c.qty), 0)
  const change = paid ? Number(paid) - total : 0

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setLoading(true)
    const { data: sale } = await supabase.from('sales').insert([{
      total, paid: Number(paid), staff_id: profile?.id
    }]).select().single()

    if (sale) {
      await supabase.from('sale_items').insert(
        cart.map(c => ({
          sale_id: sale.id, drug_id: c.id,
          qty: c.qty, price: c.price_sell,
          total: c.price_sell * c.qty
        }))
      )
      for (const c of cart) {
        await supabase.from('drugs').update({
          stock_qty: c.stock_qty - c.qty
        }).eq('id', c.id)
      }
    }
    setCart([])
    setPaid('')
    setLoading(false)
    alert('ชำระเงินสำเร็จ!')
    fetchDrugs()
  }

  const filtered = drugs.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.barcode?.includes(search)
  )

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20, height:'calc(100vh - 80px)' }}>
      <div>
        <h1 style={{ fontSize:22, fontWeight:700, marginBottom:16 }}>ขายยา (POS)</h1>
        <input placeholder="ค้นหายา หรือ barcode..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width:'100%', padding:'8px 12px', borderRadius:7, border:'1px solid #e2e8f0', marginBottom:12, fontFamily:'inherit' }} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:10, overflowY:'auto', maxHeight:'calc(100vh - 180px)' }}>
          {filtered.map(d => (
            <div key={d.id} onClick={() => addToCart(d)}
              style={{ background:'#fff', padding:12, borderRadius:8, cursor:'pointer', boxShadow:'0 1px 4px #0001',
                opacity: d.stock_qty <= 0 ? 0.4 : 1, pointerEvents: d.stock_qty <= 0 ? 'none' : 'auto' }}>
              <div style={{ fontWeight:600, fontSize:14 }}>{d.name}</div>
              <div style={{ color:'#64748b', fontSize:12 }}>{d.unit}</div>
              <div style={{ color:'#0f766e', fontWeight:700, marginTop:4 }}>{d.price_sell?.toLocaleString()} บ.</div>
              <div style={{ fontSize:12, color: d.stock_qty <= d.min_qty ? '#ef4444' : '#94a3b8' }}>คงเหลือ: {d.stock_qty}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:'#fff', borderRadius:10, padding:16, boxShadow:'0 2px 8px #0001', display:'flex', flexDirection:'column' }}>
        <h3 style={{ marginBottom:12 }}>รายการขาย</h3>
        <div style={{ flex:1, overflowY:'auto' }}>
          {cart.length === 0 && <p style={{ color:'#94a3b8', textAlign:'center', marginTop:40 }}>ยังไม่มีรายการ</p>}
          {cart.map(c => (
            <div key={c.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:500 }}>{c.name}</div>
                <div style={{ fontSize:12, color:'#64748b' }}>{c.price_sell?.toLocaleString()} x {c.qty}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontWeight:600 }}>{(c.price_sell * c.qty).toLocaleString()}</span>
                <button onClick={() => removeFromCart(c.id)}
                  style={{ background:'#fee2e2', color:'#ef4444', border:'none', borderRadius:4, padding:'2px 6px', cursor:'pointer' }}>x</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop:'2px solid #e2e8f0', paddingTop:12, marginTop:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:18, marginBottom:12 }}>
            <span>รวม</span>
            <span style={{ color:'#0f766e' }}>{total.toLocaleString()} บ.</span>
          </div>
          <input placeholder="รับเงิน..."
            type="number" value={paid} onChange={e => setPaid(e.target.value)}
            style={{ width:'100%', padding:'8px 12px', borderRadius:7, border:'1px solid #e2e8f0', marginBottom:8, fontFamily:'inherit', fontSize:16 }} />
          {paid && <div style={{ textAlign:'right', color:'#0f766e', marginBottom:8 }}>เงินทอน: {change.toLocaleString()} บ.</div>}
          <button onClick={handleCheckout} disabled={loading || cart.length === 0 || !paid}
            style={{ width:'100%', padding:12, background: cart.length === 0 || !paid ? '#e2e8f0' : '#0f766e',
              color: cart.length === 0 || !paid ? '#94a3b8' : '#fff',
              border:'none', borderRadius:7, cursor:'pointer', fontFamily:'inherit', fontSize:16, fontWeight:600 }}>
            {loading ? 'กำลังบันทึก...' : 'ชำระเงิน'}
          </button>
        </div>
      </div>
    </div>
  )
}
