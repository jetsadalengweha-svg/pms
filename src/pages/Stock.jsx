import { useState, useEffect, useCallback } from ‘react’
import { supabase } from ‘../lib/supabase’

// ── Styles ──────────────────────────────────────────────
const S = {
page:    { padding: 24, maxWidth: 1100, margin: ‘0 auto’ },
head:    { display:‘flex’, justifyContent:‘space-between’, alignItems:‘center’, marginBottom: 20, flexWrap:‘wrap’, gap:12 },
title:   { fontSize: 22, fontWeight: 700, color: ‘#0f172a’ },
btnPrim: { background:’#0f766e’, color:’#fff’, border:‘none’, padding:‘9px 18px’, borderRadius:7, cursor:‘pointer’, fontSize:13, fontWeight:600 },
btnSec:  { background:’#f1f5f9’, color:’#334155’, border:‘1px solid #e2e8f0’, padding:‘8px 16px’, borderRadius:7, cursor:‘pointer’, fontSize:13 },
btnSm:   { background:’#0f766e’, color:’#fff’, border:‘none’, padding:‘5px 12px’, borderRadius:5, cursor:‘pointer’, fontSize:12 },
btnDanger:{ background:’#fee2e2’, color:’#dc2626’, border:‘none’, padding:‘5px 12px’, borderRadius:5, cursor:‘pointer’, fontSize:12 },
card:    { background:’#fff’, border:‘1px solid #e2e8f0’, borderRadius:10, padding:16, marginBottom:12 },
grid4:   { display:‘grid’, gridTemplateColumns:‘repeat(4,1fr)’, gap:12, marginBottom:20 },
statCard:{ background:’#fff’, border:‘1px solid #e2e8f0’, borderRadius:10, padding:16 },
label:   { fontSize:11, color:’#64748b’, textTransform:‘uppercase’, letterSpacing:‘0.05em’, marginBottom:4 },
val:     { fontSize:22, fontWeight:700, color:’#0f172a’ },
inp:     { width:‘100%’, padding:‘8px 10px’, border:‘1px solid #e2e8f0’, borderRadius:6, fontSize:13, fontFamily:‘inherit’, outline:‘none’ },
row:     { display:‘flex’, gap:12, marginBottom:12, flexWrap:‘wrap’ },
col:     { flex:1, minWidth:140 },
badge:   (color) => ({ display:‘inline-block’, padding:‘2px 8px’, borderRadius:10, fontSize:11, fontWeight:600,
background: color===‘red’?’#fee2e2’: color===‘amber’?’#fef3c7’: color===‘green’?’#dcfce7’:’#f1f5f9’,
color: color===‘red’?’#dc2626’: color===‘amber’?’#d97706’: color===‘green’?’#16a34a’:’#64748b’ }),
tbl:     { width:‘100%’, borderCollapse:‘collapse’, fontSize:13 },
th:      { background:’#f8fafc’, padding:‘10px 12px’, textAlign:‘left’, borderBottom:‘1px solid #e2e8f0’, fontSize:12, color:’#64748b’, fontWeight:600 },
td:      { padding:‘10px 12px’, borderBottom:‘1px solid #f1f5f9’, verticalAlign:‘middle’ },
modal:   { position:‘fixed’, inset:0, background:‘rgba(0,0,0,0.4)’, display:‘flex’, alignItems:‘center’, justifyContent:‘center’, zIndex:50 },
modalBox:{ background:’#fff’, borderRadius:12, padding:24, width:‘100%’, maxWidth:480, maxHeight:‘90vh’, overflowY:‘auto’ },
modalTitle:{ fontSize:16, fontWeight:700, marginBottom:16, color:’#0f172a’ },
err:     { background:’#fee2e2’, border:‘1px solid #fca5a5’, borderRadius:6, padding:‘8px 12px’, fontSize:12, color:’#dc2626’, marginBottom:12 },
}

const CATEGORIES = [‘general’,‘ขย.10’,‘ขย.11’,‘ขย.12’]
const UNITS = ['เม็ด','แคป','ml','ขวด','แผง','กรัม','หลอด','ลูก']

// ── Modal: เพิ่มยาใหม่ ─────────────────────────────────
function AddDrugModal({ onClose, onSaved }) {
const [form, setForm] = useState({
trade_name:’’, generic_name:’’, drug_category:‘general’,
base_unit:‘เม็ด’, selling_price:’’, min_stock_alert:‘10’,
expiry_alert_days:‘90’, requires_buyer_info: false,
uom_config: [{ unit:‘แผง’, factor:10 }, { unit:‘กล่อง’, factor:100 }]
})
const [loading, setLoading] = useState(false)
const [err, setErr] = useState(’’)

const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

const handleSubmit = async () => {
if (!form.trade_name || !form.generic_name) return setErr(‘กรุณากรอกชื่อยาให้ครบ’)
if (!form.selling_price) return setErr(‘กรุณากรอกราคาขาย’)
setLoading(true); setErr(’’)
const { error } = await supabase.from(‘drugs’).insert({
trade_name: form.trade_name.trim(),
generic_name: form.generic_name.trim(),
drug_category: form.drug_category,
base_unit: form.base_unit,
selling_price: parseFloat(form.selling_price),
min_stock_alert: parseInt(form.min_stock_alert),
expiry_alert_days: parseInt(form.expiry_alert_days),
requires_buyer_info: form.drug_category !== ‘general’,
uom_config: JSON.stringify(form.uom_config),
})
setLoading(false)
if (error) return setErr(error.message)
onSaved()
}

return (
<div style={S.modal} onClick={onClose}>
<div style={S.modalBox} onClick={e => e.stopPropagation()}>
<div style={S.modalTitle}>➕ เพิ่มยาใหม่</div>
{err && <div style={S.err}>{err}</div>}
<div style={S.row}>
<div style={S.col}>
<div style={S.label}>ชื่อการค้า (Trade name) *</div>
<input style={S.inp} value={form.trade_name} onChange={e=>set(‘trade_name’,e.target.value)} placeholder=“เช่น Tylenol” />
</div>
<div style={S.col}>
<div style={S.label}>ชื่อสามัญ (Generic) *</div>
<input style={S.inp} value={form.generic_name} onChange={e=>set(‘generic_name’,e.target.value)} placeholder=“เช่น Paracetamol” />
</div>
</div>
<div style={S.row}>
<div style={S.col}>
<div style={S.label}>หมวดหมู่</div>
<select style={S.inp} value={form.drug_category} onChange={e=>set(‘drug_category’,e.target.value)}>
{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
</select>
</div>
<div style={S.col}>
  <div style={S.label}>หน่วยนับพื้นฐาน *</div>
  <select style={S.inp} value={form.base_unit} onChange={e=>set('base_unit',e.target.value)}>
    {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
  </select>
</div>
<div style={S.row}>
<div style={S.col}>
<div style={S.label}>ราคาขายต่อ {form.base_unit || ‘หน่วย’} (บาท) *</div>
<input style={S.inp} type=“number” value={form.selling_price} onChange={e=>set(‘selling_price’,e.target.value)} placeholder=“0.00” />
</div>
<div style={S.col}>
<div style={S.label}>แจ้งเตือนเมื่อ stock <</div>
<input style={S.inp} type=“number” value={form.min_stock_alert} onChange={e=>set(‘min_stock_alert’,e.target.value)} />
</div>
<div style={S.col}>
<div style={S.label}>แจ้งเตือนหมดอายุล่วงหน้า (วัน)</div>
<input style={S.inp} type=“number” value={form.expiry_alert_days} onChange={e=>set(‘expiry_alert_days’,e.target.value)} />
</div>
</div>
<div style={{ display:‘flex’, gap:8, justifyContent:‘flex-end’, marginTop:16 }}>
<button style={S.btnSec} onClick={onClose}>ยกเลิก</button>
<button style={S.btnPrim} onClick={handleSubmit} disabled={loading}>
{loading ? ‘กำลังบันทึก…’ : ‘💾 บันทึก’}
</button>
</div>
</div>
</div>
)
}

// ── Modal: รับยาเข้า (สร้าง Lot) ───────────────────────
function ReceiveDrugModal({ drug, onClose, onSaved }) {
const [form, setForm] = useState({
lot_number:’’, expiry_date:’’, qty:’’, cost_price:’’, unit_in:‘base’
})
const [loading, setLoading] = useState(false)
const [err, setErr] = useState(’’)

const uomOptions = [
{ label: drug.base_unit, value: ‘base’, factor: 1 },
...((typeof drug.uom_config === ‘string’
? JSON.parse(drug.uom_config || ‘[]’)
: drug.uom_config || [])
.map(u => ({ label: u.unit, value: u.unit, factor: u.factor })))
]

const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

const handleSubmit = async () => {
if (!form.lot_number || !form.expiry_date || !form.qty || !form.cost_price)
return setErr(‘กรุณากรอกข้อมูลให้ครบ’)
setLoading(true); setErr(’’)

```
const selectedUnit = uomOptions.find(u => u.value === form.unit_in)
const factor = selectedUnit?.factor || 1
const qtyInBase = parseInt(form.qty) * factor

const { error } = await supabase.from('drug_lots').insert({
  drug_id: drug.drug_id,
  lot_number: form.lot_number.trim(),
  expiry_date: form.expiry_date,
  qty_received: qtyInBase,
  qty_remaining: qtyInBase,
  cost_price: parseFloat(form.cost_price),
  received_date: new Date().toISOString().split('T')[0],
})
setLoading(false)
if (error) return setErr(error.message)
onSaved()
```

}

return (
<div style={S.modal} onClick={onClose}>
<div style={S.modalBox} onClick={e => e.stopPropagation()}>
<div style={S.modalTitle}>📥 รับยาเข้า — {drug.trade_name}</div>
<div style={{ fontSize:12, color:’#64748b’, marginBottom:14 }}>
Generic: {drug.generic_name} | หมวด: {drug.drug_category}
</div>
{err && <div style={S.err}>{err}</div>}
<div style={S.row}>
<div style={S.col}>
<div style={S.label}>Lot / Batch Number *</div>
<input style={S.inp} value={form.lot_number} onChange={e=>set(‘lot_number’,e.target.value)} placeholder=“เช่น LOT-2024-001” />
</div>
<div style={S.col}>
<div style={S.label}>วันหมดอายุ *</div>
<input style={S.inp} type=“date” value={form.expiry_date} onChange={e=>set(‘expiry_date’,e.target.value)} />
</div>
</div>
<div style={S.row}>
<div style={S.col}>
<div style={S.label}>จำนวนที่รับเข้า *</div>
<input style={S.inp} type=“number” value={form.qty} onChange={e=>set(‘qty’,e.target.value)} placeholder=“0” />
</div>
<div style={S.col}>
<div style={S.label}>หน่วย</div>
<select style={S.inp} value={form.unit_in} onChange={e=>set(‘unit_in’,e.target.value)}>
{uomOptions.map(u=><option key={u.value} value={u.value}>{u.label}</option>)}
</select>
</div>
<div style={S.col}>
<div style={S.label}>ราคาทุน / {drug.base_unit} *</div>
<input style={S.inp} type=“number” step=“0.01” value={form.cost_price} onChange={e=>set(‘cost_price’,e.target.value)} placeholder=“0.00” />
</div>
</div>
{form.qty && form.unit_in && (
<div style={{ fontSize:12, color:’#0f766e’, marginBottom:12 }}>
= {parseInt(form.qty||0) * (uomOptions.find(u=>u.value===form.unit_in)?.factor||1)} {drug.base_unit} (base unit)
</div>
)}
<div style={{ display:‘flex’, gap:8, justifyContent:‘flex-end’, marginTop:16 }}>
<button style={S.btnSec} onClick={onClose}>ยกเลิก</button>
<button style={S.btnPrim} onClick={handleSubmit} disabled={loading}>
{loading ? ‘กำลังบันทึก…’ : ‘📥 รับยาเข้า’}
</button>
</div>
</div>
</div>
)
}

// ── Modal: ดู Lots ─────────────────────────────────────
function LotsModal({ drug, onClose }) {
const [lots, setLots] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
supabase.from(‘drug_lots’)
.select(’*’)
.eq(‘drug_id’, drug.drug_id)
.order(‘expiry_date’, { ascending: true })
.then(({ data }) => { setLots(data || []); setLoading(false) })
}, [drug.drug_id])

const today = new Date()
const getLotStatus = (lot) => {
const exp = new Date(lot.expiry_date)
const daysLeft = Math.ceil((exp - today) / 86400000)
if (daysLeft < 0) return { label:‘หมดอายุ’, color:‘red’ }
if (daysLeft <= drug.expiry_alert_days) return { label:`เหลือ ${daysLeft} วัน`, color:‘amber’ }
return { label:`เหลือ ${daysLeft} วัน`, color:‘green’ }
}

return (
<div style={S.modal} onClick={onClose}>
<div style={{ …S.modalBox, maxWidth:600 }} onClick={e=>e.stopPropagation()}>
<div style={S.modalTitle}>📦 Lots — {drug.trade_name}</div>
{loading ? <div style={{color:’#64748b’}}>กำลังโหลด…</div> : (
<table style={S.tbl}>
<thead>
<tr>
<th style={S.th}>Lot</th>
<th style={S.th}>หมดอายุ</th>
<th style={S.th}>คงเหลือ</th>
<th style={S.th}>ราคาทุน</th>
<th style={S.th}>สถานะ</th>
</tr>
</thead>
<tbody>
{lots.length === 0 ? (
<tr><td colSpan={5} style={{ ...S.td, color:’#94a3b8’, textAlign:‘center’ }}>ยังไม่มี Lot</td></tr>
) : lots.map(lot => {
const st = getLotStatus(lot)
return (
<tr key={lot.lot_id}>
<td style={S.td}>{lot.lot_number}</td>
<td style={S.td}>{new Date(lot.expiry_date).toLocaleDateString(‘th-TH’)}</td>
<td style={S.td}>{lot.qty_remaining} / {lot.qty_received} {drug.base_unit}</td>
<td style={S.td}>{parseFloat(lot.cost_price).toFixed(2)}</td>
<td style={S.td}><span style={S.badge(st.color)}>{st.label}</span></td>
</tr>
)
})}
</tbody>
</table>
)}
<div style={{ textAlign:‘right’, marginTop:16 }}>
<button style={S.btnSec} onClick={onClose}>ปิด</button>
</div>
</div>
</div>
)
}

// ── Main Component ─────────────────────────────────────
export default function Stock() {
const [drugs, setDrugs]         = useState([])
const [loading, setLoading]     = useState(true)
const [search, setSearch]       = useState(’’)
const [catFilter, setCatFilter] = useState(‘all’)
const [showAdd, setShowAdd]     = useState(false)
const [receiving, setReceiving] = useState(null)
const [viewLots, setViewLots]   = useState(null)

const fetchDrugs = useCallback(async () => {
setLoading(true)
const { data } = await supabase
.from(‘drug_stock_summary’)
.select(’*’)
.order(‘trade_name’)
setDrugs(data || [])
setLoading(false)
}, [])

useEffect(() => { fetchDrugs() }, [fetchDrugs])

const filtered = drugs.filter(d => {
const q = search.toLowerCase()
const matchSearch = !q || d.trade_name?.toLowerCase().includes(q) || d.generic_name?.toLowerCase().includes(q)
const matchCat = catFilter === ‘all’ || d.drug_category === catFilter
return matchSearch && matchCat
})

const stats = {
total:      drugs.length,
low:        drugs.filter(d => d.is_low_stock).length,
nearExpiry: drugs.filter(d => d.is_near_expiry && !d.is_expired).length,
outOfStock: drugs.filter(d => d.total_stock === 0).length,
}

return (
<div style={S.page}>
{/* Header */}
<div style={S.head}>
<div>
<div style={S.title}>🧪 สต๊อกยา</div>
<div style={{ fontSize:12, color:’#64748b’ }}>จัดการฐานข้อมูลยาและสต๊อกคงเหลือ</div>
</div>
<button style={S.btnPrim} onClick={() => setShowAdd(true)}>+ เพิ่มยาใหม่</button>
</div>

```
  {/* Stats */}
  <div style={S.grid4}>
    <div style={S.statCard}>
      <div style={S.label}>รายการยาทั้งหมด</div>
      <div style={S.val}>{stats.total}</div>
    </div>
    <div style={{ ...S.statCard, borderLeft:'3px solid #dc2626' }}>
      <div style={S.label}>stock ต่ำกว่าเกณฑ์</div>
      <div style={{ ...S.val, color: stats.low > 0 ? '#dc2626' : '#0f172a' }}>{stats.low}</div>
    </div>
    <div style={{ ...S.statCard, borderLeft:'3px solid #d97706' }}>
      <div style={S.label}>ใกล้หมดอายุ</div>
      <div style={{ ...S.val, color: stats.nearExpiry > 0 ? '#d97706' : '#0f172a' }}>{stats.nearExpiry}</div>
    </div>
    <div style={{ ...S.statCard, borderLeft:'3px solid #64748b' }}>
      <div style={S.label}>หมด stock</div>
      <div style={{ ...S.val, color: stats.outOfStock > 0 ? '#dc2626' : '#16a34a' }}>{stats.outOfStock}</div>
    </div>
  </div>

  {/* Filters */}
  <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
    <input
      style={{ ...S.inp, maxWidth:280 }}
      placeholder="🔍 ค้นหาชื่อยา (Trade / Generic)"
      value={search}
      onChange={e => setSearch(e.target.value)}
    />
    <select style={{ ...S.inp, width:'auto' }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
      <option value="all">ทุกหมวด</option>
      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
    </select>
  </div>

  {/* Table */}
  <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, overflow:'hidden' }}>
    <table style={S.tbl}>
      <thead>
        <tr>
          <th style={S.th}>ชื่อยา</th>
          <th style={S.th}>หมวด</th>
          <th style={S.th}>stock คงเหลือ</th>
          <th style={S.th}>ราคาขาย</th>
          <th style={S.th}>หมดอายุใกล้สุด</th>
          <th style={S.th}>สถานะ</th>
          <th style={S.th}>จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan={7} style={{ ...S.td, textAlign:'center', color:'#94a3b8', padding:32 }}>กำลังโหลด...</td></tr>
        ) : filtered.length === 0 ? (
          <tr><td colSpan={7} style={{ ...S.td, textAlign:'center', color:'#94a3b8', padding:32 }}>ไม่พบรายการ</td></tr>
        ) : filtered.map(drug => {
          const statusColor = drug.total_stock === 0 ? 'red' : drug.is_low_stock ? 'amber' : drug.is_near_expiry ? 'amber' : 'green'
          const statusLabel = drug.total_stock === 0 ? 'หมด' : drug.is_low_stock ? 'ใกล้หมด' : drug.is_near_expiry ? 'ใกล้หมดอายุ' : 'ปกติ'
          return (
            <tr key={drug.drug_id} style={{ background: drug.is_low_stock || drug.is_near_expiry ? '#fffbeb' : '#fff' }}>
              <td style={S.td}>
                <div style={{ fontWeight:600, color:'#0f172a' }}>{drug.trade_name}</div>
                <div style={{ fontSize:11, color:'#64748b' }}>{drug.generic_name}</div>
              </td>
              <td style={S.td}>
                <span style={S.badge(drug.drug_category === 'general' ? 'default' : 'red')}>
                  {drug.drug_category}
                </span>
              </td>
              <td style={S.td}>
                <span style={{ fontWeight:600, color: drug.total_stock === 0 ? '#dc2626' : '#0f172a' }}>
                  {drug.total_stock}
                </span>
                <span style={{ fontSize:11, color:'#64748b' }}> {drug.base_unit}</span>
              </td>
              <td style={S.td}>{parseFloat(drug.selling_price || 0).toFixed(2)} บาท/{drug.base_unit}</td>
              <td style={S.td}>
                {drug.nearest_expiry
                  ? new Date(drug.nearest_expiry).toLocaleDateString('th-TH')
                  : <span style={{ color:'#94a3b8' }}>—</span>}
              </td>
              <td style={S.td}><span style={S.badge(statusColor)}>{statusLabel}</span></td>
              <td style={S.td}>
                <div style={{ display:'flex', gap:6 }}>
                  <button style={S.btnSm} onClick={() => setReceiving(drug)}>📥 รับยา</button>
                  <button style={{ ...S.btnSm, background:'#f1f5f9', color:'#334155' }} onClick={() => setViewLots(drug)}>📦 Lots</button>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>

  {/* Modals */}
  {showAdd   && <AddDrugModal    onClose={() => setShowAdd(false)}    onSaved={() => { setShowAdd(false); fetchDrugs() }} />}
  {receiving && <ReceiveDrugModal drug={receiving} onClose={() => setReceiving(null)} onSaved={() => { setReceiving(null); fetchDrugs() }} />}
  {viewLots  && <LotsModal        drug={viewLots}  onClose={() => setViewLots(null)} />}
</div>
```

)
}
