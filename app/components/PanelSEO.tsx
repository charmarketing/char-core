'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

type Theme = 'dark'|'light'
const D = {surface:'#0b0b18',s2:'#111124',border:'#16163a',b2:'#1e1e3a',text:'#f0f0ff',text2:'#9090b8',text3:'#4a4a6a',muted:'#2a2a4a'}
const L = {surface:'#ffffff',s2:'#f4f6ff',border:'#dde0f0',b2:'#c8cbdf',text:'#0d0d20',text2:'#2a2a4a',text3:'#606088',muted:'#9090aa'}
const th = (t:Theme) => t==='dark'?D:L
const GOLD='#ffcd38',GREEN='#3dd68c',BLUE='#4f8fff',RED='#f87171',AMBER='#f59e0b',PURPLE='#a78bfa'

function exportCSV(name:string,headers:string[],rows:(string|number)[][]){
  const sep=';',bom='\uFEFF'
  const content=[headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(sep)).join('\r\n')
  const blob=new Blob([bom+content],{type:'text/csv;charset=utf-8;'})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a');a.href=url;a.download=name+'.csv';a.click()
  URL.revokeObjectURL(url)
}

const DEFAULTS_SEO=[
  {titulo:'Auditoría SEO inicial para todos los clientes activos',prioridad:'alta'},
  {titulo:'Investigación de keywords por cliente',prioridad:'alta'},
  {titulo:'Optimizar meta descriptions y títulos',prioridad:'media'},
  {titulo:'Instalar Google Search Console en cada cliente',prioridad:'media'},
  {titulo:'Generar reporte mensual de posicionamiento',prioridad:'normal'},
]

export default function PanelSEO({t,clientes}:{t:Theme,clientes:any[]}){
  const c=th(t)
  const [tareas,setTareas]=useState<{id:string,texto:string,p:string,done:boolean}[]>([])
  const [loading,setLoading]=useState(true)
  const [nueva,setNueva]=useState('')
  const [agregando,setAgregando]=useState(false)

  useEffect(()=>{cargarTareas()},[])

  const cargarTareas=async()=>{
    setLoading(true)
    const {data,error}=await supabase.from('tareas').select('*').eq('rol','seo').order('created_at',{ascending:true})
    if(!error&&data){
      if(data.length===0){
        const ins=DEFAULTS_SEO.map(x=>({...x,completada:false,rol:'seo'}))
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
    const {data}=await supabase.from('tareas').insert({titulo:nueva.trim(),prioridad:'normal',completada:false,rol:'seo'}).select().single()
    if(data) setTareas(prev=>[...prev,{id:data.id,texto:data.titulo,p:data.prioridad,done:data.completada}])
    setNueva('')
    setAgregando(false)
  }

  const exp=()=>exportCSV('CHAR_Panel_SEO',
    ['Cliente','Red','Keyword principal','Posición actual','Domain Authority','Backlinks','Tráfico orgánico','Páginas indexadas'],
    clientes.map(cl=>[cl.nombre,cl.red||'—','Sin asignar','—','—','—','—','—']))

  return(
    <div className="char-fade" style={{display:'grid',gap:'24px'}}>

      <div className="topbar" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
        <div>
          <div style={{fontSize:'9px',color:c.text3,letterSpacing:'3px',fontWeight:700,marginBottom:'4px'}}>SEARCH ENGINE OPTIMIZATION</div>
          <h1 style={{fontSize:'28px',fontWeight:800,margin:0,color:c.text}}>Panel SEO</h1>
        </div>
        <button onClick={exp} style={{background:'transparent',color:GOLD,border:`1px solid ${GOLD}55`,borderRadius:'8px',padding:'8px 16px',fontSize:'12px',cursor:'pointer',fontFamily:'Rajdhani,sans-serif',fontWeight:600,letterSpacing:'0.5px'}}>
          ↓ Exportar CSV
        </button>
      </div>

      <div className="g2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>

        <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'14px',padding:'22px'}}>
          <div style={{fontSize:'9px',color:c.text3,letterSpacing:'3px',fontWeight:700,marginBottom:'4px'}}>POSICIONAMIENTO POR CLIENTE</div>
          <div style={{height:'1px',background:c.border,margin:'10px 0 14px'}}/>
          {clientes.length===0
            ?<div style={{color:c.text3,fontSize:'13px',textAlign:'center',padding:'20px 0'}}>Sin clientes cargados</div>
            :clientes.map((cl:any,i:number)=>(
              <div key={cl.id||i} className="char-row" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 8px',borderRadius:'6px',marginBottom:'2px',transition:'background 0.15s'}}>
                <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                  <div style={{width:'34px',height:'34px',borderRadius:'9px',background:PURPLE+'20',border:`1px solid ${PURPLE}45`,display:'flex',alignItems:'center',justifyContent:'center',color:PURPLE,fontWeight:800,fontSize:'13px',overflow:'hidden'}}>
                    {cl.url_logo
                      ?<img src={cl.url_logo} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      :cl.nombre.charAt(0)}
                  </div>
                  <div>
                    <div style={{fontSize:'13px',color:c.text,fontWeight:600}}>{cl.nombre}</div>
                    <div style={{fontSize:'11px',color:c.text3}}>
                      {cl.url_instagram||cl.url_youtube||cl.url_linkedin||cl.url_tiktok||cl.url_facebook
                        ?'Web detectada'
                        :'Sin web asignada'}
                    </div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'11px',color:c.text3,fontWeight:600}}>Keyword</div>
                  <div style={{fontSize:'12px',color:PURPLE,fontWeight:700}}>Sin asignar</div>
                </div>
              </div>
            ))
          }
        </div>

        <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'14px',padding:'22px'}}>
          <div style={{fontSize:'9px',color:c.text3,letterSpacing:'3px',fontWeight:700,marginBottom:'4px'}}>MÉTRICAS SEO</div>
          <div style={{height:'1px',background:c.border,margin:'10px 0 14px'}}/>
          {[
            ['Clientes con SEO activo',String(clientes.length),PURPLE],
            ['Tareas completadas',String(tareas.filter(x=>x.done).length)+' / '+tareas.length,BLUE],
            ['Domain Authority promedio','—',PURPLE],
            ['Backlinks totales','—',BLUE],
            ['Keywords en top 10','—',GREEN],
            ['Tráfico orgánico','—',GREEN],
            ['Páginas indexadas','—',BLUE],
            ['Velocidad promedio','—',AMBER],
            ['Core Web Vitals','—',GREEN],
          ].map(([l,v,col],i)=>(
            <div key={i} className="char-row" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 8px',borderRadius:'6px',transition:'background 0.15s'}}>
              <span style={{fontSize:'13px',color:c.text2}}>{l}</span>
              <span style={{fontSize:'14px',fontWeight:700,color:col as string}}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'14px',padding:'22px'}}>
        <div style={{fontSize:'9px',color:c.text3,letterSpacing:'3px',fontWeight:700,marginBottom:'4px'}}>ESTADO DE AUDITORÍAS</div>
        <div style={{height:'1px',background:c.border,margin:'10px 0 14px'}}/>
        {clientes.length===0
          ?<div style={{color:c.text3,fontSize:'13px',textAlign:'center',padding:'20px 0'}}>Sin clientes cargados</div>
          :clientes.map((cl:any,i:number)=>(
            <div key={cl.id||i} className="char-row" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 8px',borderRadius:'6px',marginBottom:'2px',transition:'background 0.15s'}}>
              <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:AMBER,boxShadow:`0 0 6px ${AMBER}`,flexShrink:0}}/>
                <span style={{fontSize:'13px',color:c.text2,fontWeight:600}}>{cl.nombre}</span>
              </div>
              <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
                <span style={{fontSize:'11px',color:c.text3}}>{cl.red||'Sin red'}</span>
                <span style={{fontSize:'9px',fontWeight:700,color:AMBER,letterSpacing:'1.5px',background:AMBER+'15',padding:'2px 9px',borderRadius:'20px',border:`1px solid ${AMBER}30`}}>
                  PENDIENTE
                </span>
              </div>
            </div>
          ))
        }
      </div>

      <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'14px',padding:'22px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}}>
          <div style={{fontSize:'9px',color:c.text3,letterSpacing:'3px',fontWeight:700}}>TAREAS SEO</div>
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
            placeholder="Nueva tarea SEO..."
            style={{flex:1,background:c.s2,border:`1px solid ${c.border}`,borderRadius:'8px',padding:'9px 12px',color:c.text,fontSize:'13px',fontFamily:'Rajdhani,sans-serif',outline:'none'}}
          />
          <button onClick={agregarTarea} disabled={agregando||!nueva.trim()}
            style={{background:`linear-gradient(135deg,${GOLD},#cc8800)`,color:'#050510',border:'none',borderRadius:'8px',padding:'9px 16px',cursor:'pointer',fontSize:'13px',fontWeight:700,fontFamily:'Rajdhani,sans-serif',opacity:agregando||!nueva.trim()?0.5:1}}>
            + Agregar
          </button>
        </div>
      </div>

    </div>
  )
}
