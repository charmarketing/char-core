'use client'
import { useState, useEffect } from 'react'

type Theme = 'dark' | 'light'
const D = { bg:'#05050f',surface:'#0b0b18',s2:'#111124',border:'#16163a',b2:'#1e1e3a',text:'#f0f0ff',text2:'#9090b8',text3:'#4a4a6a',muted:'#2a2a4a' }
const L = { bg:'#eef0f8',surface:'#ffffff',s2:'#f4f6ff',border:'#dde0f0',b2:'#c8cbdf',text:'#0d0d20',text2:'#2a2a4a',text3:'#606088',muted:'#9090aa' }
const th = (t:Theme) => t==='dark'?D:L
const GOLD='#c9a96e',BLUE='#4f8fff',GREEN='#3dd68c',RED='#f87171',AMBER='#f59e0b',PURPLE='#a78bfa'

function exportCSV(name:string,headers:string[],rows:(string|number)[][]){
  const sep=';',bom='\uFEFF'
  const content=[headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(sep)).join('\r\n')
  const blob=new Blob([bom+content],{type:'text/csv;charset=utf-8;'})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a');a.href=url;a.download=name+'.csv';a.click()
  URL.revokeObjectURL(url)
}

function Eb({text,t}:{text:string;t:Theme}){
  return <div style={{fontSize:'9px',color:th(t).text3,letterSpacing:'3px',fontWeight:700,marginBottom:'4px'}}>{text}</div>
}
function Tag({label,color}:{label:string;color:string}){
  return <span style={{padding:'2px 9px',borderRadius:'20px',background:color+'18',border:`1px solid ${color}45`,fontSize:'9px',color,fontWeight:700,letterSpacing:'1px',whiteSpace:'nowrap'}}>{label}</span>
}
function Card({children,style={},t}:{children:React.ReactNode;style?:React.CSSProperties;t:Theme}){
  const c=th(t)
  return(
    <div className={`char-card char-surface ${t}`} style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'14px',padding:'22px',boxShadow:'0 2px 16px #00000015',transition:'border-color 0.2s,box-shadow 0.2s',...style}}>
      {children}
    </div>
  )
}
function Btn({children,onClick,v='ghost',t}:{children:React.ReactNode;onClick?:()=>void;v?:'primary'|'ghost'|'outline'|'danger';t:Theme}){
  const c=th(t)
  const vs:Record<string,React.CSSProperties>={
    primary:{background:`linear-gradient(135deg,${GOLD},#8b6010)`,color:'#050510',border:'none',fontWeight:700,boxShadow:`0 4px 16px ${GOLD}40`},
    ghost:{background:c.s2,color:c.text2,border:`1px solid ${c.border}`,fontWeight:500},
    outline:{background:'transparent',color:GOLD,border:`1px solid ${GOLD}55`,fontWeight:600},
    danger:{background:'transparent',color:RED,border:`1px solid ${RED}55`,fontWeight:600},
  }
  return(
    <button className="char-btn" onClick={onClick} style={{...vs[v],padding:'8px 16px',borderRadius:'8px',fontSize:'12px',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',letterSpacing:'0.3px',transition:'all 0.15s',fontFamily:'Rajdhani,sans-serif'}}>
      {children}
    </button>
  )
}

const I={
  warn:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  info:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  check:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  plus:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  dl:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  trash:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  wa:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.522 5.855L0 24l6.293-1.494A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.659-.5-5.192-1.378l-.371-.22-3.742.888.939-3.62-.242-.383A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>,
}

type Alerta = {
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

const ALERTAS_INICIALES:Alerta[] = []

const ROLES=['CEO','CM','SEM','SEO']
const RC:Record<string,string>={CEO:GOLD,CM:GREEN,SEM:BLUE,SEO:PURPLE}

function tipoColor(tipo:Alerta['tipo']){
  if(tipo==='urgente') return RED
  if(tipo==='atencion') return AMBER
  return BLUE
}
function tipoLabel(tipo:Alerta['tipo']){
  if(tipo==='urgente') return 'URGENTE'
  if(tipo==='atencion') return 'ATENCIÓN'
  return 'INFO'
}
function tipoIcon(tipo:Alerta['tipo']){
  if(tipo==='urgente') return I.warn
  if(tipo==='atencion') return I.warn
  return I.info
}

export default function Alertas({t,onActualizar,alertasIniciales,onCambio,clientes=[]}:{t:Theme;onActualizar?:(n:number)=>void;alertasIniciales?:Alerta[];onCambio?:(a:Alerta[])=>void;clientes?:any[]}){
  const c=th(t)
  const CLIENTES=clientes.map(cl=>cl.nombre)
  const [alertas,setAlertas]=useState<Alerta[]>(alertasIniciales || ALERTAS_INICIALES)
  const [filtro,setFiltro]=useState<'todas'|'urgente'|'atencion'|'info'>('todas')
  const [soloNoLeidas,setSoloNoLeidas]=useState(false)
  const [mostrarForm,setMostrarForm]=useState(false)
  const [nueva,setNueva]=useState({titulo:'',descripcion:'',tipo:'info' as Alerta['tipo'],cliente:clientes[0]?.nombre||'',rol:'CEO'})

const marcarLeida=(id:number)=>{
  const nueva=alertas.map(a=>a.id===id?{...a,leida:true}:a)
  setAlertas(nueva)
  onCambio?.(nueva)
}
const marcarTodasLeidas=()=>{
  const nueva=alertas.map(a=>({...a,leida:true}))
  setAlertas(nueva)
  onCambio?.(nueva)
}
const eliminar=(id:number)=>{
  const nueva=alertas.filter(a=>a.id!==id)
  setAlertas(nueva)
  onCambio?.(nueva)
}

  const crearAlerta=()=>{
    if(!nueva.titulo.trim()) return
    setAlertas(prev=>[{
      id:Date.now(),
      tipo:nueva.tipo,
      titulo:nueva.titulo,
      descripcion:nueva.descripcion,
      cliente:nueva.cliente,
      rol:nueva.rol,
      tiempo:'ahora',
      leida:false,
      origen:'manual',
    },...prev])
    setNueva({titulo:'',descripcion:'',tipo:'info',cliente:'Cliente Alfa',rol:'CEO'})
    setMostrarForm(false)
  }

  const alertasFiltradas=alertas
    .filter(a=>filtro==='todas'||a.tipo===filtro)
    .filter(a=>soloNoLeidas?!a.leida:true)

  const noLeidas=alertas.filter(a=>!a.leida).length
  useEffect(()=>{
  onActualizar?.(alertas.filter(a=>!a.leida).length)
},[alertas])
  const urgentes=alertas.filter(a=>a.tipo==='urgente').length

  const exportar=()=>exportCSV('CHAR_Alertas',
    ['Título','Descripción','Tipo','Cliente','Rol','Tiempo','Estado','Origen'],
    alertas.map(a=>[a.titulo,a.descripcion,tipoLabel(a.tipo),a.cliente,a.rol,a.tiempo,a.leida?'Leída':'No leída',a.origen==='automatica'?'Automática':'Manual'])
  )

  const inputSt:React.CSSProperties={background:c.s2,color:c.text,border:`1px solid ${c.border}`,borderRadius:'10px',padding:'12px 14px',fontFamily:'Rajdhani,sans-serif',fontSize:'14px',outline:'none',width:'100%'}

  return(
    <div className="char-fade" style={{display:'grid',gap:'28px'}}>

      {/* HEADER */}
      <div className="topbar" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:'12px'}}>
        <div>
          <Eb text="SISTEMA DE ALERTAS" t={t}/>
          <h1 style={{fontSize:'28px',fontWeight:800,margin:0,color:c.text}}>Centro de Alertas</h1>
        </div>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
          <Btn v="ghost" t={t} onClick={marcarTodasLeidas}>{I.check} Marcar todas leídas</Btn>
          <Btn v="outline" t={t} onClick={exportar}>{I.dl} Exportar CSV</Btn>
          <Btn v="primary" t={t} onClick={()=>setMostrarForm(!mostrarForm)}>{I.plus} Nueva Alerta</Btn>
        </div>
      </div>

      {/* MÉTRICAS */}
      <div className="g4" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px'}}>
        <Card t={t} style={{padding:'18px'}}>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>TOTAL ALERTAS</div>
          <div style={{fontSize:'30px',fontWeight:800,color:c.text}}>{alertas.length}</div>
        </Card>
        <Card t={t} style={{padding:'18px'}}>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>NO LEÍDAS</div>
          <div style={{fontSize:'30px',fontWeight:800,color:AMBER}}>{noLeidas}</div>
        </Card>
        <Card t={t} style={{padding:'18px'}}>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>URGENTES</div>
          <div style={{fontSize:'30px',fontWeight:800,color:RED}}>{urgentes}</div>
        </Card>
        <Card t={t} style={{padding:'18px',cursor:'pointer'}}>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>WHATSAPP</div>
          <div style={{fontSize:'13px',fontWeight:700,color:GREEN,display:'flex',alignItems:'center',gap:'6px'}}>{I.wa} Activar en M8</div>
        </Card>
      </div>

      {/* SEMÁFORO DE CLIENTES */}
      <Card t={t}>
        <Eb text="SALUD DE CLIENTES" t={t}/>
        <h3 style={{fontSize:'16px',fontWeight:700,color:c.text,margin:'0 0 16px'}}>Semáforo de actividad</h3>
        <div className="g3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px'}}>
        {clientes.length===0
  ?<div style={{fontSize:'13px',color:c.text3,gridColumn:'1/-1',textAlign:'center',padding:'20px'}}>Sin clientes cargados</div>
  :clientes.map((cl:any,i:number)=>{
    const colors=[GOLD,BLUE,PURPLE,GREEN,AMBER]
    const s=cl.horas<24?{c:GREEN,l:'SALUDABLE'}:cl.horas<48?{c:AMBER,l:'ATENCIÓN'}:{c:RED,l:'CRÍTICO'}
    return(
      <div key={i} style={{padding:'16px',borderRadius:'12px',background:c.s2,border:`1px solid ${s.c}40`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
          <div style={{fontWeight:700,color:c.text,fontSize:'14px'}}>{cl.nombre}</div>
          <Tag label={s.l} color={s.c}/>
        </div>
        <div style={{fontSize:'12px',color:c.text3,marginBottom:'8px'}}>Última actividad: <span style={{color:s.c,fontWeight:700}}>{cl.horas}hs atrás</span></div>
        <div style={{height:'4px',background:c.border,borderRadius:'4px'}}>
          <div style={{height:'100%',width:`${Math.max(10,100-cl.horas*2)}%`,background:s.c,borderRadius:'4px',boxShadow:`0 0 8px ${s.c}55`,transition:'width 0.5s'}}/>
        </div>
      </div>
    )
  })
}
        </div>
      </Card>

      {/* FORMULARIO NUEVA ALERTA */}
      {mostrarForm&&(
        <Card t={t}>
          <Eb text="CREAR ALERTA MANUAL" t={t}/>
          <h3 style={{fontSize:'16px',fontWeight:700,color:c.text,margin:'0 0 16px'}}>Nueva alerta</h3>
          <div className="g2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
            <input value={nueva.titulo} onChange={e=>setNueva({...nueva,titulo:e.target.value})} placeholder="Título de la alerta" style={inputSt}/>
            <select value={nueva.tipo} onChange={e=>setNueva({...nueva,tipo:e.target.value as Alerta['tipo']})} style={inputSt}>
              <option value="urgente">Urgente</option>
              <option value="atencion">Atención</option>
              <option value="info">Info</option>
            </select>
            <select value={nueva.cliente} onChange={e=>setNueva({...nueva,cliente:e.target.value})} style={inputSt}>
              {CLIENTES.map(c=><option key={c}>{c}</option>)}
            </select>
            <select value={nueva.rol} onChange={e=>setNueva({...nueva,rol:e.target.value})} style={inputSt}>
              {ROLES.map(r=><option key={r}>{r}</option>)}
            </select>
            <textarea value={nueva.descripcion} onChange={e=>setNueva({...nueva,descripcion:e.target.value})} placeholder="Descripción de la alerta" style={{...inputSt,gridColumn:'1 / -1',resize:'none',height:'80px'}}/>
          </div>
          <div style={{display:'flex',gap:'10px',marginTop:'14px'}}>
            <Btn v="primary" t={t} onClick={crearAlerta}>Crear Alerta</Btn>
            <Btn v="ghost" t={t} onClick={()=>setMostrarForm(false)}>Cancelar</Btn>
          </div>
        </Card>
      )}

      {/* FILTROS */}
      <div style={{display:'flex',gap:'10px',flexWrap:'wrap',alignItems:'center'}}>
        {(['todas','urgente','atencion','info'] as const).map(f=>(
          <button key={f} onClick={()=>setFiltro(f)} className="char-btn" style={{
            background:filtro===f?`linear-gradient(135deg,${GOLD},#8b6010)`:c.s2,
            color:filtro===f?'#050510':c.text2,
            border:filtro===f?'none':`1px solid ${c.border}`,
            borderRadius:'8px',padding:'8px 16px',cursor:'pointer',
            fontSize:'12px',fontWeight:700,fontFamily:'Rajdhani,sans-serif',
            letterSpacing:'0.5px',transition:'all 0.15s',
          }}>
            {f==='todas'?'Todas':f==='urgente'?'Urgentes':f==='atencion'?'Atención':'Info'}
          </button>
        ))}
        <button onClick={()=>setSoloNoLeidas(!soloNoLeidas)} className="char-btn" style={{
          background:soloNoLeidas?AMBER+'25':c.s2,
          color:soloNoLeidas?AMBER:c.text2,
          border:`1px solid ${soloNoLeidas?AMBER+'55':c.border}`,
          borderRadius:'8px',padding:'8px 16px',cursor:'pointer',
          fontSize:'12px',fontWeight:700,fontFamily:'Rajdhani,sans-serif',
          transition:'all 0.15s',
        }}>
          Solo no leídas
        </button>
      </div>

      {/* LISTA DE ALERTAS */}
      <div style={{display:'grid',gap:'12px'}}>
        {alertasFiltradas.length===0&&(
          <Card t={t} style={{textAlign:'center',padding:'40px'}}>
            <div style={{fontSize:'13px',color:c.text3}}>No hay alertas que mostrar</div>
          </Card>
        )}
        {alertasFiltradas.map(a=>(
          <Card key={a.id} t={t} style={{
            padding:'18px',
            borderLeft:`3px solid ${tipoColor(a.tipo)}`,
            opacity:a.leida?0.6:1,
            transition:'opacity 0.2s',
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'14px'}}>
              <div style={{display:'flex',gap:'12px',alignItems:'flex-start',flex:1}}>
                <div style={{color:tipoColor(a.tipo),marginTop:'2px',flexShrink:0}}>{tipoIcon(a.tipo)}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'6px',alignItems:'center'}}>
                    <span style={{fontSize:'14px',fontWeight:700,color:c.text}}>{a.titulo}</span>
                    <Tag label={tipoLabel(a.tipo)} color={tipoColor(a.tipo)}/>
                    <Tag label={a.rol} color={RC[a.rol]||GOLD}/>
                    {a.origen==='manual'&&<Tag label="MANUAL" color={PURPLE}/>}
                    {!a.leida&&<Tag label="NUEVA" color={AMBER}/>}
                  </div>
                  <div style={{fontSize:'12px',color:c.text2,marginBottom:'6px',lineHeight:'1.5'}}>{a.descripcion}</div>
                  <div style={{fontSize:'11px',color:c.text3}}>{a.cliente} · {a.tiempo}</div>
                </div>
              </div>
              <div style={{display:'flex',gap:'8px',flexShrink:0}}>
                {!a.leida&&<Btn v="ghost" t={t} onClick={()=>marcarLeida(a.id)}>{I.check}</Btn>}
                <Btn v="danger" t={t} onClick={()=>eliminar(a.id)}>{I.trash}</Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>

    </div>
  )
}
