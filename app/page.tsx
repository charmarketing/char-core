'use client'
import { useState, useEffect, useCallback } from 'react'

// ─── FONT INJECTION ────────────────────────────────────────────────────────
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Rajdhani','Inter',system-ui,sans-serif!important;}
    ::-webkit-scrollbar{width:4px;height:4px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:#1e1e38;border-radius:4px;}
    .char-btn:hover{opacity:0.85!important;transform:translateY(-1px);}
    .char-card:hover{border-color:#c9a96e30!important;}
    .char-nav:hover{color:#c9a96e!important;background:#161628!important;}
    .char-row:hover{background:#0e0e1e!important;}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
    @keyframes glow{0%,100%{box-shadow:0 0 8px #c9a96e20;}50%{box-shadow:0 0 20px #c9a96e40;}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    .char-fade{animation:fadeIn 0.3s ease;}
    @media(max-width:768px){
      .char-sidebar{transform:translateX(-100%);position:fixed!important;z-index:100;transition:transform 0.3s ease;}
      .char-sidebar.open{transform:translateX(0)!important;}
      .char-main{padding:20px 16px!important;}
      .char-grid-4{grid-template-columns:repeat(2,1fr)!important;}
      .char-grid-3{grid-template-columns:1fr!important;}
      .char-grid-2{grid-template-columns:1fr!important;}
      .char-topbar{flex-direction:column!important;gap:12px!important;align-items:flex-start!important;}
      .char-mobile-bar{display:flex!important;}
      .char-hide-mobile{display:none!important;}
    }
  `}</style>
)

// ─── THEME ────────────────────────────────────────────────────────────────
type Theme = 'dark' | 'light'
const T = {
  dark: {
    bg:       '#05050f',
    surface:  '#0b0b18',
    surface2: '#111124',
    border:   '#16163a',
    border2:  '#1e1e3a',
    text:     '#f0f0ff',
    text2:    '#9090b8',
    text3:    '#4a4a6a',
    muted:    '#2a2a4a',
  },
  light: {
    bg:       '#f0f2f8',
    surface:  '#ffffff',
    surface2: '#f8f9fe',
    border:   '#e0e2ef',
    border2:  '#d0d2e0',
    text:     '#0a0a1a',
    text2:    '#3a3a5a',
    text3:    '#8888aa',
    muted:    '#c0c2d8',
  },
}
const GOLD  = '#c9a96e'
const BLUE  = '#4f8fff'
const GREEN = '#3dd68c'
const RED   = '#f87171'
const AMBER = '#f59e0b'
const PURPLE= '#a78bfa'

// ─── CSV EXPORT ───────────────────────────────────────────────────────────
function exportCSV(filename: string, headers: string[], rows: (string|number)[][]) {
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename + '.csv'; a.click()
  URL.revokeObjectURL(url)
}

// ─── HOOKS ────────────────────────────────────────────────────────────────
function useMobile() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return mobile
}

// ─── DATOS ────────────────────────────────────────────────────────────────
const CLIENTES = [
  { id:1, nombre:'Cliente Alfa',  red:'Instagram', horas:2,  tareas:3, campañas:1, color:GOLD   },
  { id:2, nombre:'Cliente Beta',  red:'YouTube',   horas:50, tareas:5, campañas:0, color:BLUE   },
  { id:3, nombre:'Cliente Gamma', red:'LinkedIn',  horas:20, tareas:2, campañas:1, color:PURPLE },
]
const TAREAS_HOY = [
  { texto:'Calendario de contenido Mayo — Alfa', rol:'CM',  p:'alta'  },
  { texto:'Configurar campaña Google Ads',       rol:'SEM', p:'alta'  },
  { texto:'Revisar propuesta Cliente Beta',      rol:'CEO', p:'alta'  },
  { texto:'Auditoría SEO inicial — Alfa',        rol:'SEO', p:'media' },
  { texto:'CHAR Session para Cliente Beta',      rol:'CM',  p:'media' },
]
const ALERTAS_DATA = [
  { tipo:'urgente', texto:'Cliente Beta sin actividad hace 50hs',   tiempo:'hace 2h' },
  { tipo:'info',    texto:'Calendario de Mayo sin planificar — Alfa', tiempo:'hace 5h' },
  { tipo:'info',    texto:'Campaña SEM de Gamma sin iniciar',        tiempo:'hace 1d' },
]
const NOTICIAS = [
  { titulo:'Instagram actualiza algoritmo de Reels: más peso al tiempo de visualización', fuente:'Social Media Today', tiempo:'hace 3h' },
  { titulo:'Google Ads lanza métricas de conversión con IA predictiva',                  fuente:'Search Engine Journal', tiempo:'hace 5h' },
  { titulo:'LinkedIn supera 1B usuarios: oportunidades para marcas B2B en 2026',         fuente:'Marketing Dive',       tiempo:'hace 8h' },
]
const ROLES_RESUMEN = [
  { rol:'CEO', tareas:5, hechas:1, color:GOLD   },
  { rol:'CM',  tareas:7, hechas:1, color:GREEN  },
  { rol:'SEM', tareas:5, hechas:0, color:BLUE   },
  { rol:'SEO', tareas:5, hechas:0, color:PURPLE },
]
const ROL_COLOR: Record<string,string> = { CEO:GOLD, CM:GREEN, SEM:BLUE, SEO:PURPLE }

function estadoCliente(h:number){ return h<24?{c:GREEN,l:'ACTIVO',p:90}:h<48?{c:AMBER,l:'ATENCIÓN',p:50}:{c:RED,l:'URGENTE',p:15} }

// ─── ICONS ────────────────────────────────────────────────────────────────
const I: Record<string,JSX.Element> = {
  bolt:    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  grid:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  users:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  cal:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  folder:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  bell:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  cpu:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  sun:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  plus:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  download:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  warn:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  info:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  news:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/></svg>,
  trend:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  task:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  alertico:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  film:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>,
  chart:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  target:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  search:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  pen:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  link:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  eye:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  menu:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  dollar:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  check:   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
}

// ─── UI ATOMS ─────────────────────────────────────────────────────────────
function Card({ children, style={}, theme, glow=false }: { children:React.ReactNode; style?:React.CSSProperties; theme:Theme; glow?:boolean }) {
  const t = T[theme]
  return (
    <div className="char-card" style={{
      background: t.surface, border: `1px solid ${t.border}`,
      borderRadius: '14px', padding: '22px',
      boxShadow: glow ? `0 0 24px ${GOLD}18, 0 4px 24px #00000040` : '0 4px 24px #00000020',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      ...style
    }}>
      {children}
    </div>
  )
}

function EyeBrow({ text, theme }: { text:string; theme:Theme }) {
  return <div style={{ fontSize:'9px', color:T[theme].text3, letterSpacing:'3px', fontWeight:700, marginBottom:'4px', fontFamily:'Rajdhani,sans-serif' }}>{text}</div>
}

function Tag({ label, color }: { label:string; color:string }) {
  return <span style={{ padding:'2px 9px', borderRadius:'20px', background:color+'18', border:`1px solid ${color}40`, fontSize:'9px', color, fontWeight:700, letterSpacing:'1px', fontFamily:'Rajdhani,sans-serif' }}>{label}</span>
}

function Btn({ children, onClick, variant='ghost', theme }: { children:React.ReactNode; onClick?:()=>void; variant?:'primary'|'ghost'|'outline'|'danger'; theme:Theme }) {
  const t = T[theme]
  const styles: Record<string,React.CSSProperties> = {
    primary: { background: `linear-gradient(135deg, ${GOLD}, #a07030)`, color:'#050510', border:'none', fontWeight:700, boxShadow:`0 4px 16px ${GOLD}40` },
    ghost:   { background: t.surface2, color: t.text2, border:`1px solid ${t.border}`, fontWeight:500 },
    outline: { background:'transparent', color:GOLD, border:`1px solid ${GOLD}50`, fontWeight:600 },
    danger:  { background:'transparent', color:RED, border:`1px solid ${RED}50`, fontWeight:600 },
  }
  return (
    <button className="char-btn" onClick={onClick} style={{ ...styles[variant], padding:'8px 16px', borderRadius:'8px', fontSize:'12px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', letterSpacing:'0.3px', transition:'all 0.15s', fontFamily:'Rajdhani,sans-serif' }}>
      {children}
    </button>
  )
}

function SectionHead({ eyebrow, title, action, theme }: { eyebrow:string; title:string; action?:React.ReactNode; theme:Theme }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'18px' }}>
      <div>
        <EyeBrow text={eyebrow} theme={theme}/>
        <h2 style={{ fontSize:'18px', fontWeight:700, margin:0, color:T[theme].text, fontFamily:'Rajdhani,sans-serif', letterSpacing:'0.5px' }}>{title}</h2>
      </div>
      {action}
    </div>
  )
}

function Divider({ theme }: { theme:Theme }) {
  return <div style={{ height:'1px', background:T[theme].border, margin:'14px 0' }}/>
}

function StatRow({ label, value, color, theme }: { label:string; value:string; color?:string; theme:Theme }) {
  const t = T[theme]
  return (
    <div className="char-row" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 8px', borderRadius:'6px', transition:'background 0.15s' }}>
      <span style={{ fontSize:'13px', color:t.text2, fontFamily:'Rajdhani,sans-serif' }}>{label}</span>
      <span style={{ fontSize:'14px', fontWeight:700, color:color||GOLD, fontFamily:'Rajdhani,sans-serif' }}>{value}</span>
    </div>
  )
}

function TaskItem({ text, done=false, priority='normal', theme }: { text:string; done?:boolean; priority?:string; theme:Theme }) {
  const [checked, setChecked] = useState(done)
  const t = T[theme]
  const pc = priority==='alta'?RED:priority==='media'?AMBER:t.text3
  return (
    <div className="char-row" style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 8px', borderRadius:'6px', cursor:'pointer', transition:'background 0.15s' }} onClick={()=>setChecked(!checked)}>
      <div style={{ width:'17px', height:'17px', borderRadius:'5px', border:`1.5px solid ${checked?GREEN:T[theme].border2}`, background:checked?GREEN+'20':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
        {checked && <span style={{ color:GREEN }}>{I.check}</span>}
      </div>
      <span style={{ fontSize:'13px', color:checked?t.text3:t.text2, textDecoration:checked?'line-through':'none', flex:1, fontFamily:'Rajdhani,sans-serif', lineHeight:'1.4' }}>{text}</span>
      {priority!=='normal'&&priority!=='done'&&!checked && <Tag label={priority.toUpperCase()} color={pc}/>}
    </div>
  )
}

// ─── GLOWING METRIC CARD ──────────────────────────────────────────────────
function MetricCard({ label, value, note, icon, color, theme }: { label:string; value:string; note:string; icon:JSX.Element; color:string; theme:Theme }) {
  const t = T[theme]
  return (
    <Card theme={theme} style={{ position:'relative', overflow:'hidden', padding:'22px' }}>
      <div style={{ position:'absolute', top:0, right:0, width:'80px', height:'80px', background:`radial-gradient(circle at top right, ${color}15, transparent 70%)`, borderRadius:'0 14px 0 0' }}/>
      <div style={{ position:'absolute', top:'-1px', right:'-1px', width:'40px', height:'3px', background:`linear-gradient(90deg, transparent, ${color})`, borderRadius:'0 14px 0 0' }}/>
      <div style={{ color, marginBottom:'14px', opacity:0.9 }}>{icon}</div>
      <div style={{ fontSize:'32px', fontWeight:800, color:t.text, lineHeight:1, marginBottom:'6px', fontFamily:'Rajdhani,sans-serif', letterSpacing:'-0.5px' }}>{value}</div>
      <div style={{ fontSize:'12px', color:t.text2, marginBottom:'4px', fontFamily:'Rajdhani,sans-serif', fontWeight:600 }}>{label}</div>
      <div style={{ fontSize:'11px', color, fontWeight:700, fontFamily:'Rajdhani,sans-serif', letterSpacing:'0.5px' }}>{note}</div>
    </Card>
  )
}

// ─── VISTA: DASHBOARD ─────────────────────────────────────────────────────
function VistaDashboard({ theme, irA }: { theme:Theme; irA:(v:string)=>void }) {
  const t = T[theme]
  const h = new Date().getHours()
  const sal = h<12?'Buenos días':h<19?'Buenas tardes':'Buenas noches'
  const fecha = new Date().toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})

  return (
    <div className="char-fade" style={{ display:'grid', gap:'32px' }}>
      {/* Header */}
      <div className="char-topbar" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <EyeBrow text="CENTRO DE COMANDO" theme={theme}/>
          <h1 style={{ fontSize:'28px', fontWeight:800, margin:'4px 0 6px', color:t.text, fontFamily:'Rajdhani,sans-serif', letterSpacing:'0.5px' }}>
            {sal}, <span style={{ color:GOLD }}>Gabriel</span>
          </h1>
          <p style={{ color:t.text3, fontSize:'12px', margin:0, textTransform:'capitalize', fontFamily:'Rajdhani,sans-serif' }}>{fecha}</p>
        </div>
        <Btn variant="primary" theme={theme} onClick={()=>irA('clientes')}>{I.plus} Nuevo Cliente</Btn>
      </div>

      {/* Métricas */}
      <div>
        <SectionHead eyebrow="RESUMEN EJECUTIVO" title="Métricas del Día" theme={theme}/>
        <div className="char-grid-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px' }}>
          <MetricCard label="Clientes Activos"  value="3"  note="+1 este mes"       icon={I.trend}    color={GOLD}   theme={theme}/>
          <MetricCard label="Tareas Pendientes" value="7"  note="2 vencen hoy"      icon={I.task}     color={BLUE}   theme={theme}/>
          <MetricCard label="Alertas Críticas"  value="1"  note="Requiere acción"   icon={I.alertico} color={RED}    theme={theme}/>
          <MetricCard label="Clips Generados"   value="—"  note="Próximo módulo"    icon={I.film}     color={PURPLE} theme={theme}/>
        </div>
      </div>

      {/* Semáforo clientes */}
      <div>
        <SectionHead eyebrow="ESTADO EN TIEMPO REAL" title="Semáforo de Clientes" theme={theme} action={<span style={{ fontSize:'11px', color:t.text3, fontFamily:'Rajdhani,sans-serif' }}>3 / 10 slots</span>}/>
        <div className="char-grid-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px' }}>
          {CLIENTES.map(c => {
            const e = estadoCliente(c.horas)
            return (
              <Card key={c.id} theme={theme} style={{ padding:'18px', cursor:'pointer', borderTop:`2px solid ${e.c}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'34px', height:'34px', background:c.color+'20', borderRadius:'9px', border:`1px solid ${c.color}40`, display:'flex', alignItems:'center', justifyContent:'center', color:c.color, fontWeight:800, fontSize:'13px', fontFamily:'Rajdhani,sans-serif' }}>
                      {c.nombre.charAt(8)}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'14px', color:t.text, fontFamily:'Rajdhani,sans-serif' }}>{c.nombre}</div>
                      <div style={{ fontSize:'11px', color:t.text3, fontFamily:'Rajdhani,sans-serif' }}>{c.red}</div>
                    </div>
                  </div>
                  <Tag label={e.l} color={e.c}/>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                  <span style={{ fontSize:'11px', color:t.text3, fontFamily:'Rajdhani,sans-serif' }}>Actividad</span>
                  <span style={{ fontSize:'11px', color:e.c, fontWeight:700, fontFamily:'Rajdhani,sans-serif' }}>{c.horas}h atrás</span>
                </div>
                <div style={{ height:'3px', background:t.border, borderRadius:'3px' }}>
                  <div style={{ height:'100%', width:`${e.p}%`, background:`linear-gradient(90deg,${e.c}80,${e.c})`, borderRadius:'3px', boxShadow:`0 0 8px ${e.c}60` }}/>
                </div>
                <div style={{ display:'flex', gap:'6px', marginTop:'12px' }}>
                  <span style={{ fontSize:'11px', color:t.text3, fontFamily:'Rajdhani,sans-serif' }}>{c.tareas} tareas · {c.campañas} campañas</span>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Tareas + Alertas */}
      <div className="char-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        <Card theme={theme}>
          <SectionHead eyebrow="PRIORIDAD HOY" title="Tareas Urgentes" theme={theme}
            action={<Btn theme={theme} onClick={()=>irA('ceo')}>Ver todas</Btn>}/>
          <Divider theme={theme}/>
          {TAREAS_HOY.map((t2,i)=>(
            <div key={i} className="char-row" style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 8px', borderRadius:'6px' }}>
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:t2.p==='alta'?RED:AMBER, flexShrink:0, boxShadow:`0 0 6px ${t2.p==='alta'?RED:AMBER}` }}/>
              <span style={{ fontSize:'13px', color:t.text2, flex:1, fontFamily:'Rajdhani,sans-serif', lineHeight:'1.4' }}>{t2.texto}</span>
              <Tag label={t2.rol} color={ROL_COLOR[t2.rol]}/>
            </div>
          ))}
        </Card>
        <Card theme={theme}>
          <SectionHead eyebrow="NOTIFICACIONES" title="Alertas Activas" theme={theme}/>
          <Divider theme={theme}/>
          {ALERTAS_DATA.map((a,i)=>(
            <div key={i} className="char-row" style={{ display:'flex', gap:'10px', padding:'10px 8px', borderRadius:'6px' }}>
              <div style={{ color:a.tipo==='urgente'?RED:AMBER, marginTop:'1px', flexShrink:0 }}>
                {a.tipo==='urgente'?I.warn:I.info}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'13px', color:t.text2, fontFamily:'Rajdhani,sans-serif', lineHeight:'1.4' }}>{a.texto}</div>
                <div style={{ fontSize:'10px', color:t.text3, marginTop:'4px', fontFamily:'Rajdhani,sans-serif' }}>{a.tiempo}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Estado por área */}
      <div>
        <SectionHead eyebrow="EQUIPO" title="Estado por Área" theme={theme}/>
        <div className="char-grid-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px' }}>
          {ROLES_RESUMEN.map(r=>(
            <Card key={r.rol} theme={theme} style={{ padding:'18px', cursor:'pointer' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                <span style={{ fontSize:'16px', fontWeight:800, color:r.color, letterSpacing:'1px', fontFamily:'Rajdhani,sans-serif' }}>{r.rol}</span>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:r.hechas<r.tareas?RED:GREEN, boxShadow:`0 0 8px ${r.hechas<r.tareas?RED:GREEN}` }}/>
              </div>
              <div style={{ fontSize:'32px', fontWeight:800, color:t.text, lineHeight:1, marginBottom:'4px', fontFamily:'Rajdhani,sans-serif' }}>{r.tareas-r.hechas}</div>
              <div style={{ fontSize:'11px', color:t.text3, fontFamily:'Rajdhani,sans-serif' }}>pendientes</div>
              <div style={{ height:'3px', background:t.border, borderRadius:'3px', margin:'12px 0 6px' }}>
                <div style={{ height:'100%', width:`${(r.hechas/r.tareas)*100}%`, background:r.color, borderRadius:'3px', boxShadow:`0 0 6px ${r.color}80`, transition:'width 0.5s ease' }}/>
              </div>
              <div style={{ fontSize:'10px', color:t.text3, fontFamily:'Rajdhani,sans-serif' }}>{r.hechas}/{r.tareas} completadas</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Daily Blog */}
      <div>
        <SectionHead eyebrow="INTELIGENCIA DE MERCADO" title="Marketing Daily" theme={theme}
          action={<Tag label="AUTO-ACTUALIZA CON IA" color={GOLD}/>}/>
        <div style={{ display:'grid', gap:'10px' }}>
          {NOTICIAS.map((n,i)=>(
            <Card key={i} theme={theme} style={{ padding:'16px 20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'14px' }}>
                <div style={{ display:'flex', gap:'14px', alignItems:'flex-start' }}>
                  <div style={{ color:GOLD, marginTop:'1px', flexShrink:0 }}>{I.news}</div>
                  <div>
                    <div style={{ fontSize:'13px', color:t.text, fontWeight:600, lineHeight:'1.5', fontFamily:'Rajdhani,sans-serif' }}>{n.titulo}</div>
                    <div style={{ fontSize:'11px', color:t.text3, marginTop:'4px', fontFamily:'Rajdhani,sans-serif' }}>{n.fuente} · {n.tiempo}</div>
                  </div>
                </div>
                <div style={{ color:t.text3, flexShrink:0 }}>{I.link}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── VISTA: CLIENTES ──────────────────────────────────────────────────────
function VistaClientes({ theme }: { theme:Theme }) {
  const t = T[theme]
  const exportar = () => exportCSV('clientes_char', ['Cliente','Red','Horas sin actividad','Tareas','Campañas','Estado'],
    CLIENTES.map(c=>[c.nombre, c.red, c.horas, c.tareas, c.campañas, estadoCliente(c.horas).l]))

  return (
    <div className="char-fade" style={{ display:'grid', gap:'28px' }}>
      <div className="char-topbar" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div><EyeBrow text="GESTIÓN" theme={theme}/><h1 style={{ fontSize:'28px', fontWeight:800, margin:0, color:t.text, fontFamily:'Rajdhani,sans-serif' }}>Clientes</h1></div>
        <div style={{ display:'flex', gap:'10px' }}>
          <Btn theme={theme} variant="outline" onClick={exportar}>{I.download} Exportar CSV</Btn>
          <Btn theme={theme} variant="primary">{I.plus} Nuevo Cliente</Btn>
        </div>
      </div>
      <div className="char-grid-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
        {CLIENTES.map(c=>{
          const e=estadoCliente(c.horas)
          return (
            <Card key={c.id} theme={theme} glow>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'18px' }}>
                <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                  <div style={{ width:'42px', height:'42px', background:c.color+'20', border:`1px solid ${c.color}50`, borderRadius:'11px', display:'flex', alignItems:'center', justifyContent:'center', color:c.color, fontWeight:800, fontSize:'15px', fontFamily:'Rajdhani,sans-serif', boxShadow:`0 0 14px ${c.color}20` }}>
                    {c.nombre.charAt(8)}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, color:t.text, fontSize:'15px', fontFamily:'Rajdhani,sans-serif' }}>{c.nombre}</div>
                    <div style={{ fontSize:'11px', color:t.text3, fontFamily:'Rajdhani,sans-serif' }}>{c.red}</div>
                  </div>
                </div>
                <Tag label={e.l} color={e.c}/>
              </div>
              <Divider theme={theme}/>
              <div className="char-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
                {[['TAREAS ACTIVAS',String(c.tareas)],['CAMPAÑAS',String(c.campañas)],['SIN ACTIVIDAD',`${c.horas}h`],['RED PRINCIPAL',c.red]].map(([l,v],i)=>(
                  <div key={i} style={{ background:t.surface2, borderRadius:'9px', padding:'10px 12px', border:`1px solid ${t.border}` }}>
                    <div style={{ fontSize:'9px', color:t.text3, letterSpacing:'1.5px', marginBottom:'5px', fontFamily:'Rajdhani,sans-serif', fontWeight:700 }}>{l}</div>
                    <div style={{ fontSize:'15px', fontWeight:700, color:t.text, fontFamily:'Rajdhani,sans-serif' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <Btn theme={theme}>{I.eye} Ver</Btn>
                <Btn theme={theme}>{I.pen} Editar</Btn>
                <Btn theme={theme}>{I.bell} Alertas</Btn>
              </div>
            </Card>
          )
        })}
        <Card theme={theme} style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'200px', cursor:'pointer', border:`1px dashed ${T[theme].border2}` }}>
          <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:T[theme].border, display:'flex', alignItems:'center', justifyContent:'center', color:T[theme].text3, marginBottom:'10px' }}>{I.plus}</div>
          <div style={{ fontSize:'13px', color:T[theme].text3, fontFamily:'Rajdhani,sans-serif', fontWeight:600 }}>Agregar cliente</div>
        </Card>
      </div>
    </div>
  )
}

// ─── PANELES DE ROL ───────────────────────────────────────────────────────
function PanelShell({ eyebrow, title, exportFn, theme, children }: { eyebrow:string; title:string; exportFn:()=>void; theme:Theme; children:React.ReactNode }) {
  const t = T[theme]
  return (
    <div className="char-fade" style={{ display:'grid', gap:'24px' }}>
      <div className="char-topbar" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div><EyeBrow text={eyebrow} theme={theme}/><h1 style={{ fontSize:'28px', fontWeight:800, margin:0, color:t.text, fontFamily:'Rajdhani,sans-serif' }}>{title}</h1></div>
        <Btn theme={theme} variant="outline" onClick={exportFn}>{I.download} Exportar CSV</Btn>
      </div>
      {children}
    </div>
  )
}

function VistaCEO({ theme }: { theme:Theme }) {
  const exportar = () => exportCSV('panel_ceo',['KPI','Valor'],[['Clientes activos','3/10'],['Ingresos estimados','—'],['Tareas completadas','12/22'],['Alertas críticas','1']])
  return (
    <PanelShell eyebrow="DIRECCIÓN EJECUTIVA" title="Panel CEO" exportFn={exportar} theme={theme}>
      <div className="char-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        <Card theme={theme}>
          <EyeBrow text="KPIs GLOBALES" theme={theme}/>
          <Divider theme={theme}/>
          {[['Clientes activos','3 / 10',GOLD],['Ingresos estimados','—',GREEN],['Tareas completadas','12 / 22',BLUE],['Clips generados','0',PURPLE],['Alertas críticas','1',RED]].map(([l,v,c],i)=>(
            <StatRow key={i} label={l} value={v} color={c} theme={theme}/>
          ))}
        </Card>
        <Card theme={theme}>
          <EyeBrow text="EQUIPO CHAR" theme={theme}/>
          <Divider theme={theme}/>
          {[{n:'Gabriel',r:'Dev / Ops'},{n:'Adri',r:'Gestor de Proyectos'}].map((m,i)=>(
            <div key={i} className="char-row" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 8px', borderRadius:'6px' }}>
              <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                <div style={{ width:'30px', height:'30px', background:GOLD+'20', borderRadius:'50%', border:`1px solid ${GOLD}50`, display:'flex', alignItems:'center', justifyContent:'center', color:GOLD, fontWeight:800, fontSize:'12px', fontFamily:'Rajdhani,sans-serif', boxShadow:`0 0 10px ${GOLD}20` }}>{m.n[0]}</div>
                <div>
                  <div style={{ fontSize:'13px', color:T[theme].text, fontWeight:600, fontFamily:'Rajdhani,sans-serif' }}>{m.n}</div>
                  <div style={{ fontSize:'11px', color:T[theme].text3, fontFamily:'Rajdhani,sans-serif' }}>{m.r}</div>
                </div>
              </div>
              <Tag label="ACTIVO" color={GREEN}/>
            </div>
          ))}
        </Card>
      </div>
      <Card theme={theme}>
        <EyeBrow text="TAREAS EJECUTIVAS" theme={theme}/>
        <Divider theme={theme}/>
        {[{t:'Revisar propuesta para Cliente Beta',p:'alta'},{t:'Definir estrategia Q2 con Adri',p:'media'},{t:'Configurar módulo de facturación',p:'normal'},{t:'Revisar métricas semanales',p:'done'},{t:'Actualizar filosofía CHAR en Cerebro IA',p:'normal'}].map((item,i)=>(
          <TaskItem key={i} text={item.t} priority={item.p} done={item.p==='done'} theme={theme}/>
        ))}
      </Card>
    </PanelShell>
  )
}

function VistaSEM({ theme }: { theme:Theme }) {
  const exportar = () => exportCSV('panel_sem',['Campaña','Estado','Presupuesto','CTR','Conversiones'],[['Google Ads — Alfa','Activa','$0/mes','—','—'],['Meta Ads — Beta','Pausada','$0/mes','—','—'],['Google Ads — Gamma','Sin iniciar','—','—','—']])
  return (
    <PanelShell eyebrow="SEARCH ENGINE MARKETING" title="Panel SEM" exportFn={exportar} theme={theme}>
      <div className="char-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        <Card theme={theme}>
          <EyeBrow text="CAMPAÑAS ACTIVAS" theme={theme}/>
          <Divider theme={theme}/>
          {[{n:'Google Ads — Alfa',e:'ACTIVA',c:GREEN,p:'$0/mes'},{n:'Meta Ads — Beta',e:'PAUSADA',c:AMBER,p:'$0/mes'},{n:'Google Ads — Gamma',e:'SIN INICIAR',c:T[theme].text3,p:'—'}].map((c,i)=>(
            <div key={i} className="char-row" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 8px', borderRadius:'6px' }}>
              <div><div style={{ fontSize:'13px', color:T[theme].text, fontWeight:600, fontFamily:'Rajdhani,sans-serif' }}>{c.n}</div><div style={{ fontSize:'11px', color:T[theme].text3, fontFamily:'Rajdhani,sans-serif' }}>Presupuesto: {c.p}</div></div>
              <Tag label={c.e} color={c.c}/>
            </div>
          ))}
        </Card>
        <Card theme={theme}>
          <EyeBrow text="MÉTRICAS SEM" theme={theme}/>
          <Divider theme={theme}/>
          {[['Impresiones totales','—'],['Clics totales','—'],['CTR promedio','—'],['Costo por clic','—'],['Conversiones','—'],['ROAS promedio','—']].map(([l,v],i)=>(
            <StatRow key={i} label={l} value={v} color={BLUE} theme={theme}/>
          ))}
        </Card>
      </div>
      <Card theme={theme}>
        <EyeBrow text="TAREAS SEM" theme={theme}/>
        <Divider theme={theme}/>
        {['Configurar primera campaña Google Ads','Definir keywords para Cliente Alfa','Conectar Google Analytics a la app','Investigar competencia en SEM — Gamma','Revisar landing pages de clientes'].map((t,i)=>(
          <TaskItem key={i} text={t} priority={i<2?'alta':'normal'} theme={theme}/>
        ))}
      </Card>
    </PanelShell>
  )
}

function VistaCM({ theme }: { theme:Theme }) {
  const exportar = () => exportCSV('panel_cm',['Cliente','Red','Posts','Estado'],[['Cliente Alfa','Instagram','3','Planificado'],['Cliente Beta','YouTube','1','Pendiente'],['Cliente Gamma','LinkedIn','2','Publicado']])
  return (
    <PanelShell eyebrow="COMMUNITY MANAGEMENT" title="Panel CM" exportFn={exportar} theme={theme}>
      <div className="char-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        <Card theme={theme}>
          <EyeBrow text="CONTENIDO ESTA SEMANA" theme={theme}/>
          <Divider theme={theme}/>
          {[{c:'Cliente Alfa',r:'Instagram',p:'3 posts',e:'PLANIFICADO',col:AMBER},{c:'Cliente Beta',r:'YouTube',p:'1 video',e:'PENDIENTE',col:RED},{c:'Cliente Gamma',r:'LinkedIn',p:'2 artículos',e:'PUBLICADO',col:GREEN}].map((item,i)=>(
            <div key={i} className="char-row" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 8px', borderRadius:'6px' }}>
              <div><div style={{ fontSize:'13px', color:T[theme].text, fontWeight:600, fontFamily:'Rajdhani,sans-serif' }}>{item.c}</div><div style={{ fontSize:'11px', color:T[theme].text3, fontFamily:'Rajdhani,sans-serif' }}>{item.r} · {item.p}</div></div>
              <Tag label={item.e} color={item.col}/>
            </div>
          ))}
        </Card>
        <Card theme={theme}>
          <EyeBrow text="MÉTRICAS CM" theme={theme}/>
          <Divider theme={theme}/>
          {[['Posts publicados','2'],['Alcance promedio','—'],['Engagement rate','—'],['Seguidores ganados','—'],['Stories programadas','0'],['Comentarios respondidos','—']].map(([l,v],i)=>(
            <StatRow key={i} label={l} value={v} color={GREEN} theme={theme}/>
          ))}
        </Card>
      </div>
      <Card theme={theme}>
        <EyeBrow text="TAREAS CM" theme={theme}/>
        <Divider theme={theme}/>
        {[{t:'Crear calendario de contenido Mayo — Alfa',p:'alta'},{t:'Grabar CHAR Session para Cliente Beta',p:'alta'},{t:'Responder comentarios — Gamma LinkedIn',p:'media'},{t:'Diseñar 3 stories template para Alfa',p:'normal'},{t:'Revisar estética de feed — Cliente Gamma',p:'done'}].map((item,i)=>(
          <TaskItem key={i} text={item.t} priority={item.p} done={item.p==='done'} theme={theme}/>
        ))}
      </Card>
    </PanelShell>
  )
}

function VistaSEO({ theme }: { theme:Theme }) {
  const exportar = () => exportCSV('panel_seo',['Cliente','Keyword','Posición','DA','Tráfico'],[['Cliente Alfa','Sin asignar','—','—','—'],['Cliente Beta','Sin asignar','—','—','—'],['Cliente Gamma','Sin asignar','—','—','—']])
  return (
    <PanelShell eyebrow="SEARCH ENGINE OPTIMIZATION" title="Panel SEO" exportFn={exportar} theme={theme}>
      <div className="char-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        <Card theme={theme}>
          <EyeBrow text="POSICIONAMIENTO" theme={theme}/>
          <Divider theme={theme}/>
          {CLIENTES.map((c,i)=>(
            <div key={i} className="char-row" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 8px', borderRadius:'6px' }}>
              <div><div style={{ fontSize:'13px', color:T[theme].text, fontWeight:600, fontFamily:'Rajdhani,sans-serif' }}>{c.nombre}</div><div style={{ fontSize:'11px', color:T[theme].text3, fontFamily:'Rajdhani,sans-serif' }}>Keyword principal: Sin asignar</div></div>
              <span style={{ fontSize:'14px', fontWeight:700, color:T[theme].text3, fontFamily:'Rajdhani,sans-serif' }}>—</span>
            </div>
          ))}
        </Card>
        <Card theme={theme}>
          <EyeBrow text="MÉTRICAS SEO" theme={theme}/>
          <Divider theme={theme}/>
          {[['Domain Authority','—'],['Backlinks totales','—'],['Keywords top 10','—'],['Tráfico orgánico','—'],['Páginas indexadas','—'],['Velocidad promedio','—']].map(([l,v],i)=>(
            <StatRow key={i} label={l} value={v} color={PURPLE} theme={theme}/>
          ))}
        </Card>
      </div>
      <Card theme={theme}>
        <EyeBrow text="TAREAS SEO" theme={theme}/>
        <Divider theme={theme}/>
        {['Auditoría SEO inicial — Cliente Alfa','Investigación de keywords — Gamma','Optimizar meta descriptions — Beta','Instalar Google Search Console en clientes','Generar reporte mensual de posicionamiento'].map((t,i)=>(
          <TaskItem key={i} text={t} priority={i<2?'alta':'normal'} theme={theme}/>
        ))}
      </Card>
    </PanelShell>
  )
}

// ─── PLACEHOLDER ──────────────────────────────────────────────────────────
function Placeholder({ title, modulo, theme }: { title:string; modulo:string; theme:Theme }) {
  const t = T[theme]
  return (
    <div className="char-fade" style={{ display:'grid', gap:'24px' }}>
      <div><EyeBrow text="PRÓXIMAMENTE" theme={theme}/><h1 style={{ fontSize:'28px', fontWeight:800, margin:0, color:t.text, fontFamily:'Rajdhani,sans-serif' }}>{title}</h1></div>
      <Card theme={theme} style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'320px', border:`1px dashed ${t.border2}` }}>
        <div style={{ width:'60px', height:'60px', borderRadius:'50%', background:GOLD+'15', border:`1px solid ${GOLD}40`, display:'flex', alignItems:'center', justifyContent:'center', color:GOLD, marginBottom:'16px', boxShadow:`0 0 20px ${GOLD}20` }}>
          {I.cpu}
        </div>
        <div style={{ fontSize:'14px', color:t.text3, fontWeight:700, letterSpacing:'2px', fontFamily:'Rajdhani,sans-serif' }}>{modulo} — EN CONSTRUCCIÓN</div>
        <div style={{ fontSize:'12px', color:t.muted, marginTop:'8px', fontFamily:'Rajdhani,sans-serif' }}>Este módulo se activa en la próxima sesión de desarrollo</div>
      </Card>
    </div>
  )
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────
const NAV = ['dashboard','clientes','calendario','archivos','alertas','ia']
const ROL = ['ceo','cm','sem','seo']
const META: Record<string,{label:string;icon:JSX.Element}> = {
  dashboard:  {label:'Dashboard',  icon:I.grid},
  clientes:   {label:'Clientes',   icon:I.users},
  calendario: {label:'Calendario', icon:I.cal},
  archivos:   {label:'Archivos',   icon:I.folder},
  alertas:    {label:'Alertas',    icon:I.bell},
  ia:         {label:'Cerebro IA', icon:I.cpu},
  ceo:        {label:'CEO',        icon:I.chart},
  cm:         {label:'CM',         icon:I.pen},
  sem:        {label:'SEM',        icon:I.target},
  seo:        {label:'SEO',        icon:I.search},
}

export default function App() {
  const [vista, setVista]   = useState('dashboard')
  const [theme, setTheme]   = useState<Theme>('dark')
  const [menu, setMenu]     = useState(false)
  const mobile              = useMobile()
  const t                   = T[theme]

  const irA = useCallback((v:string) => { setVista(v); setMenu(false) }, [])

  const renderVista = () => {
    switch(vista) {
      case 'dashboard':  return <VistaDashboard theme={theme} irA={irA}/>
      case 'clientes':   return <VistaClientes theme={theme}/>
      case 'ceo':        return <VistaCEO theme={theme}/>
      case 'cm':         return <VistaCM theme={theme}/>
      case 'sem':        return <VistaSEM theme={theme}/>
      case 'seo':        return <VistaSEO theme={theme}/>
      case 'calendario': return <Placeholder title="Calendario" modulo="MÓDULO 3" theme={theme}/>
      case 'archivos':   return <Placeholder title="Archivos" modulo="MÓDULO 5" theme={theme}/>
      case 'alertas':    return <Placeholder title="Alertas" modulo="MÓDULO 4" theme={theme}/>
      case 'ia':         return <Placeholder title="Cerebro IA" modulo="MÓDULO 6" theme={theme}/>
      default:           return <VistaDashboard theme={theme} irA={irA}/>
    }
  }

  const sideBtn = (key:string): React.CSSProperties => ({
    display:'flex', alignItems:'center', gap:'10px',
    padding:'9px 14px', borderRadius:'9px', cursor:'pointer',
    color: vista===key ? GOLD : t.text3,
    background: vista===key ? (theme==='dark'?'#161628':'#f0e8d8') : 'transparent',
    fontWeight: vista===key ? 700 : 500,
    fontSize:'13px', border:'none', width:'100%', textAlign:'left', marginBottom:'2px',
    fontFamily:'Rajdhani,sans-serif', letterSpacing:'0.3px',
    boxShadow: vista===key ? `inset 3px 0 0 ${GOLD}` : 'none',
    transition:'all 0.15s',
  })

  return (
    <>
      <FontStyle/>
      <div style={{ minHeight:'100vh', background:t.bg, color:t.text, display:'flex', fontFamily:'Rajdhani,sans-serif', fontSize:'14px' }}>

        {/* Overlay mobile */}
        {mobile && menu && <div onClick={()=>setMenu(false)} style={{ position:'fixed', inset:0, background:'#00000080', zIndex:99 }}/>}

        {/* SIDEBAR */}
        <aside className={`char-sidebar${menu?' open':''}`} style={{
          width:'236px', background:t.surface, borderRight:`1px solid ${t.border}`,
          display:'flex', flexDirection:'column', flexShrink:0,
          position: mobile ? 'fixed' : 'sticky',
          top:0, height:'100vh', zIndex: mobile ? 100 : 'auto',
        }}>
          {/* Logo */}
          <div style={{ padding:'26px 20px 22px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'32px', height:'32px', background:`linear-gradient(135deg,${GOLD},#7a5010)`, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:`0 4px 14px ${GOLD}50`, animation:'glow 3s ease-in-out infinite' }}>
                {I.bolt}
              </div>
              <div>
                <div style={{ fontWeight:800, fontSize:'15px', letterSpacing:'2px', color:t.text, fontFamily:'Rajdhani,sans-serif' }}>CHAR CORE</div>
                <div style={{ fontSize:'8px', color:t.muted, letterSpacing:'2.5px', marginTop:'1px', fontFamily:'Rajdhani,sans-serif' }}>SISTEMA OPERATIVO</div>
              </div>
            </div>
          </div>

          <div style={{ height:'1px', background:`linear-gradient(90deg,transparent,${t.border},transparent)`, margin:'0 20px 20px' }}/>

          <nav style={{ padding:'0 10px', flex:1, overflowY:'auto' }}>
            <div style={{ fontSize:'9px', color:t.muted, letterSpacing:'2.5px', marginBottom:'8px', paddingLeft:'14px', fontWeight:700, fontFamily:'Rajdhani,sans-serif' }}>NAVEGACIÓN</div>
            {NAV.map(k=>(
              <button key={k} className="char-nav" onClick={()=>irA(k)} style={sideBtn(k)}>
                {META[k].icon}{META[k].label}
                {k==='alertas' && <span style={{ marginLeft:'auto', background:RED, color:'#fff', fontSize:'9px', fontWeight:800, padding:'1px 7px', borderRadius:'10px', boxShadow:`0 0 8px ${RED}80`, fontFamily:'Rajdhani,sans-serif' }}>3</span>}
              </button>
            ))}

            <div style={{ height:'1px', background:`linear-gradient(90deg,transparent,${t.border},transparent)`, margin:'20px 4px 16px' }}/>

            <div style={{ fontSize:'9px', color:t.muted, letterSpacing:'2.5px', marginBottom:'8px', paddingLeft:'14px', fontWeight:700, fontFamily:'Rajdhani,sans-serif' }}>PANELES DE ROL</div>
            {ROL.map(k=>(
              <button key={k} className="char-nav" onClick={()=>irA(k)} style={sideBtn(k)}>
                <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:vista===k?ROL_COLOR[k.toUpperCase()]||GOLD:t.muted, flexShrink:0, boxShadow:vista===k?`0 0 6px ${ROL_COLOR[k.toUpperCase()]||GOLD}`:'none', transition:'all 0.15s' }}/>
                {META[k].label}
              </button>
            ))}
          </nav>

          {/* User + Theme toggle */}
          <div style={{ padding:'16px 20px', borderTop:`1px solid ${t.border}` }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'30px', height:'30px', background:GOLD+'20', borderRadius:'50%', border:`1px solid ${GOLD}50`, display:'flex', alignItems:'center', justifyContent:'center', color:GOLD, fontWeight:800, fontSize:'12px', fontFamily:'Rajdhani,sans-serif', boxShadow:`0 0 10px ${GOLD}20` }}>G</div>
                <div>
                  <div style={{ fontSize:'12px', fontWeight:700, color:t.text2, fontFamily:'Rajdhani,sans-serif' }}>Gabriel</div>
                  <div style={{ fontSize:'10px', color:t.text3, fontFamily:'Rajdhani,sans-serif' }}>Administrador</div>
                </div>
              </div>
              <button onClick={()=>setTheme(theme==='dark'?'light':'dark')} style={{ background:t.surface2, border:`1px solid ${t.border}`, borderRadius:'7px', padding:'6px', cursor:'pointer', color:t.text2, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}>
                {theme==='dark'?I.sun:I.moon}
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          {/* Mobile topbar */}
          {mobile && (
            <div style={{ padding:'14px 16px', background:t.surface, borderBottom:`1px solid ${t.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:50 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'26px', height:'26px', background:`linear-gradient(135deg,${GOLD},#7a5010)`, borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>{I.bolt}</div>
                <span style={{ fontWeight:800, fontSize:'14px', letterSpacing:'1.5px', color:t.text, fontFamily:'Rajdhani,sans-serif' }}>CHAR CORE</span>
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={()=>setTheme(theme==='dark'?'light':'dark')} style={{ background:t.surface2, border:`1px solid ${t.border}`, borderRadius:'7px', padding:'7px', cursor:'pointer', color:t.text2, display:'flex' }}>{theme==='dark'?I.sun:I.moon}</button>
                <button onClick={()=>setMenu(!menu)} style={{ background:t.surface2, border:`1px solid ${t.border}`, borderRadius:'7px', padding:'7px', cursor:'pointer', color:t.text2, display:'flex' }}>{menu?I.close:I.menu}</button>
              </div>
            </div>
          )}

          <main className="char-main" style={{ flex:1, padding:'44px 52px', overflowY:'auto' }}>
            {renderVista()}
          </main>
        </div>
      </div>
    </>
  )
}
