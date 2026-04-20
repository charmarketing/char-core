'use client'
import { useState } from 'react'

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

export default function PanelSEO({t,clientes}:{t:Theme,clientes:any[]}){
  const c=th(t)

  const [tareas,setTareas]=useState([
    {texto:'Auditoría SEO inicial para todos los clientes activos',p:'alta',done:false},
    {texto:'Investigación de keywords por cliente',p:'alta',done:false},
    {texto:'Optimizar meta descriptions y títulos',p:'media',done:false},
    {texto:'Instalar Google Search Console en cada cliente',p:'media',done:false},
    {texto:'Generar reporte mensual de posicionamiento',p:'normal',done:false},
  ])

  const exp=()=>exportCSV('CHAR_Panel_SEO',
    ['Cliente','Red','Keyword principal','Posición actual','Domain Authority','Backlinks','Tráfico orgánico','Páginas indexadas'],
    clientes.map(cl=>[cl.nombre,cl.red||'—','Sin asignar','—','—','—','—','—']))

  return(
    <div className="char-fade" style={{display:'grid',gap:'24px'}}>

      {/* HEADER */}
      <div className="topbar" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
        <div>
          <div style={{fontSize:'9px',color:c.text3,letterSpacing:'3px',fontWeight:700,marginBottom:'4px'}}>SEARCH ENGINE OPTIMIZATION</div>
          <h1 style={{fontSize:'28px',fontWeight:800,margin:0,color:c.text}}>Panel SEO</h1>
        </div>
        <button onClick={exp} style={{background:'transparent',color:GOLD,border:`1px solid ${GOLD}55`,borderRadius:'8px',padding:'8px 16px',fontSize:'12px',cursor:'pointer',fontFamily:'Rajdhani,sans-serif',fontWeight:600,letterSpacing:'0.5px'}}>
          ↓ Exportar CSV
        </button>
      </div>

      {/* POSICIONAMIENTO + MÉTRICAS */}
      <div className="g2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>

        {/* POSICIONAMIENTO POR CLIENTE */}
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

        {/* MÉTRICAS SEO */}
        <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'14px',padding:'22px'}}>
          <div style={{fontSize:'9px',color:c.text3,letterSpacing:'3px',fontWeight:700,marginBottom:'4px'}}>MÉTRICAS SEO</div>
          <div style={{height:'1px',background:c.border,margin:'10px 0 14px'}}/>
          {[
            ['Clientes con SEO activo',String(clientes.length),PURPLE],
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

      {/* AUDITORÍAS */}
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

      {/* TAREAS */}
      <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'14px',padding:'22px'}}>
        <div style={{fontSize:'9px',color:c.text3,letterSpacing:'3px',fontWeight:700,marginBottom:'4px'}}>TAREAS SEO</div>
        <div style={{height:'1px',background:c.border,margin:'10px 0 14px'}}/>
        {tareas.map((x,i)=>{
          const pc=x.p==='alta'?RED:x.p==='media'?AMBER:c.text3
          return(
            <div key={i} className="char-row"
              onClick={()=>setTareas(prev=>prev.map((tsk,j)=>j===i?{...tsk,done:!tsk.done}:tsk))}
              style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 8px',borderRadius:'6px',cursor:'pointer',transition:'background 0.15s',marginBottom:'2px'}}>
              <div style={{width:'17px',height:'17px',borderRadius:'5px',border:`1.5px solid ${x.done?GREEN:c.b2}`,background:x.done?GREEN+'25':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.15s'}}>
                {x.done&&<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <span style={{fontSize:'13px',color:x.done?c.text3:c.text2,textDecoration:x.done?'line-through':'none',flex:1,lineHeight:'1.4'}}>{x.texto}</span>
              {x.p!=='normal'&&!x.done&&<span style={{padding:'2px 9px',borderRadius:'20px',background:pc+'18',border:`1px solid ${pc}45`,fontSize:'9px',color:pc,fontWeight:700,letterSpacing:'0.5px'}}>{x.p.toUpperCase()}</span>}
            </div>
          )
        })}
      </div>

    </div>
  )
}
