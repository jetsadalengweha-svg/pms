import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Purchase() {
  const { profile } = useAuth()
  const [purchases, setPurchases] = useState([])
  const [drugs, setDrugs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [supplier, setSupplier] = useState('')
  const [items, setItems] = useState([{ drug_id:'', qty:'', price:'' }])
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    const [{ data: p }, { data: d }] = await Promise.all([
      supabase.from('purchases').select('*').order('created_at', { ascending: false }),
      supabase.from('drugs').select('id, name, unit')
    ])
    setPurchases(p || [])
    setDrugs(d || [])
  }

  const addItem = () => setItems([...items, { drug_id:'', qty:'', price:'' }])
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i, key, val) => setItems(items.map((item, idx) => idx === i ? {...item, [key]: val} : item))

  const total = items.reduce((sum, it) => sum + (Number(it.qty) * Number(it.price)), 0)

  const handleSave = async () => {
    if (!supplier || items.some(it => !it.drug_id || !it.qty || !it.price)) return
    setLoading(true)
    const { data: po } = await supabase.from('purchases').insert([{
      supplier, total, status: 'received', staff_id: profile?.id
    }]).select().single()

    if (po) {
      await supabase.from('purchase_items').insert(
        items.map(it => ({
          purchase_id: po.id, drug_id: it.drug_id,
          qty: Number(it.qty), price: Number(it.price),
          total: Number(it.qty) * Number(it.price)
        }))
      )
      for (const it of items) {
        const drug = drugs.find(d => d.id === it.drug_id)
        if (drug) {
          await supabase.rpc('increment_stock', {
            drug_id: it.drug_id, amount: Number(it.qty)
          }).catch(() =>
            supabase.from('drugs').select('stock_qty').eq('id', it.drug_id).single()
              .then(({ data }) => supabase.from('drugs').update({
                stock_qty: (data?.stock_qty || 0) + Number(it.qty)
              }).eq('id', it.drug_id))
          )
        }
      }
    }
    setSupplier('')
    setItems([{ drug_id:'', qty:'', price:'' }])
    setShowForm(false)
    setLoading(false)
    fetchAll()
  }

  const inp = { padding:'7px 10px', borderRadius:6, border:'1px solid #e2e8f0', fontFamily:'inherit', fontSize:13 }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:700 }}>จัดซื้อ</h1>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding:'8px 16px', background:'#0f766e', color:'#fff',
          border:'none', borderRadius:7, cursor:'pointer', fontFamily:'inherit'
        }}>+ สร้างใบสั่งซื้อ</button>
      </div>

      {showForm && (
        <div style={{ background:'#fff', padding:20, borderRadius:10, marginBottom:20, boxShadow:'0 2px 8px #0001' }}>
          <h3 style={{ marginBottom:16 }}>ใบสั่งซื้อใหม่</h3>
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:13 }}>ซัพพลายเออร์</label>
            <input value={supplier} onChange={e => setSupplier(e.target.value)}
              style={{ ...inp, width:'100%', marginTop:4 }} placeholder="ชื่อบริษัท/ร้านค้า" />
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:12 }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['ยา','จำนวน','ราคา/หน่วย','รวม',''].map(h => (
                  <th key={h} style={{ padding:'8px 10px', textAlign:'left', fontSize:13, color:'#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td style={{ padding:'6px 4px' }}>
                    <select value={it.drug_id} onChange={e => updateItem(i, 'drug_id', e.target.value)}
                      style={{ ...inp, width:'100%' }}>
                      <option value="">เลือกยา</option>
                      {drugs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </td>
                  <td style={{ padding:'6px 4px' }}>
                    <input type="number" value={it.qty} onChange={e => updateItem(i, 'qty', e.target.value)}
                      style={{ ...inp, width:80 }} placeholder="0" />
                  </td>
                  <td style={{ padding:'6px 4px' }}>
                    <input type="number" value={it.price} onChange={e => updateItem(i, 'price', e.target.value)}
                      style={{ ...inp, width:100 }} placeholder="0.00" />
                  </td>
                  <td style={{ padding:'6px 4px', fontWeight:600 }}>
                    {(Number(it.qty) * Number(it.price)).toLocaleString()} บ.
                  </td>
                  <td style={{ padding:'6px 4px' }}>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(i)}
                        style={{ background:'#fee2e2', color:'#ef4444', border:'none', borderRadius:4, padding:'4px 8px', cursor:'pointer' }}>ลบ</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <button onClick={addItem}
              style={{ padding:'6px 14px', background:'#e2e8f0', border:'none', borderRadius:6, cursor:'pointer', fontFamily:'inherit' }}>+ เพิ่มรายการ</button>
            <span style={{ fontWeight:700 }}>รวมทั้งสิ้น: {total.toLocaleString()} บ.</span>
          </div>
          <div style={{ marginTop:16, display:'flex', gap:8 }}>
            <button onClick={handleSave} disabled={loading}
              style={{ padding:'8px 20px', background:'#0f766e', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontFamily:'inherit' }}>
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ padding:'8px 20px', background:'#e2e8f0', border:'none', borderRadius:6, cursor:'pointer', fontFamily:'inherit' }}>ยกเลิก</button>
          </div>
        </div>
      )}

      <div style={{ background:'#fff', borderRadius:10, overflow:'hidden', boxShadow:'0 2px 8px #0001' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'#f8fafc' }}>
              {['วันที่','ซัพพลายเออร์','มูลค่า','สถานะ'].map(h => (
                <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:13, color:'#64748b' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {purchases.map(p => (
              <tr key={p.id} style={{ borderTop:'1px solid #f1f5f9' }}>
                <td style={{ padding:'10px 12px', fontSize:13 }}>{new Date(p.created_at).toLocaleDateString('th-TH')}</td>
                <td style={{ padding:'10px 12px', fontSize:13 }}>{p.supplier}</td>
                <td style={{ padding:'10px 12px', fontSize:13 }}>{p.total?.toLocaleString()} บ.</td>
                <td style={{ padding:'10px 12px' }}>
                  <span style={{ padding:'2px 10px', borderRadius:20, fontSize:12, background:'#dcfce7', color:'#16a34a' }}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr><td colSpan={4} style={{ padding:24, textAlign:'center', color:'#94a3b8' }}>ยังไม่มีข้อมูล</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
