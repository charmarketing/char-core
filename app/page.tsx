'use client'
import { useState, useEffect, useCallback } from 'react'
import './globals.css'
import Calendario from './components/Calendario'
import Alertas from './components/Alertas'
import Archivos from './components/Archivos'
import CerebroIA from './components/CerebroIA'
import VideoEditor from './components/VideoEditor'
import { supabase } from './lib/supabase'

// ── THEME ─────────────────────────────────────────────────────────────────
type Theme = 'dark'|'light'
const D = { bg:'#05050f',surface:'#0b0b18',s2:'#111124',border:'#16163a',b2:'#1e1e3a',text:'#f0f0ff',text2:'#9090b8',text3:'#4a4a6a',muted:'#2a2a4a' }
const L = { bg:'#eef0f8',surface:'#ffffff',s2:'#f4f6ff',border:'#dde0f0',b2:'#c8cbdf',text:'#0d0d20',text2:'#2a2a4a',text3:'#606088',muted:'#9090aa' }
const th = (t:Theme) => t==='dark'?D:L
const GOLD='#c9a96e', BLUE='#4f8fff', GREEN='#3dd68c', RED='#f87171', AMBER='#f59e0b', PURPLE='#a78bfa'

// ── CSV EXPORT (separador ; para Excel latinoamérica) ─────────────────────
function exportCSV(name:string, headers:string[], rows:(string|number)[][]) {
  const sep = ';'
  const bom = '\uFEFF'
  const content = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(sep)).join('\r\n')
  const blob = new Blob([bom+content], {type:'text/csv;charset=utf-8;'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href=url; a.download=name+'.csv'; a.click()
  URL.revokeObjectURL(url)
}

// ── DATOS ─────────────────────────────────────────────────────────────────
const COLORES_CLIENTE = [GOLD, BLUE, PURPLE, GREEN, AMBER]
const CLIENTES = [
  {id:1,nombre:'Cliente Alfa', red:'Instagram',horas:2, tareas:3,campañas:1,color:GOLD},
  {id:2,nombre:'Cliente Beta', red:'YouTube',  horas:50,tareas:5,campañas:0,color:BLUE},
  {id:3,nombre:'Cliente Gamma',red:'LinkedIn', horas:20,tareas:2,campañas:1,color:PURPLE},
]
const TAREAS_HOY = [
  {texto:'Calendario de contenido Mayo — Alfa',rol:'CM', p:'alta'},
  {texto:'Configurar campaña Google Ads',      rol:'SEM',p:'alta'},
  {texto:'Revisar propuesta Cliente Beta',     rol:'CEO',p:'alta'},
  {texto:'Auditoría SEO inicial — Alfa',       rol:'SEO',p:'media'},
  {texto:'CHAR Session para Cliente Beta',     rol:'CM', p:'media'},
]
const ALERTAS_D = [
  {tipo:'urgente',texto:'Cliente Beta sin actividad hace 50hs',  tiempo:'hace 2h'},
  {tipo:'info',   texto:'Calendario de Mayo sin planificar — Alfa',tiempo:'hace 5h'},
  {tipo:'info',   texto:'Campaña SEM de Gamma sin iniciar',      tiempo:'hace 1d'},
]
const NOTICIAS = [
  {titulo:'Instagram actualiza algoritmo de Reels: más peso al tiempo de visualización',fuente:'Social Media Today',   tiempo:'hace 3h'},
  {titulo:'Google Ads lanza métricas de conversión con IA predictiva',                 fuente:'Search Engine Journal',tiempo:'hace 5h'},
  {titulo:'LinkedIn supera 1B usuarios: oportunidades para marcas B2B en 2026',        fuente:'Marketing Dive',        tiempo:'hace 8h'},
]
const ROLES_R = [
  {rol:'CEO',tareas:5,hechas:1,color:GOLD},
  {rol:'CM', tareas:7,hechas:1,color:GREEN},
  {rol:'SEM',tareas:5,hechas:0,color:BLUE},
  {rol:'SEO',tareas:5,hechas:0,color:PURPLE},
]
const RC:Record<string,string> = {CEO:GOLD,CM:GREEN,SEM:BLUE,SEO:PURPLE}
const USUARIOS = ['Gabriel','Adri']

function est(h:number){return h<24?{c:GREEN,l:'ACTIVO',p:90}:h<48?{c:AMBER,l:'ATENCIÓN',p:50}:{c:RED,l:'URGENTE',p:15}}

// ── ICONS ─────────────────────────────────────────────────────────────────
const I:Record<string,JSX.Element> = {
  bolt:   <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  grid:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  users:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  cal:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  folder: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  bell:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  cpu:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  sun:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  plus:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  dl:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  warn:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  info:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  news:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/></svg>,
  trend:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  task:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  alert2: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  film:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>,
  chart:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  target: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  search: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  pen:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  link:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  eye:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  menu:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  check:  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  logout: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
}

// ── HOOKS ─────────────────────────────────────────────────────────────────
function useMobile(){
  const [m,setM]=useState(false)
  useEffect(()=>{
    const f=()=>setM(window.innerWidth<=768)
    f(); window.addEventListener('resize',f)
    return()=>window.removeEventListener('resize',f)
  },[])
  return m
}

// ── UI ATOMS ──────────────────────────────────────────────────────────────
function Card({children,style={},t,glow=false}:{children:React.ReactNode;style?:React.CSSProperties;t:Theme;glow?:boolean}){
  const c=th(t)
  return(
    <div className={`char-card char-surface ${t}`} style={{
      background:c.surface,border:`1px solid ${c.border}`,borderRadius:'14px',padding:'22px',
      boxShadow:glow?`0 0 28px ${GOLD}18,0 4px 24px #00000030`:'0 2px 16px #00000015',
      transition:'border-color 0.2s,box-shadow 0.2s',...style
    }}>{children}</div>
  )
}

function Eb({text,t}:{text:string;t:Theme}){
  return <div style={{fontSize:'9px',color:th(t).text3,letterSpacing:'3px',fontWeight:700,marginBottom:'4px'}}>{text}</div>
}

function Tag({label,color}:{label:string;color:string}){
  return <span style={{padding:'2px 9px',borderRadius:'20px',background:color+'18',border:`1px solid ${color}45`,fontSize:'9px',color,fontWeight:700,letterSpacing:'1px'}}>{label}</span>
}

function Btn({children,onClick,v='ghost',t}:{children:React.ReactNode;onClick?:()=>void;v?:'primary'|'ghost'|'outline'|'danger';t:Theme}){
  const c=th(t)
  const vs:Record<string,React.CSSProperties>={
    primary:{background:`linear-gradient(135deg,${GOLD},#8b6010)`,color:'#050510',border:'none',fontWeight:700,boxShadow:`0 4px 16px ${GOLD}40`},
    ghost:  {background:c.s2,color:c.text2,border:`1px solid ${c.border}`,fontWeight:500},
    outline:{background:'transparent',color:GOLD,border:`1px solid ${GOLD}55`,fontWeight:600},
    danger: {background:'transparent',color:RED,border:`1px solid ${RED}55`,fontWeight:600},
  }
  return(
    <button className="char-btn" onClick={onClick} style={{...vs[v],padding:'8px 16px',borderRadius:'8px',fontSize:'12px',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',letterSpacing:'0.3px',transition:'all 0.15s',fontFamily:'Rajdhani,sans-serif'}}>
      {children}
    </button>
  )
}

function SHead({ey,ti,action,t}:{ey:string;ti:string;action?:React.ReactNode;t:Theme}){
  return(
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'18px'}}>
      <div><Eb text={ey} t={t}/><h2 style={{fontSize:'18px',fontWeight:700,margin:0,color:th(t).text}}>{ti}</h2></div>
      {action}
    </div>
  )
}

function Div({t}:{t:Theme}){return <div style={{height:'1px',background:th(t).border,margin:'14px 0'}}/>}

function SRow({label,val,color,t}:{label:string;val:string;color?:string;t:Theme}){
  const c=th(t)
  return(
    <div className="char-row" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 8px',borderRadius:'6px',transition:'background 0.15s'}}>
      <span style={{fontSize:'13px',color:c.text2}}>{label}</span>
      <span style={{fontSize:'14px',fontWeight:700,color:color||GOLD}}>{val}</span>
    </div>
  )
}

function TItem({text,p='normal',done=false,t}:{text:string;p?:string;done?:boolean;t:Theme}){
  const [ok,setOk]=useState(done)
  const pc=p==='alta'?RED:p==='media'?AMBER:th(t).text3
  return(
    <div className="char-row" onClick={()=>setOk(!ok)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 8px',borderRadius:'6px',cursor:'pointer',transition:'background 0.15s'}}>
      <div style={{width:'17px',height:'17px',borderRadius:'5px',border:`1.5px solid ${ok?GREEN:th(t).b2}`,background:ok?GREEN+'25':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.15s'}}>
        {ok&&<span style={{color:GREEN}}>{I.check}</span>}
      </div>
      <span style={{fontSize:'13px',color:ok?th(t).text3:th(t).text2,textDecoration:ok?'line-through':'none',flex:1,lineHeight:'1.4'}}>{text}</span>
      {p!=='normal'&&p!=='done'&&!ok&&<Tag label={p.toUpperCase()} color={pc}/>}
    </div>
  )
}

function MCard({label,val,note,icon,color,t}:{label:string;val:string;note:string;icon:JSX.Element;color:string;t:Theme}){
  const c=th(t)
  return(
    <Card t={t} style={{position:'relative',overflow:'hidden',padding:'22px'}}>
      <div style={{position:'absolute',top:0,right:0,width:'80px',height:'80px',background:`radial-gradient(circle at top right,${color}15,transparent 70%)`,borderRadius:'0 14px 0 0'}}/>
      <div style={{position:'absolute',top:'-1px',right:'-1px',width:'40px',height:'3px',background:`linear-gradient(90deg,transparent,${color})`,borderRadius:'0 14px 0 0'}}/>
      <div style={{color,marginBottom:'14px',opacity:0.9}}>{icon}</div>
      <div style={{fontSize:'32px',fontWeight:800,color:c.text,lineHeight:1,marginBottom:'6px',letterSpacing:'-0.5px'}}>{val}</div>
      <div style={{fontSize:'12px',color:c.text2,marginBottom:'4px',fontWeight:600}}>{label}</div>
      <div style={{fontSize:'11px',color,fontWeight:700,letterSpacing:'0.5px'}}>{note}</div>
    </Card>
  )
}

// ── LOGIN SCREEN ──────────────────────────────────────────────────────────
function LoginScreen({onSelect,t}:{onSelect:(u:string)=>void;t:Theme}){
  const c=th(t)
  return(
    <div className="char-slide" style={{minHeight:'100vh',background:c.bg,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'32px'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:'52px',height:'52px',background:`linear-gradient(135deg,${GOLD},#7a5010)`,borderRadius:'14px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',margin:'0 auto 16px',boxShadow:`0 8px 28px ${GOLD}50`,animation:'glow 3s ease-in-out infinite'}}>
          {I.bolt}
        </div>
        <div style={{fontWeight:800,fontSize:'22px',letterSpacing:'3px',color:c.text}}>CHAR CORE</div>
        <div style={{fontSize:'11px',color:c.muted,letterSpacing:'2.5px',marginTop:'4px'}}>SISTEMA OPERATIVO</div>
      </div>
      <Card t={t} style={{padding:'32px 40px',textAlign:'center',minWidth:'320px'}}>
        <div style={{fontSize:'13px',color:c.text2,marginBottom:'24px',fontWeight:600,letterSpacing:'1px'}}>¿QUIÉN ERES?</div>
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {USUARIOS.map(u=>(
            <button key={u} onClick={()=>onSelect(u)} className="char-btn" style={{
              background:`linear-gradient(135deg,${GOLD}20,${GOLD}10)`,
              border:`1px solid ${GOLD}50`,
              borderRadius:'10px',padding:'14px 24px',
              cursor:'pointer',fontSize:'16px',fontWeight:700,
              color:c.text,letterSpacing:'1px',
              fontFamily:'Rajdhani,sans-serif',
              transition:'all 0.15s',
              boxShadow:`0 2px 12px ${GOLD}15`,
            }}>
              {u}
            </button>
          ))}
        </div>
      </Card>
      <div style={{fontSize:'10px',color:c.muted,letterSpacing:'1px'}}>v1.0 · CHAR Agency · 2026</div>
    </div>
  )
}

// ── VISTA DASHBOARD ───────────────────────────────────────────────────────
function VDash({t,usuario,irA}:{t:Theme;usuario:string;irA:(v:string)=>void}){
  const c=th(t)
  const h=new Date().getHours()
  const sal=h<12?'Buenos días':h<19?'Buenas tardes':'Buenas noches'
  const fecha=new Date().toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})
  return(
    <div className="char-fade" style={{display:'grid',gap:'32px'}}>
      <div className="topbar" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div>
          <Eb text="CENTRO DE COMANDO" t={t}/>
          <h1 style={{fontSize:'28px',fontWeight:800,margin:'4px 0 6px',color:c.text,letterSpacing:'0.5px'}}>
            {sal}, <span style={{color:GOLD}}>{usuario}</span>
          </h1>
          <p style={{color:c.text3,fontSize:'12px',margin:0,textTransform:'capitalize'}}>{fecha}</p>
        </div>
        <Btn v="primary" t={t} onClick={()=>{irA('clientes');setTimeout(()=>(window as any).__abrirModalCliente?.(),300)}}>{I.plus} Nuevo Cliente</Btn>
      </div>

      <div>
        <SHead ey="RESUMEN EJECUTIVO" ti="Métricas del Día" t={t}/>
        <div className="g4" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px'}}>
          <MCard label="Clientes Activos"  val="3"  note="+1 este mes"     icon={I.trend}  color={GOLD}   t={t}/>
          <MCard label="Tareas Pendientes" val="7"  note="2 vencen hoy"    icon={I.task}   color={BLUE}   t={t}/>
          <MCard label="Alertas Críticas"  val="1"  note="Requiere acción" icon={I.alert2} color={RED}    t={t}/>
          <MCard label="Clips Generados"   val="—"  note="Próximo módulo"  icon={I.film}   color={PURPLE} t={t}/>
        </div>
      </div>

      <div>
        <SHead ey="ESTADO EN TIEMPO REAL" ti="Semáforo de Clientes" t={t} action={<span style={{fontSize:'11px',color:c.text3}}>3 / 10 slots</span>}/>
        <div className="g3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px'}}>
          {CLIENTES.map(cl=>{
            const e=est(cl.horas)
            return(
              <Card key={cl.id} t={t} style={{padding:'18px',cursor:'pointer',borderTop:`2px solid ${e.c}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div style={{width:'34px',height:'34px',background:cl.color+'20',borderRadius:'9px',border:`1px solid ${cl.color}45`,display:'flex',alignItems:'center',justifyContent:'center',color:cl.color,fontWeight:800,fontSize:'13px',boxShadow:`0 0 12px ${cl.color}20`}}>
                      {cl.nombre.charAt(8)}
                    </div>
                    <div>
                      <div style={{fontWeight:700,fontSize:'14px',color:c.text}}>{cl.nombre}</div>
                      <div style={{fontSize:'11px',color:c.text3}}>{cl.red}</div>
                    </div>
                  </div>
                  <Tag label={e.l} color={e.c}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                  <span style={{fontSize:'11px',color:c.text3}}>Actividad</span>
                  <span style={{fontSize:'11px',color:e.c,fontWeight:700}}>{cl.horas}h atrás</span>
                </div>
                <div style={{height:'3px',background:c.border,borderRadius:'3px'}}>
                  <div style={{height:'100%',width:`${e.p}%`,background:`linear-gradient(90deg,${e.c}80,${e.c})`,borderRadius:'3px',boxShadow:`0 0 8px ${e.c}55`}}/>
                </div>
                <div style={{fontSize:'11px',color:c.text3,marginTop:'10px'}}>{cl.tareas} tareas · {cl.campañas} campañas</div>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="g2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <Card t={t}>
          <SHead ey="PRIORIDAD HOY" ti="Tareas Urgentes" t={t} action={<Btn t={t} onClick={()=>irA('ceo')}>Ver todas</Btn>}/>
          <Div t={t}/>
          {TAREAS_HOY.map((x,i)=>(
            <div key={i} className="char-row" style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 8px',borderRadius:'6px'}}>
              <div style={{width:'6px',height:'6px',borderRadius:'50%',background:x.p==='alta'?RED:AMBER,flexShrink:0,boxShadow:`0 0 6px ${x.p==='alta'?RED:AMBER}`}}/>
              <span style={{fontSize:'13px',color:c.text2,flex:1,lineHeight:'1.4'}}>{x.texto}</span>
              <Tag label={x.rol} color={RC[x.rol]}/>
            </div>
          ))}
        </Card>
        <Card t={t}>
          <SHead ey="NOTIFICACIONES" ti="Alertas Activas" t={t}/>
          <Div t={t}/>
          {ALERTAS_D.map((a,i)=>(
            <div key={i} className="char-row" style={{display:'flex',gap:'10px',padding:'10px 8px',borderRadius:'6px'}}>
              <div style={{color:a.tipo==='urgente'?RED:AMBER,marginTop:'1px',flexShrink:0}}>{a.tipo==='urgente'?I.warn:I.info}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:'13px',color:c.text2,lineHeight:'1.4'}}>{a.texto}</div>
                <div style={{fontSize:'10px',color:c.text3,marginTop:'4px'}}>{a.tiempo}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div>
        <SHead ey="EQUIPO" ti="Estado por Área" t={t}/>
        <div className="g4" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px'}}>
          {ROLES_R.map(r=>(
            <Card key={r.rol} t={t} style={{padding:'18px',cursor:'pointer'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                <span style={{fontSize:'16px',fontWeight:800,color:r.color,letterSpacing:'1px'}}>{r.rol}</span>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:r.hechas<r.tareas?RED:GREEN,boxShadow:`0 0 8px ${r.hechas<r.tareas?RED:GREEN}`}}/>
              </div>
              <div style={{fontSize:'32px',fontWeight:800,color:c.text,lineHeight:1,marginBottom:'4px'}}>{r.tareas-r.hechas}</div>
              <div style={{fontSize:'11px',color:c.text3}}>pendientes</div>
              <div style={{height:'3px',background:c.border,borderRadius:'3px',margin:'12px 0 6px'}}>
                <div style={{height:'100%',width:`${(r.hechas/r.tareas)*100}%`,background:r.color,borderRadius:'3px',boxShadow:`0 0 6px ${r.color}80`,transition:'width 0.5s ease'}}/>
              </div>
              <div style={{fontSize:'10px',color:c.text3}}>{r.hechas}/{r.tareas} completadas</div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <SHead ey="INTELIGENCIA DE MERCADO" ti="Marketing Daily" t={t} action={<Tag label="AUTO-ACTUALIZA CON IA" color={GOLD}/>}/>
        <div style={{display:'grid',gap:'10px'}}>
          {NOTICIAS.map((n,i)=>(
            <Card key={i} t={t} style={{padding:'16px 20px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'14px'}}>
                <div style={{display:'flex',gap:'14px',alignItems:'flex-start'}}>
                  <div style={{color:GOLD,marginTop:'1px',flexShrink:0}}>{I.news}</div>
                  <div>
                    <div style={{fontSize:'13px',color:c.text,fontWeight:600,lineHeight:'1.5'}}>{n.titulo}</div>
                    <div style={{fontSize:'11px',color:c.text3,marginTop:'4px'}}>{n.fuente} · {n.tiempo}</div>
                  </div>
                </div>
                <div style={{color:c.text3,flexShrink:0}}>{I.link}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── VISTA CLIENTES ────────────────────────────────────────────────────────
function VClientes({t,clientes,setClientes}:any){
  const c=th(t)
  const [clienteVer,setClienteVer]=useState<any>(null)
  const [clienteEditar,setClienteEditar]=useState<any>(null)
  const [editData,setEditData]=useState<any>({})

const guardarEdicion=async()=>{
  try{
    const {error}=await supabase.from('clientes').update({
      nombre:editData.nombre,
      rubro:editData.rubro,
      email:editData.email,
      telefono:editData.telefono,
      contacto:editData.contacto,
      presupuesto:editData.presupuesto,
      notas:editData.notas,
      url_instagram:editData.url_instagram,
      url_youtube:editData.url_youtube,
      url_linkedin:editData.url_linkedin,
      url_tiktok:editData.url_tiktok,
      url_facebook:editData.url_facebook,
    }).eq('id',editData.id)
    if(error) throw error
    setClientes((prev:any)=>prev.map((cl:any)=>cl.id===editData.id?{...cl,...editData}:cl))
  }catch(e){console.log('Error:',e)}
  setClienteEditar(null)
}
  const exp=()=>exportCSV('CHAR_Clientes',
    ['Cliente','Red Social','Horas sin actividad','Tareas activas','Campañas activas','Estado'],
    clientes.map((cl:any)=>[cl.nombre,cl.red,cl.horas,cl.tareas,cl.campañas,est(cl.horas).l]))
  return(
    <div className="char-fade" style={{display:'grid',gap:'28px'}}>
      {clienteVer&&(
        <div style={{position:'fixed',inset:0,background:'#00000095',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'16px',width:'100%',maxWidth:'560px',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{padding:'24px 28px',borderBottom:`1px solid ${c.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:'10px',color:c.muted,letterSpacing:'2px',fontWeight:700}}>FICHA DE CLIENTE</div>
                <h2 style={{margin:'4px 0 0',color:c.text,fontSize:'22px',fontWeight:800}}>{clienteVer.nombre}</h2>
                <div style={{fontSize:'12px',color:c.muted,marginTop:'4px'}}>{clienteVer.red} · {clienteVer.estado}</div>
              </div>
              <button onClick={()=>setClienteVer(null)} style={{background:c.s2,border:`1px solid ${c.border}`,borderRadius:'8px',padding:'8px',cursor:'pointer',color:c.text3}}>✕</button>
            </div>
            <div style={{padding:'24px 28px',display:'grid',gap:'12px'}}>
              <div style={{padding:'12px 0',borderBottom:`1px solid ${c.border}`,display:'flex',gap:'12px'}}>
  <span style={{fontSize:'10px',color:c.muted,fontWeight:700,minWidth:'110px'}}>RED SOCIAL</span>
  <span style={{fontSize:'13px',color:c.text}}>{clienteVer.red}</span>
</div>
<div style={{padding:'12px 0',borderBottom:`1px solid ${c.border}`,display:'flex',gap:'12px'}}>
  <span style={{fontSize:'10px',color:c.muted,fontWeight:700,minWidth:'110px'}}>ESTADO</span>
  <span style={{fontSize:'13px',color:c.text}}>{clienteVer.estado}</span>
</div>
              {[
                ['RUBRO',clienteVer.rubro],
                ['EMAIL',clienteVer.email],
                ['TELÉFONO',clienteVer.telefono],
                ['CONTACTO',clienteVer.contacto],
                ['PRESUPUESTO',clienteVer.presupuesto],
                ['FECHA INICIO',clienteVer.fecha_inicio],
                ['INSTAGRAM',clienteVer.url_instagram],
                ['YOUTUBE',clienteVer.url_youtube],
                ['LINKEDIN',clienteVer.url_linkedin],
                ['TIKTOK',clienteVer.url_tiktok],
                ['FACEBOOK',clienteVer.url_facebook],
                ['NOTAS',clienteVer.notas],
              ].filter(([,v]:any)=>v&&v!=='').map(([label,val]:any)=>(
                <div key={label} style={{display:'flex',gap:'12px',alignItems:'flex-start',padding:'8px 0',borderBottom:`1px solid ${c.border}`}}>
                  <span style={{fontSize:'10px',color:c.muted,letterSpacing:'1.5px',fontWeight:700,minWidth:'110px',paddingTop:'2px'}}>{label}</span>
                  <span style={{fontSize:'13px',color:c.text,flex:1}}>{val}</span>
                </div>
              ))}   
  )
            </div>
          </div>
        </div>
      )}
      {clienteEditar&&(
  <div style={{position:'fixed',inset:0,background:'#00000095',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
    <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'16px',width:'100%',maxWidth:'620px',maxHeight:'90vh',overflowY:'auto'}}>
      <div style={{padding:'24px 28px',borderBottom:`1px solid ${c.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:'10px',color:c.muted,letterSpacing:'2px',fontWeight:700}}>EDITAR</div>
          <h2 style={{margin:'4px 0 0',color:c.text,fontSize:'22px',fontWeight:800}}>{clienteEditar.nombre}</h2>
        </div>
        <button onClick={()=>setClienteEditar(null)} style={{background:c.s2,border:`1px solid ${c.border}`,borderRadius:'8px',padding:'8px',cursor:'pointer',color:c.text3}}>✕</button>
      </div>
      <div style={{padding:'24px 28px',display:'grid',gap:'14px'}}>
        {[
          ['NOMBRE O MARCA','nombre'],
          ['RUBRO','rubro'],
          ['EMAIL','email'],
          ['TELÉFONO','telefono'],
          ['CONTACTO','contacto'],
          ['PRESUPUESTO','presupuesto'],
          ['INSTAGRAM','url_instagram'],
          ['YOUTUBE','url_youtube'],
          ['LINKEDIN','url_linkedin'],
          ['TIKTOK','url_tiktok'],
          ['FACEBOOK','url_facebook'],
        ].map(([label,key])=>(
          <div key={key}>
            <label style={{fontSize:'10px',color:c.muted,letterSpacing:'2px',fontWeight:700}}>{label}</label>
            <input value={editData[key]||''} onChange={e=>setEditData((prev:any)=>({...prev,[key]:e.target.value}))}
              style={{width:'100%',marginTop:'5px',padding:'9px 12px',background:c.s2,border:`1px solid ${c.border}`,borderRadius:'8px',color:c.text,fontSize:'13px',outline:'none',boxSizing:'border-box' as any,fontFamily:'Rajdhani,sans-serif'}}/>
          </div>
        ))}
        <div>
          <label style={{fontSize:'10px',color:c.muted,letterSpacing:'2px',fontWeight:700}}>NOTAS</label>
          <textarea value={editData.notas||''} onChange={e=>setEditData((prev:any)=>({...prev,notas:e.target.value}))}
            rows={3} style={{width:'100%',marginTop:'5px',padding:'9px 12px',background:c.s2,border:`1px solid ${c.border}`,borderRadius:'8px',color:c.text,fontSize:'13px',outline:'none',boxSizing:'border-box' as any,resize:'vertical',fontFamily:'Rajdhani,sans-serif'}}/>
        </div>
        <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
          <Btn v="outline" t={t} onClick={()=>setClienteEditar(null)}>Cancelar</Btn>
          <Btn v="primary" t={t} onClick={guardarEdicion}>Guardar Cambios</Btn>
        </div>
      </div>
    </div>
  </div>
)}
      <div className="topbar" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
        <div><Eb text="GESTIÓN" t={t}/><h1 style={{fontSize:'28px',fontWeight:800,margin:0,color:c.text}}>Clientes</h1></div>
        <div style={{display:'flex',gap:'10px'}}>
          <Btn v="outline" t={t} onClick={exp}>{I.dl} Exportar CSV</Btn>
          <Btn v="primary" t={t} onClick={()=>(window as any).__abrirModalCliente?.()}>{I.plus} Nuevo Cliente</Btn>
        </div>
      </div>
      <div className="g3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
        {clientes.map((cl:any)=>{
          const e=est(cl.horas)
          return(
            <Card key={cl.id} t={t} glow>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'18px'}}>
                <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
                  <div style={{width:'42px',height:'42px',background:cl.color+'20',border:`1px solid ${cl.color}55`,borderRadius:'11px',display:'flex',alignItems:'center',justifyContent:'center',color:cl.color,fontWeight:800,fontSize:'15px',boxShadow:`0 0 14px ${cl.color}20`}}>
                    {cl.nombre.charAt(0)}
                  </div>
                  <div>
                    <div style={{fontWeight:700,color:c.text,fontSize:'15px'}}>{cl.nombre}</div>
                    <div style={{fontSize:'11px',color:c.text3}}>{cl.red}</div>
                  </div>
                </div>
                <span style={{fontSize:'10px',fontWeight:700,color:e.c,letterSpacing:'1.5px'}}>{e.l}</span>
              </div>
              <Div t={t}/>
              <div className="g2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'16px'}}>
                {[['TAREAS',String(cl.tareas)],['CAMPAÑAS',String(cl.campañas)],['SIN ACTIVIDAD',`${cl.horas}h`],['RED',cl.red]].map(([l,v],i)=>(
                  <div key={i} style={{background:c.s2,borderRadius:'9px',padding:'10px 12px',border:`1px solid ${c.border}`}}>
                    <div style={{fontSize:'9px',color:c.text3,letterSpacing:'1.5px',marginBottom:'5px',fontWeight:700}}>{l}</div>
                    <div style={{fontSize:'15px',fontWeight:700,color:c.text}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:'8px'}}>
                <Btn t={t} onClick={()=>setClienteVer(cl)}>{I.eye} Ver</Btn>
                <Btn t={t} onClick={()=>{setClienteEditar(cl);setEditData(cl)}}>{I.pen} Editar</Btn>
                <Btn t={t}>{I.bell} Alertas</Btn>
              </div>
            </Card>
          )
        })}
        <div onClick={()=>(window as any).__abrirModalCliente?.()} style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'200px',cursor:'pointer',border:`2px dashed ${c.border}`,borderRadius:'12px',background:c.surface}}>
          <div style={{width:'40px',height:'40px',borderRadius:'50%',background:c.s2,display:'flex',alignItems:'center',justifyContent:'center',color:GOLD,fontSize:'24px',marginBottom:'10px'}}>+</div>
          <div style={{color:c.text3,fontSize:'13px',fontWeight:600}}>Agregar cliente</div>
        </div>
      </div>
    </div>
  )
}

// ── SHELL PARA PANELES ────────────────────────────────────────────────────
function PShell({ey,ti,expFn,t,children}:{ey:string;ti:string;expFn:()=>void;t:Theme;children:React.ReactNode}){
  const c=th(t)
  return(
    <div className="char-fade" style={{display:'grid',gap:'24px'}}>
      <div className="topbar" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
        <div><Eb text={ey} t={t}/><h1 style={{fontSize:'28px',fontWeight:800,margin:0,color:c.text}}>{ti}</h1></div>
        <Btn v="outline" t={t} onClick={expFn}>{I.dl} Exportar CSV</Btn>
      </div>
      {children}
    </div>
  )
}

// ── PANEL CEO ─────────────────────────────────────────────────────────────
function VCEO({t}:{t:Theme}){
  const exp=()=>exportCSV('CHAR_Panel_CEO',
    ['KPI','Valor','Observación'],
    [['Clientes activos','3 de 10','Capacidad al 30%'],['Ingresos estimados','—','Sin datos aún'],['Tareas completadas','12 de 22','55% de avance'],['Clips generados','0','Módulo próximo'],['Alertas críticas','1','Requiere atención']])
  return(
    <PShell ey="DIRECCIÓN EJECUTIVA" ti="Panel CEO" expFn={exp} t={t}>
      <div className="g2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <Card t={t}>
          <Eb text="KPIs GLOBALES" t={t}/><Div t={t}/>
          {[['Clientes activos','3 / 10',GOLD],['Ingresos estimados','—',GREEN],['Tareas completadas','12 / 22',BLUE],['Clips generados','0',PURPLE],['Alertas críticas','1',RED]].map(([l,v,c2],i)=>(
            <SRow key={i} label={l} val={v} color={c2} t={t}/>
          ))}
        </Card>
        <Card t={t}>
          <Eb text="EQUIPO CHAR" t={t}/><Div t={t}/>
          {[{n:'Gabriel',r:'Dev / Ops'},{n:'Adri',r:'Gestor de Proyectos'}].map((m,i)=>(
            <div key={i} className="char-row" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 8px',borderRadius:'6px',transition:'background 0.15s'}}>
              <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                <div style={{width:'30px',height:'30px',background:GOLD+'20',borderRadius:'50%',border:`1px solid ${GOLD}55`,display:'flex',alignItems:'center',justifyContent:'center',color:GOLD,fontWeight:800,fontSize:'12px',boxShadow:`0 0 10px ${GOLD}20`}}>{m.n[0]}</div>
                <div>
                  <div style={{fontSize:'13px',color:th(t).text,fontWeight:600}}>{m.n}</div>
                  <div style={{fontSize:'11px',color:th(t).text3}}>{m.r}</div>
                </div>
              </div>
              <Tag label="ACTIVO" color={GREEN}/>
            </div>
          ))}
        </Card>
      </div>
      <Card t={t}>
        <Eb text="TAREAS EJECUTIVAS" t={t}/><Div t={t}/>
        {[{tx:'Revisar propuesta para Cliente Beta',p:'alta'},{tx:'Definir estrategia Q2 con Adri',p:'media'},{tx:'Configurar módulo de facturación',p:'normal'},{tx:'Revisar métricas semanales',p:'done'},{tx:'Actualizar filosofía CHAR en Cerebro IA',p:'normal'}].map((x,i)=>(
          <TItem key={i} text={x.tx} p={x.p} done={x.p==='done'} t={t}/>
        ))}
      </Card>
    </PShell>
  )
}

// ── PANEL SEM ─────────────────────────────────────────────────────────────
function VSEM({t}:{t:Theme}){
  const exp=()=>exportCSV('CHAR_Panel_SEM',
    ['Campaña','Estado','Presupuesto mensual','Impresiones','Clics','CTR','CPC','Conversiones','ROAS'],
    [['Google Ads — Alfa','Activa','$0','—','—','—','—','—','—'],['Meta Ads — Beta','Pausada','$0','—','—','—','—','—','—'],['Google Ads — Gamma','Sin iniciar','—','—','—','—','—','—','—']])
  return(
    <PShell ey="SEARCH ENGINE MARKETING" ti="Panel SEM" expFn={exp} t={t}>
      <div className="g2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <Card t={t}>
          <Eb text="CAMPAÑAS ACTIVAS" t={t}/><Div t={t}/>
          {[{n:'Google Ads — Alfa',e:'ACTIVA',c:GREEN,p:'$0/mes'},{n:'Meta Ads — Beta',e:'PAUSADA',c:AMBER,p:'$0/mes'},{n:'Google Ads — Gamma',e:'SIN INICIAR',c:th(t).text3,p:'—'}].map((x,i)=>(
            <div key={i} className="char-row" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 8px',borderRadius:'6px',transition:'background 0.15s'}}>
              <div>
                <div style={{fontSize:'13px',color:th(t).text,fontWeight:600}}>{x.n}</div>
                <div style={{fontSize:'11px',color:th(t).text3}}>Presupuesto: {x.p}</div>
              </div>
              <Tag label={x.e} color={x.c}/>
            </div>
          ))}
        </Card>
        <Card t={t}>
          <Eb text="MÉTRICAS SEM" t={t}/><Div t={t}/>
          {[['Impresiones','—'],['Clics totales','—'],['CTR promedio','—'],['Costo por clic','—'],['Conversiones','—'],['ROAS promedio','—']].map(([l,v],i)=>(
            <SRow key={i} label={l} val={v} color={BLUE} t={t}/>
          ))}
        </Card>
      </div>
      <Card t={t}>
        <Eb text="TAREAS SEM" t={t}/><Div t={t}/>
        {['Configurar primera campaña Google Ads','Definir keywords para Cliente Alfa','Conectar Google Analytics a la app','Investigar competencia SEM — Gamma','Revisar landing pages de clientes'].map((x,i)=>(
          <TItem key={i} text={x} p={i<2?'alta':'normal'} t={t}/>
        ))}
      </Card>
    </PShell>
  )
}

// ── PANEL CM ──────────────────────────────────────────────────────────────
function VCM({t}:{t:Theme}){
  const exp=()=>exportCSV('CHAR_Panel_CM',
    ['Cliente','Red social','Publicaciones semana','Estado','Alcance','Engagement','Seguidores nuevos'],
    [['Cliente Alfa','Instagram','3','Planificado','—','—','—'],['Cliente Beta','YouTube','1','Pendiente','—','—','—'],['Cliente Gamma','LinkedIn','2','Publicado','—','—','—']])
  return(
    <PShell ey="COMMUNITY MANAGEMENT" ti="Panel CM" expFn={exp} t={t}>
      <div className="g2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <Card t={t}>
          <Eb text="CONTENIDO ESTA SEMANA" t={t}/><Div t={t}/>
          {[{c:'Cliente Alfa',r:'Instagram',p:'3 posts',e:'PLANIFICADO',co:AMBER},{c:'Cliente Beta',r:'YouTube',p:'1 video',e:'PENDIENTE',co:RED},{c:'Cliente Gamma',r:'LinkedIn',p:'2 artículos',e:'PUBLICADO',co:GREEN}].map((x,i)=>(
            <div key={i} className="char-row" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 8px',borderRadius:'6px',transition:'background 0.15s'}}>
              <div>
                <div style={{fontSize:'13px',color:th(t).text,fontWeight:600}}>{x.c}</div>
                <div style={{fontSize:'11px',color:th(t).text3}}>{x.r} · {x.p}</div>
              </div>
              <Tag label={x.e} color={x.co}/>
            </div>
          ))}
        </Card>
        <Card t={t}>
          <Eb text="MÉTRICAS CM" t={t}/><Div t={t}/>
          {[['Posts publicados','2'],['Alcance promedio','—'],['Engagement rate','—'],['Seguidores ganados','—'],['Stories programadas','0'],['Comentarios respondidos','—']].map(([l,v],i)=>(
            <SRow key={i} label={l} val={v} color={GREEN} t={t}/>
          ))}
        </Card>
      </div>
      <Card t={t}>
        <Eb text="TAREAS CM" t={t}/><Div t={t}/>
        {[{tx:'Crear calendario de contenido Mayo — Alfa',p:'alta'},{tx:'Grabar CHAR Session para Cliente Beta',p:'alta'},{tx:'Responder comentarios — Gamma LinkedIn',p:'media'},{tx:'Diseñar 3 stories template para Alfa',p:'normal'},{tx:'Revisar estética de feed — Cliente Gamma',p:'done'}].map((x,i)=>(
          <TItem key={i} text={x.tx} p={x.p} done={x.p==='done'} t={t}/>
        ))}
      </Card>
    </PShell>
  )
}

// ── PANEL SEO ─────────────────────────────────────────────────────────────
function VSEO({t}:{t:Theme}){
  const exp=()=>exportCSV('CHAR_Panel_SEO',
    ['Cliente','Keyword principal','Posición actual','Domain Authority','Backlinks','Tráfico orgánico','Páginas indexadas'],
    CLIENTES.map(cl=>[cl.nombre,'Sin asignar','—','—','—','—','—']))
  return(
    <PShell ey="SEARCH ENGINE OPTIMIZATION" ti="Panel SEO" expFn={exp} t={t}>
      <div className="g2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <Card t={t}>
          <Eb text="POSICIONAMIENTO" t={t}/><Div t={t}/>
          {CLIENTES.map((cl,i)=>(
            <div key={i} className="char-row" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 8px',borderRadius:'6px',transition:'background 0.15s'}}>
              <div>
                <div style={{fontSize:'13px',color:th(t).text,fontWeight:600}}>{cl.nombre}</div>
                <div style={{fontSize:'11px',color:th(t).text3}}>Keyword: Sin asignar</div>
              </div>
              <span style={{fontSize:'14px',fontWeight:700,color:th(t).text3}}>—</span>
            </div>
          ))}
        </Card>
        <Card t={t}>
          <Eb text="MÉTRICAS SEO" t={t}/><Div t={t}/>
          {[['Domain Authority','—'],['Backlinks totales','—'],['Keywords top 10','—'],['Tráfico orgánico','—'],['Páginas indexadas','—'],['Velocidad promedio','—']].map(([l,v],i)=>(
            <SRow key={i} label={l} val={v} color={PURPLE} t={t}/>
          ))}
        </Card>
      </div>
      <Card t={t}>
        <Eb text="TAREAS SEO" t={t}/><Div t={t}/>
        {['Auditoría SEO inicial — Cliente Alfa','Investigación de keywords — Gamma','Optimizar meta descriptions — Beta','Instalar Google Search Console','Generar reporte mensual de posicionamiento'].map((x,i)=>(
          <TItem key={i} text={x} p={i<2?'alta':'normal'} t={t}/>
        ))}
      </Card>
    </PShell>
  )
}

// ── PLACEHOLDER ───────────────────────────────────────────────────────────
function Placeholder({ti,mod,t}:{ti:string;mod:string;t:Theme}){
  const c=th(t)
  return(
    <div className="char-fade" style={{display:'grid',gap:'24px'}}>
      <div><Eb text="PRÓXIMAMENTE" t={t}/><h1 style={{fontSize:'28px',fontWeight:800,margin:0,color:c.text}}>{ti}</h1></div>
      <Card t={t} style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'320px',border:`1px dashed ${c.b2}`}}>
        <div style={{width:'60px',height:'60px',borderRadius:'50%',background:GOLD+'15',border:`1px solid ${GOLD}45`,display:'flex',alignItems:'center',justifyContent:'center',color:GOLD,marginBottom:'16px',boxShadow:`0 0 20px ${GOLD}20`}}>{I.cpu}</div>
        <div style={{fontSize:'14px',color:c.text3,fontWeight:700,letterSpacing:'2px'}}>{mod} — EN CONSTRUCCIÓN</div>
        <div style={{fontSize:'12px',color:c.muted,marginTop:'8px'}}>Se activa en la próxima sesión de desarrollo</div>
      </Card>
    </div>
  )
}

// ── NAV META ──────────────────────────────────────────────────────────────
const NAV=['dashboard','clientes','calendario','archivos','alertas','ia','video']
const ROL=['ceo','cm','sem','seo']
const META:Record<string,{label:string;icon:JSX.Element}>={
  dashboard:{label:'Dashboard',icon:I.grid},clientes:{label:'Clientes',icon:I.users},
  calendario:{label:'Calendario',icon:I.cal},archivos:{label:'Archivos',icon:I.folder},
  alertas:{label:'Alertas',icon:I.bell},ia:{label:'Cerebro IA',icon:I.cpu},
  video:{label:'Video Editor IA',icon:I.film},
  ceo:{label:'CEO',icon:I.chart},cm:{label:'CM',icon:I.pen},
  sem:{label:'SEM',icon:I.target},seo:{label:'SEO',icon:I.search},
}

// ── APP ───────────────────────────────────────────────────────────────────
type AlertaItem = {
  id:number
  tipo:'urgente'|'atencion'|'info'
  titulo:string
  descripcion:string
  cliente:string
  rol:string
  tiempo:string
  leida:boolean
  origen:'automatica'|'manual'
}
export default function App(){
  const [alertasNoLeidas,setAlertasNoLeidas]=useState(3)
const [alertasData,setAlertasData]=useState<AlertaItem[]>([
  {id:1,tipo:'urgente',titulo:'Cliente Beta sin actividad',descripcion:'Cliente Beta lleva más de 50hs sin actividad registrada. Requiere atención inmediata.',cliente:'Cliente Beta',rol:'CEO',tiempo:'hace 2h',leida:false,origen:'automatica'},
  {id:2,tipo:'atencion',titulo:'Calendario de Mayo sin planificar',descripcion:'Cliente Alfa no tiene contenido planificado para Mayo. Faltan 8 días para el inicio del mes.',cliente:'Cliente Alfa',rol:'CM',tiempo:'hace 5h',leida:false,origen:'automatica'},
  {id:3,tipo:'info',titulo:'Campaña SEM de Gamma sin iniciar',descripcion:'La campaña de Google Ads para Cliente Gamma todavía no fue configurada.',cliente:'Cliente Gamma',rol:'SEM',tiempo:'hace 1d',leida:false,origen:'automatica'},
  {id:4,tipo:'atencion',titulo:'Auditoría SEO pendiente',descripcion:'La auditoría SEO inicial de Cliente Alfa fue asignada hace 3 días y sigue sin completarse.',cliente:'Cliente Alfa',rol:'SEO',tiempo:'hace 3d',leida:true,origen:'automatica'},
])
  const [clientes,setClientes]=useState(CLIENTES)
const [modalNuevoCliente,setModalNuevoCliente]=useState(false)
const [nuevoNombre,setNuevoNombre]=useState('')
const [nuevoRed,setNuevoRed]=useState('Instagram')

const agregarCliente=async()=>{
  if(!nuevoNombre.trim()) return
  try {
    const {data,error} = await supabase.from('clientes').insert([{
      nombre: nuevoNombre,
      red_social: nuevoRed,
      estado: 'activo',
      tareas_count: 0,
      campanas_count: 0
    }]).select()
    if(error) throw error
    if(data){
      const nuevo = {
        id: data[0].id,
        nombre: data[0].nombre,
        red: data[0].red_social,
        horas: 0,
        tareas: 0,
        campañas: 0,
        color: COLORES_CLIENTE[clientes.length % COLORES_CLIENTE.length]
      }
      setClientes([...clientes, nuevo])
    }
  } catch(e){
    console.log('Error agregando cliente:', e)
  }
  setNuevoNombre('')
  setNuevoRed('Instagram')
  setModalNuevoCliente(false)
}
  
  useEffect(()=>{
  (window as any).__abrirModalCliente = ()=>setModalNuevoCliente(true)
},[])

useEffect(()=>{
  async function cargarClientes(){
    try {
      const {data,error} = await supabase.from('clientes').select('*')
      if(error) throw error
      if(data && data.length>0){
        const mapped = data.map((cl:any,i:number)=>({
  id: cl.id,
  nombre: cl.nombre,
  red: cl.red_social,
  estado: cl.estado||'activo',
  horas: cl.ultima_actividad ? 
    Math.floor((Date.now()-new Date(cl.ultima_actividad).getTime())/3600000) : 0,
  tareas: cl.tareas_count||0,
  campañas: cl.campanas_count||0,
  color: COLORES_CLIENTE[i % COLORES_CLIENTE.length],
  rubro: cl.rubro||'',
  email: cl.email||'',
  telefono: cl.telefono||'',
  contacto: cl.contacto||'',
  presupuesto: cl.presupuesto||'',
  fecha_inicio: cl.fecha_inicio||'',
  url_instagram: cl.url_instagram||'',
  url_youtube: cl.url_youtube||'',
  url_linkedin: cl.url_linkedin||'',
  url_tiktok: cl.url_tiktok||'',
  url_facebook: cl.url_facebook||'',
  notas: cl.notas||'',
}))
        setClientes(mapped)
      }
    } catch(e){
      console.log('Supabase no disponible, usando datos locales')
    }
  }
  cargarClientes()
},[])
  const [vista,setVista]=useState('dashboard')
  const [theme,setTheme]=useState<Theme>('dark')
  const [menu,setMenu]=useState(false)
  const [usuario,setUsuario]=useState<string|null>(null)
  const mobile=useMobile()
  const c=th(theme)
  const irA=useCallback((v:string)=>{setVista(v);setMenu(false)},[])

  if(!usuario) return <LoginScreen onSelect={setUsuario} t={theme}/>
  function ModalNuevoCliente({c,theme,clientes,setClientes,setModalNuevoCliente,COLORES_CLIENTE,sb}:any){
  const [nombre,setNombre]=useState('')
  const [rubro,setRubro]=useState('')
  const [contacto,setContacto]=useState('')
  const [email,setEmail]=useState('')
  const [telefono,setTelefono]=useState('')
  const [presupuesto,setPresupuesto]=useState('')
  const [fechaInicio,setFechaInicio]=useState('')
  const [notas,setNotas]=useState('')
  const [urlInstagram,setUrlInstagram]=useState('')
  const [urlYoutube,setUrlYoutube]=useState('')
  const [urlLinkedin,setUrlLinkedin]=useState('')
  const [urlTiktok,setUrlTiktok]=useState('')
  const [urlFacebook,setUrlFacebook]=useState('')
  const [guardando,setGuardando]=useState(false)

  const guardar=async()=>{
    if(!nombre.trim()) return
    setGuardando(true)
    try {
      const {data,error} = await sb.from('clientes').insert([{
        nombre,rubro,contacto,email,telefono,presupuesto,
        fecha_inicio:fechaInicio||null,notas,
        url_instagram:urlInstagram,url_youtube:urlYoutube,
        url_linkedin:urlLinkedin,url_tiktok:urlTiktok,
        url_facebook:urlFacebook,
        red_social:urlInstagram?'Instagram':urlYoutube?'YouTube':urlLinkedin?'LinkedIn':urlTiktok?'TikTok':urlFacebook?'Facebook':'Instagram',
        estado:'activo',tareas_count:0,campanas_count:0
      }]).select()
      if(error) throw error
      if(data){
        const nuevo={
          id:data[0].id,nombre:data[0].nombre,
          red:data[0].red_social,horas:0,tareas:0,campañas:0,
          color:COLORES_CLIENTE[clientes.length%COLORES_CLIENTE.length]
        }
        setClientes((prev:any)=>[...prev,nuevo])
      }
    } catch(e){console.log('Error:',e)}
    setGuardando(false)
    setModalNuevoCliente(false)
  }

  const inp=(label:string,val:string,set:(v:string)=>void,placeholder='',type='text')=>(
    <div>
      <label style={{fontSize:'10px',color:c.muted,letterSpacing:'2px',fontWeight:700}}>{label}</label>
      <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={placeholder}
        style={{width:'100%',marginTop:'5px',padding:'9px 12px',background:c.s2,
        border:`1px solid ${c.border}`,borderRadius:'8px',color:c.text,fontSize:'13px',
        outline:'none',boxSizing:'border-box' as any,fontFamily:'Rajdhani,sans-serif'}}/>
    </div>
  )

  return(
    <div style={{position:'fixed',inset:0,background:'#00000095',zIndex:200,
      display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'16px',
        width:'100%',maxWidth:'620px',maxHeight:'90vh',overflowY:'auto'}}>
                <div style={{padding:'24px 28px 20px',borderBottom:`1px solid ${c.border}`,
          display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:'10px',color:c.muted,letterSpacing:'2px',fontWeight:700}}>GESTIÓN</div>
            <h2 style={{margin:'4px 0 0',color:c.text,fontSize:'22px',fontWeight:800}}>Nuevo Cliente</h2>
          </div>
          <button onClick={()=>setModalNuevoCliente(false)}
            style={{background:c.s2,border:`1px solid ${c.border}`,borderRadius:'8px',
            padding:'8px',cursor:'pointer',color:c.text3,display:'flex'}}>✕</button>
        </div>
        <div style={{padding:'24px 28px',display:'grid',gap:'20px'}}>
          <div>
            <div style={{fontSize:'10px',color:GOLD,letterSpacing:'2px',fontWeight:700,marginBottom:'12px'}}>DATOS PRINCIPALES</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              {inp('NOMBRE O MARCA *',nombre,setNombre,'Ej: DG Clean')}
              {inp('RUBRO / INDUSTRIA',rubro,setRubro,'Ej: Limpieza industrial')}
            </div>
          </div>
          <div>
            <div style={{fontSize:'10px',color:GOLD,letterSpacing:'2px',fontWeight:700,marginBottom:'12px'}}>CONTACTO</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              {inp('NOMBRE DE CONTACTO',contacto,setContacto,'Ej: Juan Pérez')}
              {inp('EMAIL',email,setEmail,'Ej: juan@dgclean.com','email')}
              {inp('TELÉFONO / WHATSAPP',telefono,setTelefono,'Ej: +54 9 11 1234-5678')}
              {inp('PRESUPUESTO MENSUAL',presupuesto,setPresupuesto,'Ej: \$500 USD')}
            </div>
          </div>
          <div>
            <div style={{fontSize:'10px',color:GOLD,letterSpacing:'2px',fontWeight:700,marginBottom:'12px'}}>REDES SOCIALES</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              {inp('INSTAGRAM',urlInstagram,setUrlInstagram,'instagram.com/marca')}
              {inp('YOUTUBE',urlYoutube,setUrlYoutube,'youtube.com/@marca')}
              {inp('LINKEDIN',urlLinkedin,setUrlLinkedin,'linkedin.com/company/marca')}
              {inp('TIKTOK',urlTiktok,setUrlTiktok,'tiktok.com/@marca')}
              {inp('FACEBOOK',urlFacebook,setUrlFacebook,'facebook.com/marca')}
              {inp('FECHA INICIO',fechaInicio,setFechaInicio,'','date')}
            </div>
          </div>
          <div>
            <div style={{fontSize:'10px',color:GOLD,letterSpacing:'2px',fontWeight:700,marginBottom:'8px'}}>NOTAS</div>
            <textarea value={notas} onChange={e=>setNotas(e.target.value)}
              placeholder="Objetivos, acuerdos especiales, información relevante..."
              rows={3}
              style={{width:'100%',padding:'9px 12px',background:c.s2,
              border:`1px solid ${c.border}`,borderRadius:'8px',color:c.text,
              fontSize:'13px',outline:'none',boxSizing:'border-box' as any,
              resize:'vertical',fontFamily:'Rajdhani,sans-serif'}}/>
          </div>
          <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
            <Btn v="outline" t={theme} onClick={()=>setModalNuevoCliente(false)}>Cancelar</Btn>
            <Btn v="primary" t={theme} onClick={guardar}>
              {guardando?'Guardando...':'+ Agregar Cliente'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

  const render=()=>{
    switch(vista){
      case 'dashboard':  return <VDash t={theme} usuario={usuario} irA={irA}/>
      case 'clientes': return <VClientes t={theme} clientes={clientes} setClientes={setClientes}/>
      case 'ceo':        return <VCEO t={theme}/>
      case 'cm':         return <VCM t={theme}/>
      case 'sem':        return <VSEM t={theme}/>
      case 'seo':        return <VSEO t={theme}/>
      case 'calendario': return <Calendario t={theme}/>
      case 'archivos': return <Archivos t={theme}/>
      case 'alertas': return <Alertas t={theme} onActualizar={(n)=>setAlertasNoLeidas(n)} alertasIniciales={alertasData} onCambio={setAlertasData}/>
      case 'ia': return <CerebroIA t={theme}/>
        case 'video': return <VideoEditor t={theme}/>
      default:           return <VDash t={theme} usuario={usuario} irA={irA}/>
    }
  }

  const sb=(key:string):React.CSSProperties=>({
    display:'flex',alignItems:'center',gap:'10px',padding:'9px 14px',borderRadius:'9px',cursor:'pointer',
    color:vista===key?GOLD:c.text3,
    background:vista===key?(theme==='dark'?'#161628':'#e8ecff'):'transparent',
    fontWeight:vista===key?700:500,fontSize:'13px',border:'none',width:'100%',textAlign:'left',marginBottom:'2px',
    fontFamily:'Rajdhani,sans-serif',letterSpacing:'0.3px',
    boxShadow:vista===key?`inset 3px 0 0 ${GOLD}`:'none',transition:'all 0.15s',
  })

  return(
    <div className={theme} style={{minHeight:'100vh',background:c.bg,color:c.text,display:'flex',fontFamily:'Rajdhani,sans-serif',fontSize:'14px'}}>
      {mobile&&menu&&<div onClick={()=>setMenu(false)} style={{position:'fixed',inset:0,background:'#00000070',zIndex:99}}/>}

      {/* SIDEBAR */}
      <aside className={`char-sidebar${menu?' open':''} ${theme}`} style={{
        width:'236px',background:c.surface,borderRight:`1px solid ${c.border}`,
        display:'flex',flexDirection:'column',flexShrink:0,
        position:mobile?'fixed':'sticky',top:0,height:'100vh',zIndex:mobile?100:'auto' as any,
      }}>
        <div style={{padding:'26px 20px 22px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div className="char-logo" style={{width:'32px',height:'32px',background:`linear-gradient(135deg,${GOLD},#7a5010)`,borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>
              {I.bolt}
            </div>
            <div>
              <div style={{fontWeight:800,fontSize:'15px',letterSpacing:'2px',color:c.text}}>CHAR CORE</div>
              <div style={{fontSize:'8px',color:c.muted,letterSpacing:'2.5px',marginTop:'1px'}}>SISTEMA OPERATIVO</div>
            </div>
          </div>
        </div>

        <div style={{height:'1px',background:`linear-gradient(90deg,transparent,${c.border},transparent)`,margin:'0 20px 20px'}}/>

        <nav style={{padding:'0 10px',flex:1,overflowY:'auto'}}>
          <div style={{fontSize:'9px',color:c.muted,letterSpacing:'2.5px',marginBottom:'8px',paddingLeft:'14px',fontWeight:700}}>NAVEGACIÓN</div>
          {NAV.map(k=>(
            <button key={k} className="char-nav" onClick={()=>irA(k)} style={sb(k)}>
              {META[k].icon}{META[k].label}
              {k==='alertas'&&alertasNoLeidas>0&&<span style={{marginLeft:'auto',background:RED,color:'#fff',fontSize:'9px',fontWeight:800,padding:'1px 7px',borderRadius:'10px',boxShadow:`0 0 8px ${RED}80`}}>{alertasNoLeidas}</span>}
            </button>
          ))}

          <div style={{height:'1px',background:`linear-gradient(90deg,transparent,${c.border},transparent)`,margin:'20px 4px 16px'}}/>

          <div style={{fontSize:'9px',color:c.muted,letterSpacing:'2.5px',marginBottom:'8px',paddingLeft:'14px',fontWeight:700}}>PANELES DE ROL</div>
          {ROL.map(k=>(
            <button key={k} className="char-nav" onClick={()=>irA(k)} style={sb(k)}>
              <span style={{width:'6px',height:'6px',borderRadius:'50%',background:vista===k?(RC[k.toUpperCase()]||GOLD):c.muted,flexShrink:0,boxShadow:vista===k?`0 0 6px ${RC[k.toUpperCase()]||GOLD}`:'none',transition:'all 0.15s'}}/>
              {META[k].label}
            </button>
          ))}
        </nav>

        <div style={{padding:'16px 20px',borderTop:`1px solid ${c.border}`}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{width:'30px',height:'30px',background:GOLD+'20',borderRadius:'50%',border:`1px solid ${GOLD}55`,display:'flex',alignItems:'center',justifyContent:'center',color:GOLD,fontWeight:800,fontSize:'12px',boxShadow:`0 0 10px ${GOLD}20`}}>
                {usuario[0]}
              </div>
              <div>
                <div style={{fontSize:'12px',fontWeight:700,color:c.text2}}>{usuario}</div>
                <div style={{fontSize:'10px',color:c.text3}}>Agencia CHAR</div>
              </div>
            </div>
            <div style={{display:'flex',gap:'6px'}}>
              <button onClick={()=>setTheme(theme==='dark'?'light':'dark')} style={{background:c.s2,border:`1px solid ${c.border}`,borderRadius:'7px',padding:'6px',cursor:'pointer',color:c.text2,display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}>
                {theme==='dark'?I.sun:I.moon}
              </button>
              <button onClick={()=>setUsuario(null)} title="Cambiar usuario" style={{background:c.s2,border:`1px solid ${c.border}`,borderRadius:'7px',padding:'6px',cursor:'pointer',color:c.text3,display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}>
                {I.logout}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
        {mobile&&(
          <div style={{padding:'14px 16px',background:c.surface,borderBottom:`1px solid ${c.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:50}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{width:'26px',height:'26px',background:`linear-gradient(135deg,${GOLD},#7a5010)`,borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>{I.bolt}</div>
              <span style={{fontWeight:800,fontSize:'14px',letterSpacing:'1.5px',color:c.text}}>CHAR CORE</span>
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={()=>setTheme(theme==='dark'?'light':'dark')} style={{background:c.s2,border:`1px solid ${c.border}`,borderRadius:'7px',padding:'7px',cursor:'pointer',color:c.text2,display:'flex'}}>{theme==='dark'?I.sun:I.moon}</button>
              <button onClick={()=>setMenu(!menu)} style={{background:c.s2,border:`1px solid ${c.border}`,borderRadius:'7px',padding:'7px',cursor:'pointer',color:c.text2,display:'flex'}}>{menu?I.close:I.menu}</button>
            </div>
          </div>
        )}
        <main className="char-main" style={{flex:1,padding:'44px 52px',overflowY:'auto'}}>
          {render()}
        </main>
      </div>
     {modalNuevoCliente && <ModalNuevoCliente c={c} theme={theme} clientes={clientes} setClientes={setClientes} setModalNuevoCliente={setModalNuevoCliente} COLORES_CLIENTE={COLORES_CLIENTE} sb={supabase}/>}
    </div>
  )
}
