'use client'
import { useState, useRef } from 'react'

type Theme = 'dark' | 'light'
const D = { bg:'#05050f',surface:'#0b0b18',s2:'#111124',border:'#16163a',b2:'#1e1e3a',text:'#f0f0ff',text2:'#9090b8',text3:'#4a4a6a',muted:'#2a2a4a' }
const L = { bg:'#eef0f8',surface:'#ffffff',s2:'#f4f6ff',border:'#dde0f0',b2:'#c8cbdf',text:'#0d0d20',text2:'#2a2a4a',text3:'#606088',muted:'#9090aa' }
const th = (t:Theme) => t==='dark'?D:L
const GOLD='#c9a96e',BLUE='#4f8fff',GREEN='#3dd68c',RED='#f87171',AMBER='#f59e0b',PURPLE='#a78bfa'

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
function Btn({children,onClick,v='ghost',t,disabled=false}:{children:React.ReactNode;onClick?:()=>void;v?:'primary'|'ghost'|'outline'|'danger';t:Theme;disabled?:boolean}){
  const c=th(t)
  const vs:Record<string,React.CSSProperties>={
    primary:{background:`linear-gradient(135deg,${GOLD},#8b6010)`,color:'#050510',border:'none',fontWeight:700,boxShadow:`0 4px 16px ${GOLD}40`},
    ghost:{background:c.s2,color:c.text2,border:`1px solid ${c.border}`,fontWeight:500},
    outline:{background:'transparent',color:GOLD,border:`1px solid ${GOLD}55`,fontWeight:600},
    danger:{background:'transparent',color:RED,border:`1px solid ${RED}55`,fontWeight:600},
  }
  return(
    <button className="char-btn" onClick={onClick} disabled={disabled} style={{...vs[v],padding:'8px 16px',borderRadius:'8px',fontSize:'12px',cursor:disabled?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:'6px',letterSpacing:'0.3px',transition:'all 0.15s',fontFamily:'Rajdhani,sans-serif',opacity:disabled?0.5:1}}>
      {children}
    </button>
  )
}

const I={
  upload:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  film:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>,
  play:<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  dl:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  bolt:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  check:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  clock:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  share:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  logo:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  sub:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  translate:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/></svg>,
  crop:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>,
}

type EstadoProceso = 'idle'|'subiendo'|'analizando'|'detectando'|'cortando'|'completado'
type Clip = {
  id:number
  titulo:string
  duracion:string
  inicio:string
  score:number
  motivo:string
  cliente:string
}

const CLIPS_DEMO:Clip[] = [
  {id:1,titulo:'Momento viral — Frase clave impactante',duracion:'0:28',inicio:'02:14',score:94,motivo:'Alta energía vocal + pausa dramática detectada',cliente:'Cliente Alfa'},
  {id:2,titulo:'Hook perfecto — Apertura con gancho',duracion:'0:22',inicio:'00:45',score:91,motivo:'Inicio dinámico + cambio de tono emocional',cliente:'Cliente Alfa'},
  {id:3,titulo:'Momento emotivo — Conexión con audiencia',duracion:'0:35',inicio:'08:32',score:87,motivo:'Bajada de ritmo + contenido de alto valor',cliente:'Cliente Alfa'},
  {id:4,titulo:'Dato sorprendente — Estadística impactante',duracion:'0:19',inicio:'15:20',score:82,motivo:'Cambio súbito de energía + reacción notable',cliente:'Cliente Alfa'},
  {id:5,titulo:'Cierre poderoso — Call to action',duracion:'0:31',inicio:'22:05',score:79,motivo:'Ritmo ascendente + conclusión memorable',cliente:'Cliente Alfa'},
]

const PASOS_PROCESO = [
  {id:1,label:'Subiendo video',desc:'Cargando archivo al servidor',icono:I.upload},
  {id:2,label:'Analizando audio',desc:'AssemblyAI detecta momentos clave',icono:I.bolt},
  {id:3,label:'Detectando clips virales',desc:'IA identifica los mejores momentos',icono:I.film},
  {id:4,label:'Cortando a 9:16',desc:'Shotstack renderiza formato vertical',icono:I.crop},
  {id:5,label:'Aplicando logo y subtítulos',desc:'Estampando identidad CHAR',icono:I.logo},
]

function BarraProceso({paso,t}:{paso:number;t:Theme}){
  const c=th(t)
  return(
    <div style={{display:'grid',gap:'12px'}}>
      {PASOS_PROCESO.map((p,i)=>{
        const completado=i+1<paso
        const activo=i+1===paso
        return(
          <div key={p.id} style={{display:'flex',alignItems:'center',gap:'14px',padding:'12px 16px',borderRadius:'10px',background:activo?GOLD+'12':completado?GREEN+'08':c.s2,border:`1px solid ${activo?GOLD+'40':completado?GREEN+'30':c.border}`,transition:'all 0.3s'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'50%',background:activo?`linear-gradient(135deg,${GOLD},#8b6010)`:completado?GREEN+'25':c.s2,border:`1px solid ${activo?GOLD:completado?GREEN:c.border}`,display:'flex',alignItems:'center',justifyContent:'center',color:activo?'#050510':completado?GREEN:c.text3,flexShrink:0,transition:'all 0.3s'}}>
              {completado?I.check:p.icono}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:'13px',fontWeight:700,color:activo?GOLD:completado?GREEN:c.text2}}>{p.label}</div>
              <div style={{fontSize:'11px',color:c.text3}}>{p.desc}</div>
            </div>
            {activo&&(
              <div style={{display:'flex',gap:'3px'}}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{width:'6px',height:'6px',borderRadius:'50%',background:GOLD,animation:`glow 1s ease-in-out ${i*0.2}s infinite`}}/>
                ))}
              </div>
            )}
            {completado&&<div style={{color:GREEN}}>{I.check}</div>}
          </div>
        )
      })}
    </div>
  )
}

function ClipCard({clip,t}:{clip:Clip;t:Theme}){
  const c=th(t)
  const scoreColor=clip.score>=90?GREEN:clip.score>=80?AMBER:RED
  return(
    <Card t={t} style={{padding:'0',overflow:'hidden'}}>
      <div style={{background:`linear-gradient(135deg,#0a0a1a,#111128)`,height:'160px',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',borderBottom:`1px solid ${c.border}`}}>
        <div style={{position:'absolute',top:'10px',left:'10px'}}>
          <Tag label="9:16" color={BLUE}/>
        </div>
        <div style={{position:'absolute',top:'10px',right:'10px'}}>
          <Tag label={`SCORE ${clip.score}`} color={scoreColor}/>
        </div>
        <div style={{width:'48px',height:'48px',borderRadius:'50%',background:GOLD+'25',border:`2px solid ${GOLD}55`,display:'flex',alignItems:'center',justifyContent:'center',color:GOLD,cursor:'pointer',boxShadow:`0 0 20px ${GOLD}30`}}>
          {I.play}
        </div>
        <div style={{position:'absolute',bottom:'10px',left:'10px',fontSize:'11px',color:c.text3,display:'flex',alignItems:'center',gap:'4px'}}>
          {I.clock} {clip.duracion}
        </div>
        <div style={{position:'absolute',bottom:'10px',right:'10px',fontSize:'10px',color:c.text3}}>
          inicio: {clip.inicio}
        </div>
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:'3px',background:`linear-gradient(90deg,${GOLD},${GOLD}00)`}}/>
      </div>
      <div style={{padding:'14px 16px',display:'grid',gap:'10px'}}>
        <div style={{fontSize:'13px',fontWeight:700,color:c.text,lineHeight:'1.3'}}>{clip.titulo}</div>
        <div style={{fontSize:'11px',color:c.text3,lineHeight:'1.5'}}>{clip.motivo}</div>
        <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
          <Tag label="LOGO ✓" color={GOLD}/>
          <Tag label="SUBTÍTULOS ✓" color={PURPLE}/>
          <Tag label="9:16 ✓" color={BLUE}/>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <button className="char-btn" onClick={()=>alert('Descarga real disponible en Módulo 8')} style={{flex:1,background:`linear-gradient(135deg,${GOLD},#8b6010)`,color:'#050510',border:'none',borderRadius:'8px',padding:'8px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',fontSize:'12px',fontWeight:700,fontFamily:'Rajdhani,sans-serif'}}>
            {I.dl} Descargar
          </button>
          <button className="char-btn" onClick={()=>alert('Compartir real disponible en Módulo 8')} style={{background:c.s2,color:c.text2,border:`1px solid ${c.border}`,borderRadius:'8px',padding:'8px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
            {I.share}
          </button>
        </div>
      </div>
    </Card>
  )
}

export default function VideoEditor({t}:{t:Theme}){
  const c=th(t)
  const [estado,setEstado]=useState<EstadoProceso>('idle')
  const [pasoActual,setPasoActual]=useState(0)
  const [dragOver,setDragOver]=useState(false)
  const [videoInfo,setVideoInfo]=useState<{nombre:string;tamaño:string}|null>(null)
  const [clips,setClips]=useState<Clip[]>([])
  const [config,setConfig]=useState({cliente:'Cliente Alfa',clipsCantidad:'5',traducir:false,idioma:'Inglés'})
  const inputRef=useRef<HTMLInputElement>(null)

  const simularProceso=()=>{
    setEstado('subiendo')
    setPasoActual(1)
    const pasos=['subiendo','analizando','detectando','cortando','completado'] as EstadoProceso[]
    pasos.forEach((p,i)=>{
      setTimeout(()=>{
        setEstado(p)
        setPasoActual(i+1)
        if(p==='completado'){
          setClips(CLIPS_DEMO.slice(0,parseInt(config.clipsCantidad)))
        }
      },(i+1)*2000)
    })
  }

  const handleDrop=(e:React.DragEvent)=>{
    e.preventDefault()
    setDragOver(false)
    const file=e.dataTransfer.files[0]
    if(file){
      setVideoInfo({nombre:file.name,tamaño:`${(file.size/1024/1024).toFixed(1)} MB`})
      setEstado('idle')
    }
  }

  const handleFile=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]
    if(file){
      setVideoInfo({nombre:file.name,tamaño:`${(file.size/1024/1024).toFixed(1)} MB`})
      setEstado('idle')
    }
  }

  const inputSt:React.CSSProperties={background:c.s2,color:c.text,border:`1px solid ${c.border}`,borderRadius:'10px',padding:'10px 14px',fontFamily:'Rajdhani,sans-serif',fontSize:'13px',outline:'none',width:'100%'}

  return(
    <div className="char-fade" style={{display:'grid',gap:'28px'}}>

      <div className="topbar" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:'12px'}}>
        <div>
          <Eb text="INTELIGENCIA ARTIFICIAL" t={t}/>
          <h1 style={{fontSize:'28px',fontWeight:800,margin:0,color:c.text}}>Video Editor IA</h1>
          <div style={{fontSize:'12px',color:c.text3,marginTop:'4px'}}>La joya de la corona · AssemblyAI + Shotstack · Se activa en Módulo 8</div>
        </div>
        <Tag label="MODO DEMO — APIS REALES EN M8" color={AMBER}/>
      </div>

      <div className="g4" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px'}}>
        <Card t={t} style={{padding:'18px'}}>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>HORAS AHORRADAS</div>
          <div style={{fontSize:'30px',fontWeight:800,color:GREEN}}>20+</div>
          <div style={{fontSize:'11px',color:c.text3,marginTop:'4px'}}>por semana estimadas</div>
        </Card>
        <Card t={t} style={{padding:'18px'}}>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>CLIPS GENERADOS</div>
          <div style={{fontSize:'30px',fontWeight:800,color:GOLD}}>{clips.length}</div>
          <div style={{fontSize:'11px',color:c.text3,marginTop:'4px'}}>en esta sesión</div>
        </Card>
        <Card t={t} style={{padding:'18px'}}>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>ASSEMBLIAI</div>
          <div style={{fontSize:'13px',fontWeight:700,color:AMBER,marginTop:'4px'}}>Pendiente M8</div>
          <div style={{fontSize:'11px',color:c.text3,marginTop:'4px'}}>\$50 crédito inicial</div>
        </Card>
        <Card t={t} style={{padding:'18px'}}>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>SHOTSTACK</div>
          <div style={{fontSize:'13px',fontWeight:700,color:AMBER,marginTop:'4px'}}>Pendiente M8</div>
          <div style={{fontSize:'11px',color:c.text3,marginTop:'4px'}}>50 renders/mes gratis</div>
        </Card>
      </div>

      <div className="g2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>

        <div style={{display:'grid',gap:'16px'}}>
          <Card t={t}>
            <Eb text="SUBIR VIDEO" t={t}/>
            <h3 style={{fontSize:'16px',fontWeight:700,color:c.text,margin:'0 0 16px'}}>CHAR Session / Podcast</h3>
            <div
              onDrop={handleDrop}
              onDragOver={e=>{e.preventDefault();setDragOver(true)}}
              onDragLeave={()=>setDragOver(false)}
              onClick={()=>inputRef.current?.click()}
              style={{border:`2px dashed ${dragOver?GOLD:videoInfo?GREEN:c.b2}`,borderRadius:'12px',padding:'28px',textAlign:'center',background:dragOver?GOLD+'08':videoInfo?GREEN+'06':c.s2,transition:'all 0.2s',cursor:'pointer'}}
            >
              <div style={{color:videoInfo?GREEN:dragOver?GOLD:c.text3,marginBottom:'10px',display:'flex',justifyContent:'center'}}>{I.upload}</div>
              {videoInfo?(
                <div>
                  <div style={{fontSize:'13px',fontWeight:700,color:GREEN,marginBottom:'4px'}}>{I.check} Video cargado</div>
                  <div style={{fontSize:'12px',color:c.text2,marginBottom:'4px'}}>{videoInfo.nombre}</div>
                  <div style={{fontSize:'11px',color:c.text3}}>{videoInfo.tamaño}</div>
                </div>
              ):(
                <div>
                  <div style={{fontSize:'13px',fontWeight:700,color:dragOver?GOLD:c.text2,marginBottom:'4px'}}>{dragOver?'Soltá para subir':'Arrastrá tu video acá'}</div>
                  <div style={{fontSize:'11px',color:c.text3}}>MP4, MOV, AVI · Máximo 2GB</div>
                </div>
              )}
            </div>
            <input ref={inputRef} type="file" accept="video/*" style={{display:'none'}} onChange={handleFile}/>
          </Card>

          <Card t={t}>
            <Eb text="CONFIGURACIÓN" t={t}/>
            <h3 style={{fontSize:'16px',fontWeight:700,color:c.text,margin:'0 0 16px'}}>Opciones de procesamiento</h3>
            <div style={{display:'grid',gap:'12px'}}>
              <div>
                <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>CLIENTE</div>
                <select value={config.cliente} onChange={e=>setConfig({...config,cliente:e.target.value})} style={inputSt}>
                  <option>Cliente Alfa</option>
                  <option>Cliente Beta</option>
                  <option>Cliente Gamma</option>
                </select>
              </div>
              <div>
                <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>CANTIDAD DE CLIPS A DETECTAR</div>
                <select value={config.clipsCantidad} onChange={e=>setConfig({...config,clipsCantidad:e.target.value})} style={inputSt}>
                  {['3','4','5','6','7','8','9','10'].map(n=><option key={n}>{n} clips</option>)}
                </select>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:c.s2,borderRadius:'10px',border:`1px solid ${c.border}`}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <div style={{color:PURPLE}}>{I.sub}</div>
                  <div>
                    <div style={{fontSize:'13px',fontWeight:700,color:c.text}}>Subtítulos automáticos</div>
                    <div style={{fontSize:'11px',color:c.text3}}>Generados por AssemblyAI</div>
                  </div>
                </div>
                <Tag label="SIEMPRE ACTIVO" color={GREEN}/>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:c.s2,borderRadius:'10px',border:`1px solid ${c.border}`}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <div style={{color:GOLD}}>{I.logo}</div>
                  <div>
                    <div style={{fontSize:'13px',fontWeight:700,color:c.text}}>Logo CHAR automático</div>
                    <div style={{fontSize:'11px',color:c.text3}}>Se estampa en cada clip</div>
                  </div>
                </div>
                <Tag label="SIEMPRE ACTIVO" color={GREEN}/>
              </div>
              <div style={{padding:'12px 14px',background:c.s2,borderRadius:'10px',border:`1px solid ${c.border}`}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:config.traducir?'12px':'0'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <div style={{color:BLUE}}>{I.translate}</div>
                    <div>
                      <div style={{fontSize:'13px',fontWeight:700,color:c.text}}>Traducir audio</div>
                      <div style={{fontSize:'11px',color:c.text3}}>Opcional · AssemblyAI</div>
                    </div>
                  </div>
                  <button onClick={()=>setConfig({...config,traducir:!config.traducir})} style={{background:config.traducir?BLUE+'25':c.s2,color:config.traducir?BLUE:c.text3,border:`1px solid ${config.traducir?BLUE+'55':c.border}`,borderRadius:'20px',padding:'4px 14px',cursor:'pointer',fontSize:'12px',fontWeight:700,fontFamily:'Rajdhani,sans-serif',transition:'all 0.15s'}}>
                    {config.traducir?'ON':'OFF'}
                  </button>
                </div>
                {config.traducir&&(
                  <select value={config.idioma} onChange={e=>setConfig({...config,idioma:e.target.value})} style={inputSt}>
                    {['Inglés','Portugués','Francés','Alemán','Italiano'].map(i=><option key={i}>{i}</option>)}
                  </select>
                )}
              </div>
            </div>
          </Card>

          <Btn v="primary" t={t} onClick={simularProceso} disabled={estado!=='idle'&&estado!=='completado'}>
            {I.bolt} {estado==='completado'?'Procesar otro video':'Detectar clips virales ahora'}
          </Btn>
        </div>

        <div style={{display:'grid',gap:'16px',alignContent:'start'}}>
          {estado==='idle'&&clips.length===0&&(
            <Card t={t} style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'300px',border:`1px dashed ${c.b2}`}}>
              <div style={{color:c.text3,marginBottom:'12px'}}>{I.film}</div>
              <div style={{fontSize:'14px',fontWeight:700,color:c.text3,marginBottom:'6px'}}>Esperando video</div>
              <div style={{fontSize:'12px',color:c.muted,textAlign:'center'}}>Subí un video y configurá las opciones para detectar los clips más virales</div>
            </Card>
          )}

          {estado!=='idle'&&estado!=='completado'&&(
            <Card t={t}>
              <Eb text="PROCESANDO" t={t}/>
              <h3 style={{fontSize:'16px',fontWeight:700,color:c.text,margin:'0 0 16px'}}>Analizando tu video...</h3>
              <BarraProceso paso={pasoActual} t={t}/>
            </Card>
          )}

          {estado==='completado'&&clips.length>0&&(
            <Card t={t} style={{padding:'16px 20px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px'}}>
                <div>
                  <Eb text="PROCESO COMPLETADO" t={t}/>
                  <h3 style={{fontSize:'16px',fontWeight:700,color:GREEN,margin:0}}>{I.check} {clips.length} clips detectados</h3>
                </div>
                <Tag label="LISTOS PARA DESCARGAR" color={GREEN}/>
              </div>
            </Card>
          )}
        </div>
      </div>

      {clips.length>0&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}}>
            <div>
              <Eb text="GALERÍA DE CLIPS" t={t}/>
              <h2 style={{fontSize:'20px',fontWeight:800,color:c.text,margin:0}}>Clips listos para Reels y TikTok</h2>
            </div>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              <Tag label="9:16 VERTICAL" color={BLUE}/>
              <Tag label="LOGO CHAR" color={GOLD}/>
              <Tag label="SUBTÍTULOS" color={PURPLE}/>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'16px'}}>
            {clips.map(clip=>(
              <ClipCard key={clip.id} clip={clip} t={t}/>
            ))}
          </div>
        </div>
      )}

      <Card t={t} style={{padding:'16px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:'13px',fontWeight:700,color:c.text,marginBottom:'4px'}}>¿Cómo va a funcionar en Módulo 8?</div>
            <div style={{fontSize:'12px',color:c.text3}}>AssemblyAI analiza el audio real → Shotstack corta y renderiza → clips listos en minutos</div>
          </div>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
            <Tag label="ASSEMBLIAI — \$50 CRÉDITO INICIAL" color={BLUE}/>
            <Tag label="SHOTSTACK — 50 RENDERS/MES GRATIS" color={GREEN}/>
          </div>
        </div>
      </Card>

    </div>
  )
}
