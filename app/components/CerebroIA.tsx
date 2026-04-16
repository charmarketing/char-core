'use client'
import { useState, useRef, useEffect } from 'react'

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
function Btn({children,onClick,v='ghost',t,disabled=false}:{children:React.ReactNode;onClick?:()=>void;v?:'primary'|'ghost'|'outline';t:Theme;disabled?:boolean}){
  const c=th(t)
  const vs:Record<string,React.CSSProperties>={
    primary:{background:`linear-gradient(135deg,${GOLD},#8b6010)`,color:'#050510',border:'none',fontWeight:700,boxShadow:`0 4px 16px ${GOLD}40`},
    ghost:{background:c.s2,color:c.text2,border:`1px solid ${c.border}`,fontWeight:500},
    outline:{background:'transparent',color:GOLD,border:`1px solid ${GOLD}55`,fontWeight:600},
  }
  return(
    <button className="char-btn" onClick={onClick} disabled={disabled} style={{...vs[v],padding:'8px 16px',borderRadius:'8px',fontSize:'12px',cursor:disabled?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:'6px',letterSpacing:'0.3px',transition:'all 0.15s',fontFamily:'Rajdhani,sans-serif',opacity:disabled?0.5:1}}>
      {children}
    </button>
  )
}

const I={
  send:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  cpu:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  bolt:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  star:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  news:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>,
  target:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  eye:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  pen:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  save:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  user:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
}

type Mensaje = {
  id:number
  rol:'user'|'ia'
  texto:string
  tiempo:string
}

type Tab = 'chat'|'shadow'|'autopitch'|'sugerencias'|'filosofia'|'blog'

const RESPUESTAS_IA: Record<string,string> = {
  default: 'Entendido. Como parte del equipo CHAR, te recomiendo enfocarte en el contenido cinematográfico que define la identidad de la agencia. ¿En qué aspecto puntual necesitás que profundice?',
  contenido: 'Para maximizar el engagement en redes, recomiendo una estrategia de contenido que combine reels cortos de alto impacto (15-30s) con carruseles educativos. La clave está en el gancho de los primeros 3 segundos. ¿Querés que genere ideas específicas para algún cliente?',
  cliente: 'Analizando el perfil del cliente, sugiero una estrategia en 3 fases: 1) Auditoría de presencia digital actual, 2) Rediseño de identidad visual en redes, 3) Calendario editorial con contenido de alto valor. ¿Arrancamos con la auditoría?',
  instagram: 'Para Instagram en 2026, el algoritmo prioriza: Reels con más del 70% de retención, contenido guardado (saves), y respuestas a stories. Te recomiendo 4-5 posts semanales con al menos 2 Reels. ¿Qué cliente querés trabajar?',
  propuesta: 'Generando propuesta de valor... Para una agencia de marketing cinematográfico como CHAR, los diferenciadores clave son: calidad visual premium, estrategia basada en datos, y automatización de procesos. ¿Para qué industria es el lead?',
  diseño: 'Desde la filosofía CHAR, un buen diseño debe transmitir la esencia cinematográfica de la marca. Verifico: ¿el diseño tiene consistencia cromática con la identidad del cliente? ¿El copy acompaña la imagen? ¿Genera emoción en 3 segundos?',
}

function obtenerRespuesta(texto:string):string{
  const t=texto.toLowerCase()
  if(t.includes('contenido')||t.includes('post')||t.includes('reel')) return RESPUESTAS_IA.contenido
  if(t.includes('cliente')||t.includes('gestión')) return RESPUESTAS_IA.cliente
  if(t.includes('instagram')||t.includes('red social')) return RESPUESTAS_IA.instagram
  if(t.includes('propuesta')||t.includes('pitch')||t.includes('lead')) return RESPUESTAS_IA.propuesta
  if(t.includes('diseño')||t.includes('imagen')||t.includes('visual')) return RESPUESTAS_IA.diseño
  return RESPUESTAS_IA.default
}

const SUGERENCIAS_INICIALES = [
  {cliente:'Cliente Alfa',red:'Instagram',idea:'Reel "Detrás de cámara" mostrando el proceso de producción — alto potencial viral',tipo:'Reel',prioridad:'alta'},
  {cliente:'Cliente Beta',red:'YouTube',idea:'Video tutorial largo explicando el producto — ideal para SEO y autoridad de marca',tipo:'Video',prioridad:'alta'},
  {cliente:'Cliente Gamma',red:'LinkedIn',idea:'Artículo de liderazgo sobre tendencias del sector — genera autoridad B2B',tipo:'Artículo',prioridad:'media'},
  {cliente:'Cliente Alfa',red:'Instagram',idea:'Carrusel "5 razones para elegirnos" con diseño cinematográfico CHAR',tipo:'Carrusel',prioridad:'media'},
  {cliente:'Cliente Gamma',red:'Instagram',idea:'Story encuesta: "¿Qué contenido querés ver?" — aumenta engagement orgánico',tipo:'Story',prioridad:'baja'},
]

const BLOG_NOTICIAS = [
  {titulo:'El algoritmo de Instagram 2026: Todo lo que necesitás saber',fuente:'Social Media Today',tiempo:'hace 2h',resumen:'Instagram ahora prioriza el tiempo de visualización completa en Reels por encima de los likes. Las cuentas con más del 80% de retención tienen 3x más alcance orgánico.'},
  {titulo:'Google Ads lanza IA predictiva para optimización automática de campañas',fuente:'Search Engine Journal',tiempo:'hace 4h',resumen:'La nueva función permite que el sistema ajuste pujas en tiempo real basándose en señales de conversión. Los early adopters reportan un 40% de mejora en ROAS.'},
  {titulo:'TikTok supera a YouTube en tiempo de visualización por sesión en Latinoamérica',fuente:'Marketing Dive',tiempo:'hace 6h',resumen:'El promedio de sesión en TikTok alcanzó los 52 minutos en Argentina y México. Las marcas que migraron contenido tienen un CTR 2.3x superior.'},
  {titulo:'LinkedIn: El contenido de video crece 120% en publicaciones B2B',fuente:'LinkedIn Insights',tiempo:'hace 8h',resumen:'Los videos cortos de 60-90 segundos tienen un alcance 5x mayor que los posts de texto. Las empresas de servicios son las más beneficiadas.'},
]

export default function CerebroIA({t}:{t:Theme}){
  const c=th(t)
  const [tab,setTab]=useState<Tab>('chat')
  const [mensajes,setMensajes]=useState<Mensaje[]>([
    {id:1,rol:'ia',texto:'Hola! Soy el Cerebro IA de CHAR. Estoy entrenado con la filosofía y el estilo de la agencia. Puedo ayudarte con estrategia de contenido, gestión de clientes, ideas para campañas y mucho más. ¿En qué te puedo ayudar hoy?',tiempo:'ahora'},
  ])
  const [input,setInput]=useState('')
  const [escribiendo,setEscribiendo]=useState(false)
  const [filosofia,setFilosofia]=useState('CHAR es una agencia de marketing digital argentina especializada en contenido cinematográfico y estrategia de alto impacto. Nuestra filosofía es que cada pieza de contenido debe contar una historia, generar emoción y convertir. Trabajamos con calidad de producción premium, siempre pensando en el impacto visual y la autenticidad de cada marca.')
  const [editandoFilosofia,setEditandoFilosofia]=useState(false)
  const [shadowTexto,setShadowTexto]=useState('')
  const [shadowRespuesta,setShadowRespuesta]=useState('')
  const [pitchData,setPitchData]=useState({empresa:'',rubro:'',problema:'',red:'Instagram'})
  const [pitchGenerado,setPitchGenerado]=useState('')
  const chatRef=useRef<HTMLDivElement>(null)

  useEffect(()=>{
    if(chatRef.current) chatRef.current.scrollTop=chatRef.current.scrollHeight
  },[mensajes])

  const enviarMensaje=()=>{
    if(!input.trim()) return
    const userMsg:Mensaje={id:Date.now(),rol:'user',texto:input,tiempo:'ahora'}
    setMensajes(prev=>[...prev,userMsg])
    setInput('')
    setEscribiendo(true)
    setTimeout(()=>{
      const respuesta=obtenerRespuesta(input)
      setMensajes(prev=>[...prev,{id:Date.now()+1,rol:'ia',texto:respuesta,tiempo:'ahora'}])
      setEscribiendo(false)
    },1200)
  }

  const analizarShadow=()=>{
    if(!shadowTexto.trim()) return
    setEscribiendo(true)
    setTimeout(()=>{
      setShadowRespuesta('Analizando desde la filosofía CHAR... Este contenido tiene potencial pero le falta el "factor cinematográfico" que nos define. Recomiendo: 1) Mejorar el gancho visual en los primeros 3 segundos, 2) Asegurarte que el copy transmita emoción antes que información, 3) Verificar que la identidad cromática del cliente sea consistente. En escala del 1 al 10: le doy un 7. Con los ajustes llegaría a un 9.')
      setEscribiendo(false)
    },1500)
  }

  const generarPitch=()=>{
    if(!pitchData.empresa.trim()) return
    setEscribiendo(true)
    setTimeout(()=>{
      setPitchGenerado(`PROPUESTA CHAR PARA ${pitchData.empresa.toUpperCase()}

DIAGNÓSTICO INICIAL
Luego de analizar la presencia digital de ${pitchData.empresa} en el sector ${pitchData.rubro||'de su industria'}, identificamos una oportunidad clara de diferenciación a través de contenido cinematográfico de alto impacto.

EL PROBLEMA QUE RESOLVEMOS
${pitchData.problema||'Presencia digital genérica que no conecta emocionalmente con la audiencia objetivo.'}

NUESTRA PROPUESTA DE VALOR
• Rediseño completo de identidad visual en ${pitchData.red}
• Calendario editorial de 30 días con contenido cinematográfico
• 4 Reels de alto impacto mensuales con producción premium
• Estrategia de crecimiento orgánico basada en datos
• Reporte mensual con métricas de performance

POR QUÉ CHAR
Somos la única agencia argentina que combina calidad cinematográfica con estrategia de datos en tiempo real. Nuestros clientes promedian un crecimiento del 300% en engagement en los primeros 90 días.

PRÓXIMO PASO
Una reunión de 30 minutos para mostrarte casos de éxito similares a tu industria.`)
      setEscribiendo(false)
    },2000)
  }

  const tabs:Array<{id:Tab;label:string;icon:JSX.Element}> = [
    {id:'chat',label:'Chat IA',icon:I.cpu},
    {id:'shadow',label:'Shadow',icon:I.eye},
    {id:'autopitch',label:'Auto-Pitch',icon:I.target},
    {id:'sugerencias',label:'Sugerencias',icon:I.star},
    {id:'filosofia',label:'Filosofía',icon:I.pen},
    {id:'blog',label:'Daily Blog',icon:I.news},
  ]

  const inputSt:React.CSSProperties={background:c.s2,color:c.text,border:`1px solid ${c.border}`,borderRadius:'10px',padding:'12px 14px',fontFamily:'Rajdhani,sans-serif',fontSize:'14px',outline:'none',width:'100%'}

  return(
    <div className="char-fade" style={{display:'grid',gap:'28px'}}>

      {/* HEADER */}
      <div className="topbar" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:'12px'}}>
        <div>
          <Eb text="INTELIGENCIA ARTIFICIAL" t={t}/>
          <h1 style={{fontSize:'28px',fontWeight:800,margin:0,color:c.text}}>Cerebro IA</h1>
          <div style={{fontSize:'12px',color:c.text3,marginTop:'4px'}}>Powered by Claude API · Se activa completamente en Módulo 8</div>
        </div>
        <Tag label="MODO DEMO — API REAL EN M8" color={AMBER}/>
      </div>

      {/* TABS */}
      <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
        {tabs.map(tb=>(
          <button key={tb.id} onClick={()=>setTab(tb.id)} className="char-btn" style={{
            background:tab===tb.id?`linear-gradient(135deg,${GOLD},#8b6010)`:c.s2,
            color:tab===tb.id?'#050510':c.text2,
            border:tab===tb.id?'none':`1px solid ${c.border}`,
            borderRadius:'10px',padding:'10px 16px',cursor:'pointer',
            fontSize:'12px',fontWeight:700,fontFamily:'Rajdhani,sans-serif',
            display:'flex',alignItems:'center',gap:'6px',
            transition:'all 0.15s',
          }}>
            {tb.icon}{tb.label}
          </button>
        ))}
      </div>

      {/* CHAT */}
      {tab==='chat'&&(
        <Card t={t} style={{padding:'0',overflow:'hidden'}}>
          <div style={{padding:'18px 22px',borderBottom:`1px solid ${c.border}`,display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{width:'36px',height:'36px',background:`linear-gradient(135deg,${GOLD},#8b6010)`,borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',boxShadow:`0 4px 14px ${GOLD}40`}}>{I.bolt}</div>
            <div>
              <div style={{fontSize:'14px',fontWeight:700,color:c.text}}>CHAR IA</div>
              <div style={{fontSize:'11px',color:GREEN,display:'flex',alignItems:'center',gap:'4px'}}>
                <div style={{width:'6px',height:'6px',borderRadius:'50%',background:GREEN,boxShadow:`0 0 6px ${GREEN}`}}/>
                Activo · Modo demo
              </div>
            </div>
          </div>

          <div ref={chatRef} style={{height:'380px',overflowY:'auto',padding:'20px',display:'grid',gap:'16px',alignContent:'start'}}>
            {mensajes.map(m=>(
              <div key={m.id} style={{display:'flex',gap:'10px',justifyContent:m.rol==='user'?'flex-end':'flex-start'}}>
                {m.rol==='ia'&&(
                  <div style={{width:'30px',height:'30px',background:`linear-gradient(135deg,${GOLD},#8b6010)`,borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',flexShrink:0}}>{I.bolt}</div>
                )}
                <div style={{
                  maxWidth:'75%',padding:'12px 16px',borderRadius:m.rol==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px',
                  background:m.rol==='user'?`linear-gradient(135deg,${GOLD},#8b6010)`:c.s2,
                  color:m.rol==='user'?'#050510':c.text,
                  fontSize:'13px',lineHeight:'1.6',
                  border:m.rol==='ia'?`1px solid ${c.border}`:'none',
                }}>
                  {m.texto}
                </div>
                {m.rol==='user'&&(
                  <div style={{width:'30px',height:'30px',background:c.s2,borderRadius:'8px',border:`1px solid ${c.border}`,display:'flex',alignItems:'center',justifyContent:'center',color:c.text3,flexShrink:0}}>{I.user}</div>
                )}
              </div>
            ))}
            {escribiendo&&tab==='chat'&&(
              <div style={{display:'flex',gap:'10px'}}>
                <div style={{width:'30px',height:'30px',background:`linear-gradient(135deg,${GOLD},#8b6010)`,borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',flexShrink:0}}>{I.bolt}</div>
                <div style={{padding:'12px 16px',borderRadius:'14px 14px 14px 4px',background:c.s2,border:`1px solid ${c.border}`,display:'flex',gap:'4px',alignItems:'center'}}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{width:'6px',height:'6px',borderRadius:'50%',background:GOLD,animation:`glow 1s ease-in-out ${i*0.2}s infinite`}}/>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{padding:'16px 22px',borderTop:`1px solid ${c.border}`,display:'flex',gap:'10px'}}>
            <input
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&enviarMensaje()}
              placeholder="Preguntale algo al Cerebro IA..."
              style={{...inputSt,flex:1}}
            />
            <Btn v="primary" t={t} onClick={enviarMensaje} disabled={escribiendo}>{I.send} Enviar</Btn>
          </div>
        </Card>
      )}

      {/* SHADOW MANAGEMENT */}
      {tab==='shadow'&&(
        <div style={{display:'grid',gap:'16px'}}>
          <Card t={t}>
            <Eb text="SHADOW MANAGEMENT" t={t}/>
            <h3 style={{fontSize:'18px',fontWeight:700,color:c.text,margin:'0 0 8px'}}>¿La agencia aprobaría esto?</h3>
            <div style={{fontSize:'13px',color:c.text2,marginBottom:'20px',lineHeight:'1.6'}}>
              Describí un diseño, copy, idea o estrategia y el Cerebro IA lo analiza desde la filosofía y estilo de CHAR.
            </div>
            <textarea
              value={shadowTexto}
              onChange={e=>setShadowTexto(e.target.value)}
              placeholder="Ej: Quiero publicar un carrusel con fondo blanco y texto negro sobre los beneficios del producto, sin imágenes..."
              style={{...inputSt,height:'120px',resize:'none',marginBottom:'14px'}}
            />
            <Btn v="primary" t={t} onClick={analizarShadow} disabled={escribiendo||!shadowTexto.trim()}>{I.eye} Analizar desde la filosofía CHAR</Btn>
          </Card>

          {shadowRespuesta&&(
            <Card t={t} style={{borderLeft:`3px solid ${GOLD}`}}>
              <Eb text="ANÁLISIS CHAR IA" t={t}/>
              <div style={{fontSize:'13px',color:c.text2,lineHeight:'1.8',marginTop:'8px'}}>{shadowRespuesta}</div>
            </Card>
          )}

          <Card t={t} style={{padding:'16px 20px'}}>
            <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
              {['¿Adri aprobaría este diseño?','¿Esto representa la filosofía CHAR?','¿El copy tiene impacto emocional?','¿La identidad visual es consistente?'].map((s,i)=>(
                <button key={i} onClick={()=>setShadowTexto(s)} className="char-btn" style={{background:c.s2,color:c.text2,border:`1px solid ${c.border}`,borderRadius:'8px',padding:'8px 14px',cursor:'pointer',fontSize:'12px',fontFamily:'Rajdhani,sans-serif'}}>
                  {s}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* AUTO-PITCH */}
      {tab==='autopitch'&&(
        <div style={{display:'grid',gap:'16px'}}>
          <Card t={t}>
            <Eb text="AUTO-PITCH" t={t}/>
            <h3 style={{fontSize:'18px',fontWeight:700,color:c.text,margin:'0 0 8px'}}>Generá una propuesta en segundos</h3>
            <div style={{fontSize:'13px',color:c.text2,marginBottom:'20px',lineHeight:'1.6'}}>
              Completá los datos del lead y el Cerebro IA genera una propuesta profesional lista para enviar.
            </div>
            <div className="g2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'14px'}}>
              <input value={pitchData.empresa} onChange={e=>setPitchData({...pitchData,empresa:e.target.value})} placeholder="Nombre de la empresa / lead" style={inputSt}/>
              <input value={pitchData.rubro} onChange={e=>setPitchData({...pitchData,rubro:e.target.value})} placeholder="Rubro o industria" style={inputSt}/>
              <select value={pitchData.red} onChange={e=>setPitchData({...pitchData,red:e.target.value})} style={inputSt}>
                {['Instagram','YouTube','LinkedIn','TikTok','Meta Ads','Google Ads'].map(r=><option key={r}>{r}</option>)}
              </select>
              <textarea value={pitchData.problema} onChange={e=>setPitchData({...pitchData,problema:e.target.value})} placeholder="¿Cuál es el problema principal del lead? (opcional)" style={{...inputSt,resize:'none',height:'48px'}}/>
            </div>
            <Btn v="primary" t={t} onClick={generarPitch} disabled={escribiendo||!pitchData.empresa.trim()}>{I.target} Generar propuesta ahora</Btn>
          </Card>

          {pitchGenerado&&(
            <Card t={t} style={{borderLeft:`3px solid ${GOLD}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <Eb text="PROPUESTA GENERADA" t={t}/>
                <Tag label="LISTA PARA ENVIAR" color={GREEN}/>
              </div>
              <pre style={{fontSize:'12px',color:c.text2,lineHeight:'1.8',whiteSpace:'pre-wrap',fontFamily:'Rajdhani,sans-serif'}}>{pitchGenerado}</pre>
            </Card>
          )}
        </div>
      )}

      {/* SUGERENCIAS */}
      {tab==='sugerencias'&&(
        <div style={{display:'grid',gap:'14px'}}>
          <Card t={t} style={{padding:'16px 20px'}}>
            <Eb text="IDEAS GENERADAS POR IA" t={t}/>
            <h3 style={{fontSize:'16px',fontWeight:700,color:c.text,margin:'0 0 4px'}}>Sugerencias de contenido</h3>
            <div style={{fontSize:'12px',color:c.text3}}>Basadas en tendencias actuales y el estilo CHAR</div>
          </Card>
          {SUGERENCIAS_INICIALES.map((s,i)=>(
            <Card key={i} t={t} style={{padding:'18px',borderLeft:`3px solid ${s.prioridad==='alta'?RED:s.prioridad==='media'?AMBER:BLUE}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'12px',marginBottom:'8px'}}>
                <div style={{fontSize:'14px',fontWeight:700,color:c.text,lineHeight:'1.4',flex:1}}>{s.idea}</div>
                <Tag label={s.prioridad.toUpperCase()} color={s.prioridad==='alta'?RED:s.prioridad==='media'?AMBER:BLUE}/>
              </div>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                <Tag label={s.cliente.toUpperCase()} color={s.cliente.includes('Alfa')?GOLD:s.cliente.includes('Beta')?BLUE:PURPLE}/>
                <Tag label={s.red.toUpperCase()} color={GREEN}/>
                <Tag label={s.tipo.toUpperCase()} color={PURPLE}/>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* FILOSOFÍA */}
      {tab==='filosofia'&&(
        <Card t={t}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'16px'}}>
            <div>
              <Eb text="ADN DE CHAR" t={t}/>
              <h3 style={{fontSize:'18px',fontWeight:700,color:c.text,margin:0}}>Filosofía de la Agencia</h3>
            </div>
            <Btn v="outline" t={t} onClick={()=>setEditandoFilosofia(!editandoFilosofia)}>{editandoFilosofia?I.save:I.pen} {editandoFilosofia?'Guardar':'Editar'}</Btn>
          </div>
          <div style={{fontSize:'13px',color:c.text2,marginBottom:'16px',lineHeight:'1.6'}}>
            El Cerebro IA aprende de este texto para responder siempre alineado con la identidad y valores de CHAR.
          </div>
          {editandoFilosofia?(
            <textarea
              value={filosofia}
              onChange={e=>setFilosofia(e.target.value)}
              style={{...inputSt,height:'200px',resize:'none'}}
            />
          ):(
            <div style={{background:c.s2,border:`1px solid ${c.border}`,borderRadius:'12px',padding:'18px',fontSize:'13px',color:c.text2,lineHeight:'1.8'}}>
              {filosofia}
            </div>
          )}
          <div style={{marginTop:'16px',display:'flex',gap:'8px',flexWrap:'wrap'}}>
            <Tag label="TONO: PROFESIONAL + CERCANO" color={GOLD}/>
            <Tag label="ESTILO: CINEMATOGRÁFICO" color={PURPLE}/>
            <Tag label="ENFOQUE: ALTO IMPACTO" color={BLUE}/>
            <Tag label="MERCADO: ARGENTINA" color={GREEN}/>
          </div>
        </Card>
      )}

      {/* DAILY BLOG */}
      {tab==='blog'&&(
        <div style={{display:'grid',gap:'14px'}}>
          <Card t={t} style={{padding:'16px 20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px'}}>
              <div>
                <Eb text="INTELIGENCIA DE MERCADO" t={t}/>
                <h3 style={{fontSize:'16px',fontWeight:700,color:c.text,margin:0}}>Marketing Daily Blog</h3>
              </div>
              <Tag label="SCRAPING REAL + IA EN MÓDULO 8" color={AMBER}/>
            </div>
          </Card>
          {BLOG_NOTICIAS.map((n,i)=>(
            <Card key={i} t={t} style={{padding:'18px'}}>
              <div style={{display:'flex',gap:'14px',alignItems:'flex-start'}}>
                <div style={{color:GOLD,flexShrink:0,marginTop:'2px'}}>{I.news}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'14px',fontWeight:700,color:c.text,lineHeight:'1.4',marginBottom:'8px'}}>{n.titulo}</div>
                  <div style={{fontSize:'12px',color:c.text2,lineHeight:'1.7',marginBottom:'10px'}}>{n.resumen}</div>
                  <div style={{fontSize:'11px',color:c.text3}}>{n.fuente} · {n.tiempo}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  )
}
