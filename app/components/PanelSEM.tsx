'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

type Theme = 'dark'|'light'
const D = {surface:'#0b0b18',s2:'#111124',border:'#16163a',b2:'#1e1e3a',text:'#f0f0ff',text2:'#9090b8',text3:'#4a4a6a',muted:'#2a2a4a'}
const L = {surface:'#ffffff',s2:'#f4f6ff',border:'#dde0f0',b2:'#c8cbdf',text:'#0d0d20',text2:'#2a2a4a',text3:'#606088',muted:'#9090aa'}
const th = (t:Theme) => t==='dark'?D:L
const GOLD='#c9a96e',GREEN='#3dd68c',BLUE='#4f8fff',RED='#f87171',AMBER='#f59e0b',PURPLE='#a78bfa'

function exportCSV(name:string,headers:string[],rows:(string|number)[][]){
  const sep=';',bom='\uFEFF'
  const content=[headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(sep)).join('\r\n')
  const blob=new Blob([bom+content],{type:'text/csv;charset=utf-8;'})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a');a.href=url;a.download=name+'.csv';a.click()
  URL.revokeObjectURL(url)
}

type EstadoCampana = 'ACTIVA'|'PAUSADA'|'SIN INICIAR'

interface Campana {
  clienteId: string
  clienteNombre: string
  tipo: string
  estado: EstadoCampana
  presupuesto: string
}

const DEFAULTS_SEM=[
  {titulo:'Configurar primeras campañas Google Ads para clientes activos',prioridad:'alta'},
  {titulo:'Definir keywords principales por cliente',prioridad:'alta'},
  {titulo:'Conectar Google Analytics a la app',prioridad:'media'},
  {titulo:'Investigar competencia SEM por cliente',prioridad:'media'},
  {titulo:'Revisar landing pages de cada cliente',prioridad:'normal'},
]

export default function PanelSEM({t,clientes}:{t:Theme,clientes:any[]}){
  const c=th(t)
  const [tareas,setTareas]=useState<{id:string,texto:string,p:string,done:boolean}[]>([])
  const [loading,setLoading]=useState(true)
  const [nueva,setNueva]=useState('')
  const [agregando,setAgregando]=useState(false)

  const estadoColor=(e:EstadoCampana)=>{
    if(e==='ACTIVA') return GREEN
    if(e==='PAUSADA') return AMBER
    return c.text3
  }

  const campanasGeneradas:Campana[]=clientes.map(cl=>({
    clienteId:cl.id,
    clienteNombre:cl.nombre,
    tipo:cl.red==='YouTube'?'YouTube Ads':cl.red==='LinkedIn'?'LinkedIn Ads':'Google Ads',
    estado:'SIN INICIAR' as EstadoCampana,
    presupuesto:cl.presupuesto||'—',
  }))

  useEffect(()=>{cargarTareas()},[])

  const cargarTareas=async()=>{
    setLoading(true)
    const {data,error}=await supabase.from('tareas').select('*').eq('rol','sem').order('created_at',{ascending:true})
    if(!error&&data){
      if(data.length===0){
        const ins=DEFAULTS_SEM.map(x=>({...x,completada:false,rol:'sem'}))
        const {data:d}=await supabase.from('tareas').insert(ins).select()
        if(d) setTareas(d.map((x:any)=>({id:x.id,texto:x.titulo,p:x.prioridad,done:x.completada})))
      } else {
        setTareas(data.map((x:any)=>({id:x.id,texto:x.titulo,p:x.prioridad,done:x.completada})))
      }
    }
    setLoading(false)
  }

  const toggleTarea=async(id:string,done:boolean)=>{
    await supabase.from('tareas').update({completada:!done}).eq('id',id)
    setTareas(prev=>prev.map(t=>t.id===id?{...t,done:!done}:t))
  }

  const agregarTarea=async()=>{
    if(!nueva.trim()) return
    setAgregando(true)
    const {data}=await supabase.from('tareas').insert({titulo:nueva.trim(),prioridad:'normal',completada:false,rol:'sem'}).select().single()
    if(data) setTareas(prev=>[...prev,{id:data.id,texto:data.titulo,p:data.prioridad,done:data.completada}])
    setNueva('')
    setAgregando(false)
  }

  const exp=()=>exportCSV('CHAR_Panel_SEM',
    ['Cliente','Tipo campaña','Estado','Presupuesto','Impresiones','Clics','CTR','CPC','Conversiones','ROAS'],
    campanasGeneradas.map(x=>[x.clienteNombre,x.tipo,x.estado,x.presupuesto,'—','—','—','—','—','—']))

  return(
    <div className="char-fade" style={{display:'grid',gap:'24px'}}>

      <div className="topbar" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
        <div>
          <div style={{fontSize:'9px',color:c.text3,letterSpacing:'3px',fontWeight:700,marginBottom:'4px'}}>SEARCH ENGINE MARKETING</div>
          <h1 style={{fontSize:'28px',fontWeight:800,margin:0,color:c.text}}>Panel SEM</h1>
        </div>
        <button onClick={exp} style={{background:'transparent',color:GOLD,border:`1px solid ${GOLD}55`,borderRadius:'8px',padding:'8px 16px',fontSize:'12px',cursor:'pointer',fontFamily:'Rajdhani,sans-serif',fontWeight:600,letterSpacing:'0.5px'}}>
          ↓ Exportar CSV
        </button>
      </div>

      <div className="g2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>

        <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'14px',padding:'22px'}}>
          <div style={{fontSize:'9px',color:c.text3,letterSpacing:'3px',fontWeight:700,marginBottom:'4px'}}>CAMPAÑAS POR CLIENTE</div>
          <div style={{height:'1px',background:c.border,margin:'10px 0 14px'}}/>
          {campanasGeneradas.length===0
            ?<div style={{color:c.text3,fontSize:'13px',textAlign:'center',padding:'20px 0'}}>Sin clientes cargados</div>
            :campanasGeneradas.map((x,i)=>(
              <div key={i} className="char-row" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 8px',borderRadius:'6px',marginBottom:'2px',transition:'background 0.15s'}}>
                <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                  <div style={{width:'34px',height:'34px',borderRadius:'9px',background:BLUE+'20',border:`1px solid ${BLUE}45`,display:'flex',alignItems:'center',justifyContent:'center',color:BLUE,fontWeight:800,fontSize:'13px',overflow:'hidden'}}>
                    {clientes.find(cl=>cl.id===x.clienteId)?.url_logo
                      ?<img src={clientes.find(cl=>cl.id===x.clienteId)?.url_logo} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      :x.clienteNombre.charAt(0)}
                  </div>
                  <div>
                    <div style={{fontSize:'13px',color:c.text,fontWeight:600}}>{x.clienteNombre}</div>
                    <div style={{fontSize:'11px',color:c.text3}}>{x.tipo} · {x.presupuesto}</div>
                  </div>
                </div>
                <span style={{fontSize:'9px',fontWeight:700,color:estadoColor(x.estado),letterSpacing:'1.5px',background:estadoColor(x.estado)+'15',padding:'2px 9px',borderRadius:'20px',border:`1px solid ${estadoColor(x.estado)}30`}}>
                  {x.estado}
                </span>
              </div>
            ))
          }
        </div>

        <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'14px',padding:'22px'}}>
          <div style={{fontSize:'9px',color:c.text3,letterSpacing:'3px',fontWeight:700,marginBottom:'4px'}}>MÉTRICAS SEM</div>
          <div style={{height:'1px',background:c.border,margin:'10px 0 14px'}}/>
          {[
            ['Campañas activas',String(campanasGeneradas.filter(x=>x.estado==='ACTIVA').length),GREEN],
            ['Campañas pausadas',String(campanasGeneradas.filter(x=>x.estado==='PAUSADA').length),AMBER],
            ['Sin iniciar',String(campanasGeneradas.filter(x=>x.estado==='SIN INICIAR').length),c.text3],
            ['Tareas completadas',String(tareas.filter(x=>x.done).length)+' / '+tareas.length,BLUE],
            ['Impresiones totales','—',BLUE],
            ['Clics totales','—',BLUE],
            ['CTR promedio','—',BLUE],
            ['Costo por clic','—',GOLD],
            ['Conversiones','—',GREEN],
            ['ROAS promedio','—',GREEN],
          ].map(([l,v,col],i)=>(
            <div key={i} className="char-row" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 8px',borderRadius:'6px',transition:'background 0.15s'}}>
              <span style={{fontSize:'13px',color:c.text2}}>{l}</span>
              <span style={{fontSize:'14px',fontWeight:700,color:col as string}}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'14px',padding:'22px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}}>
          <div style={{fontSize:'9px',color:c.text3,letterSpacing:'3px',fontWeight:700}}>TAREAS SEM</div>
          <span style={{fontSize:'11px',color:c.text3}}>{tareas.filter(x=>x.done).length}/{tareas.length} completadas</span>
        </div>
        <div style={{height:'1px',background:c.border,margin:'10px 0 14px'}}/>
        {loading
          ?<div style={{color:c.text3,fontSize:'13px',textAlign:'center',padding:'16px 0'}}>Cargando tareas...</div>
          :tareas.map((x)=>{
            const pc=x.p==='alta'?RED:x.p==='media'?AMBER:c.text3
            return(
              <div key={x.id} className="char-row"
                onClick={()=>toggleTarea(x.id,x.done)}
                style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 8px',borderRadius:'6px',cursor:'pointer',transition:'background 0.15s',marginBottom:'2px'}}>
                <div style={{width:'17px',height:'17px',borderRadius:'5px',border:`1.5px solid ${x.done?GREEN:c.b2}`,background:x.done?GREEN+'25':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.15s'}}>
                  {x.done&&<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span style={{fontSize:'13px',color:x.done?c.text3:c.text2,textDecoration:x.done?'line-through':'none',flex:1,lineHeight:'1.4'}}>{x.texto}</span>
                {x.p!=='normal'&&!x.done&&<span style={{padding:'2px 9px',borderRadius:'20px',background:pc+'18',border:`1px solid ${pc}45`,fontSize:'9px',color:pc,fontWeight:700,letterSpacing:'0.5px'}}>{x.p.toUpperCase()}</span>}
              </div>
            )
          })
        }
        <div style={{display:'flex',gap:'8px',marginTop:'14px'}}>
          <input
            value={nueva}
            onChange={e=>setNueva(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&agregarTarea()}
            placeholder="Nueva tarea SEM..."
            style={{flex:1,background:c.s2,border:`1px solid ${c.border}`,borderRadius:'8px',padding:'9px 12px',color:c.text,fontSize:'13px',fontFamily:'Rajdhani,sans-serif',outline:'none'}}
          />
          <button onClick={agregarTarea} disabled={agregando||!nueva.trim()}
            style={{background:`linear-gradient(135deg,${GOLD},#8b6010)`,color:'#050510',border:'none',borderRadius:'8px',padding:'9px 16px',cursor:'pointer',fontSize:'13px',fontWeight:700,fontFamily:'Rajdhani,sans-serif',opacity:agregando||!nueva.trim()?0.5:1}}>
            + Agregar
          </button>
        </div>
      </div>

    </div>
  )
}
