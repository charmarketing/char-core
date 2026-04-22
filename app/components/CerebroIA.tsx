'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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
  trash:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  copy:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
}

type Mensaje = {id:string;rol:'user'|'ia';texto:string;tiempo:string}
type Tab = 'chat'|'shadow'|'autopitch'|'filosofia'|'blog'

const FILOSOFIAS_DEFAULT:Record<string,{tono:string;estilo:string;publico:string;descripcion:string}> = {
  'CHAR':{
    tono:'Profesional + cercano',
    estilo:'Cinematográfico premium',
    publico:'Agencias y marcas premium',
    descripcion:'CHAR es una agencia de marketing digital argentina especializada en contenido cinematográfico y estrategia de alto impacto. Nuestro diferencial es combinar calidad visual de élite con datos en tiempo real. Somos directos, creativos y siempre orientados a resultados medibles.'
  },
}

const BLOG_NOTICIAS:any[] = []

export default function CerebroIA({t,clientes=[]}:{t:Theme,clientes?:any[]}){
  const c=th(t)
  const clientesNombres=['CHAR',...clientes.filter((cl:any)=>cl.nombre!=='CHAR').map((cl:any)=>cl.nombre)]

  const [tab,setTab]=useState<Tab>('chat')
  const [clienteCtx,setClienteCtx]=useState('CHAR')
  const [mensajes,setMensajes]=useState<Mensaje[]>([
    {id:'init',rol:'ia',texto:'¡Hola! Soy el Cerebro IA de CHAR, potenciado por Google Gemini. Seleccioná un cliente arriba y respondo siempre desde su filosofía. ¿En qué te ayudo hoy?',tiempo:'ahora'},
  ])
  const [input,setInput]=useState('')
  const [escribiendo,setEscribiendo]=useState(false)
  const [filosofias,setFilosofias]=useState<Record<string,any>>(FILOSOFIAS_DEFAULT)
  const [editandoFilosofia,setEditandoFilosofia]=useState(false)
  const [shadowTexto,setShadowTexto]=useState('')
  const [shadowRespuesta,setShadowRespuesta]=useState('')
  const [pitchData,setPitchData]=useState({empresa:'',rubro:'',problema:'',red:'Instagram'})
  const [pitchGenerado,setPitchGenerado]=useState('')
  const [guardando,setGuardando]=useState(false)
  const [noticiasIA,setNoticiasIA]=useState<any[]>([])
const [cargandoNoticias,setCargandoNoticias]=useState(false)
const [blogPosts,setBlogPosts]=useState<any[]>([])
const [mostrarFormPost,setMostrarFormPost]=useState(false)
const [nuevoPost,setNuevoPost]=useState({titulo:'',contenido:'',resumen:'',imagen_url:'',video_url:'',tags:''})
const [guardandoPost,setGuardandoPost]=useState(false)
const [blogTab,setBlogTab]=useState<'feed'|'noticias'|'nuevo'>('feed')
  const chatRef=useRef<HTMLDivElement>(null)

  useEffect(()=>{
    if(chatRef.current) chatRef.current.scrollTop=chatRef.current.scrollHeight
  },[mensajes,escribiendo])
  useEffect(()=>{
  if(tab==='blog'){
    cargarBlogPosts()
    generarNoticiasIA()
  }
},[tab])

const cargarBlogPosts=async()=>{
  const {data}=await supabase.from('blog_posts').select('*').eq('publicado',true).order('created_at',{ascending:false})
  if(data) setBlogPosts(data)
}

const generarNoticiasIA=async()=>{
  if(noticiasIA.length>0) return
  setCargandoNoticias(true)
  try{
    const res=await fetch('/api/blog')
    const data=await res.json()
    if(data.noticias) setNoticiasIA(data.noticias)
  }catch(err){
    console.error('Error noticias IA:',err)
  }
  setCargandoNoticias(false)
}

const publicarPost=async()=>{
  if(!nuevoPost.titulo.trim()||!nuevoPost.contenido.trim()) return
  setGuardandoPost(true)
  try{
    const res=await fetch('/api/blog',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        ...nuevoPost,
        tags:nuevoPost.tags.split(',').map(t=>t.trim()).filter(Boolean),
        autor:'Adri'
      })
    })
    const data=await res.json()
    if(data.post){
      setBlogPosts(prev=>[data.post,...prev])
      setNuevoPost({titulo:'',contenido:'',resumen:'',imagen_url:'',video_url:'',tags:''})
      setBlogTab('feed')
    }
  }catch(err){
    console.error('Error publicar:',err)
  }
  setGuardandoPost(false)
}

  useEffect(()=>{
    cargarFilosofia(clienteCtx)
    cargarHistorial(clienteCtx)
    setShadowRespuesta('')
    setPitchGenerado('')
  },[clienteCtx])

  useEffect(()=>{
    // Inicializar filosofía para clientes reales
    clientes.forEach((cl:any)=>{
      if(!filosofias[cl.nombre]){
        setFilosofias(prev=>({...prev,[cl.nombre]:{
          tono:'Profesional + cercano',
          estilo:'Moderno y dinámico',
          publico:'Audiencia objetivo del cliente',
          descripcion:`${cl.nombre} es un cliente de CHAR. Completá la filosofía de esta marca para que el Cerebro IA responda alineado con su identidad.`
        }}))
      }
    })
  },[clientes])

  const cargarFilosofia=async(nombre:string)=>{
    const {data}=await supabase.from('cerebro_conversaciones')
      .select('texto').eq('cliente',nombre).eq('rol','filosofia').order('created_at',{ascending:false}).limit(1)
    if(data&&data.length>0){
      try{
        const f=JSON.parse(data[0].texto)
        setFilosofias(prev=>({...prev,[nombre]:f}))
      }catch{}
    }
  }

  const cargarHistorial=async(nombre:string)=>{
    const {data}=await supabase.from('cerebro_conversaciones')
      .select('*').eq('cliente',nombre).in('rol',['user','ia']).order('created_at',{ascending:true}).limit(50)
    if(data&&data.length>0){
      setMensajes(data.map((d:any)=>({id:d.id,rol:d.rol,texto:d.texto,tiempo:new Date(d.created_at).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})})))
    } else {
      setMensajes([{id:'init',rol:'ia',texto:`¡Hola! Estoy listo para trabajar en el contexto de ${nombre}. ¿En qué te ayudo?`,tiempo:'ahora'}])
    }
  }

  const guardarMensaje=async(rol:'user'|'ia',texto:string,cliente:string)=>{
    await supabase.from('cerebro_conversaciones').insert({cliente,rol,texto})
  }

  const getFilosofia=(nombre:string)=>filosofias[nombre]||FILOSOFIAS_DEFAULT['CHAR']

  const enviarMensaje=async()=>{
    if(!input.trim()||escribiendo) return
    const texto=input.trim()
    setInput('')

    const userMsg:Mensaje={id:Date.now().toString(),rol:'user',texto,tiempo:'ahora'}
    setMensajes(prev=>[...prev,userMsg])
    await guardarMensaje('user',texto,clienteCtx)
    setEscribiendo(true)

    try{
      const historialReciente=mensajes.slice(-10).filter(m=>m.id!=='init')
      const res=await fetch('/api/chat',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          mensaje:texto,
          cliente:clienteCtx,
          filosofia:getFilosofia(clienteCtx).descripcion,
          historial:historialReciente,
        })
      })
      const data=await res.json()
      if(data.respuesta){
        const iaMsg:Mensaje={id:(Date.now()+1).toString(),rol:'ia',texto:data.respuesta,tiempo:'ahora'}
        setMensajes(prev=>[...prev,iaMsg])
        await guardarMensaje('ia',data.respuesta,clienteCtx)
      } else {
        throw new Error(data.error||'Sin respuesta')
      }
    }catch(err:any){
      setMensajes(prev=>[...prev,{id:(Date.now()+1).toString(),rol:'ia',texto:`Error: ${err.message}. Verificá la API key en Vercel.`,tiempo:'ahora'}])
    }
    setEscribiendo(false)
  }

  const analizarShadow=async()=>{
    if(!shadowTexto.trim()||escribiendo) return
    setEscribiendo(true)
    try{
      const res=await fetch('/api/chat',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          mensaje:`Analizá este contenido desde la filosofía de ${clienteCtx} y decime si representa bien la marca, qué está bien, qué mejorarías y dale una puntuación del 1 al 10:\n\n${shadowTexto}`,
          cliente:clienteCtx,
          filosofia:getFilosofia(clienteCtx).descripcion,
          historial:[],
        })
      })
      const data=await res.json()
      setShadowRespuesta(data.respuesta||'Error al analizar')
    }catch(err:any){
      setShadowRespuesta(`Error: ${err.message}`)
    }
    setEscribiendo(false)
  }

  const generarPitch=async()=>{
    if(!pitchData.empresa.trim()||escribiendo) return
    setEscribiendo(true)
    try{
      const res=await fetch('/api/chat',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          mensaje:`Generá una propuesta comercial profesional y persuasiva de CHAR para esta empresa:
- Empresa: ${pitchData.empresa}
- Rubro: ${pitchData.rubro||'No especificado'}
- Red principal: ${pitchData.red}
- Problema detectado: ${pitchData.problema||'Presencia digital débil'}

La propuesta debe incluir: diagnóstico, propuesta de valor, servicios específicos, por qué CHAR y próximo paso. Formato profesional listo para enviar.`,
          cliente:clienteCtx,
          filosofia:getFilosofia(clienteCtx).descripcion,
          historial:[],
        })
      })
      const data=await res.json()
      setPitchGenerado(data.respuesta||'Error al generar')
    }catch(err:any){
      setPitchGenerado(`Error: ${err.message}`)
    }
    setEscribiendo(false)
  }

  const guardarFilosofia=async()=>{
    setGuardando(true)
    const f=getFilosofia(clienteCtx)
    await supabase.from('cerebro_conversaciones').insert({
      cliente:clienteCtx,
      rol:'filosofia',
      texto:JSON.stringify(f)
    })
    setEditandoFilosofia(false)
    setGuardando(false)
  }

  const limpiarChat=async()=>{
    if(!confirm('¿Limpiar el historial de chat de '+clienteCtx+'?')) return
    await supabase.from('cerebro_conversaciones').delete().eq('cliente',clienteCtx).in('rol',['user','ia'])
    setMensajes([{id:'init',rol:'ia',texto:`Chat limpiado. ¿En qué te ayudo con ${clienteCtx}?`,tiempo:'ahora'}])
  }

  const copiarTexto=(texto:string)=>{
    navigator.clipboard.writeText(texto)
    alert('Copiado ✅')
  }

  const tabs:Array<{id:Tab;label:string;icon:any}> = [
    {id:'chat',label:'Chat IA',icon:I.cpu},
    {id:'shadow',label:'Shadow',icon:I.eye},
    {id:'autopitch',label:'Auto-Pitch',icon:I.target},
    {id:'filosofia',label:'Filosofía',icon:I.pen},
    {id:'blog',label:'Daily Blog',icon:I.news},
  ]

  const inputSt:React.CSSProperties={background:c.s2,color:c.text,border:`1px solid ${c.border}`,borderRadius:'10px',padding:'12px 14px',fontFamily:'Rajdhani,sans-serif',fontSize:'14px',outline:'none',width:'100%'}

  return(
    <div className="char-fade" style={{display:'grid',gap:'28px'}}>

      <div className="topbar" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:'12px',flexWrap:'wrap'}}>
        <div>
          <Eb text="INTELIGENCIA ARTIFICIAL" t={t}/>
          <h1 style={{fontSize:'28px',fontWeight:800,margin:0,color:c.text}}>Cerebro IA</h1>
          <div style={{fontSize:'12px',color:c.text3,marginTop:'4px'}}>Powered by Google Gemini · Gratis · Historial en Supabase</div>
        </div>
        <Tag label="GEMINI ACTIVO ✅" color={GREEN}/>
      </div>

      <Card t={t} style={{padding:'16px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap',justifyContent:'space-between'}}>
          <div>
            <Eb text="CONTEXTO ACTIVO" t={t}/>
            <div style={{fontSize:'13px',color:c.text2,marginTop:'2px'}}>La IA responde desde la filosofía de:</div>
          </div>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
            {clientesNombres.map(cl=>(
              <button key={cl} onClick={()=>setClienteCtx(cl)} className="char-btn" style={{
                background:clienteCtx===cl?`linear-gradient(135deg,${GOLD},#8b6010)`:c.s2,
                color:clienteCtx===cl?'#050510':c.text2,
                border:clienteCtx===cl?'none':`1px solid ${c.border}`,
                borderRadius:'8px',padding:'8px 14px',cursor:'pointer',
                fontSize:'12px',fontWeight:700,fontFamily:'Rajdhani,sans-serif',transition:'all 0.15s',
              }}>{cl}</button>
            ))}
          </div>
        </div>
        <div style={{marginTop:'14px',display:'flex',gap:'8px',flexWrap:'wrap'}}>
          <Tag label={`TONO: ${getFilosofia(clienteCtx).tono?.toUpperCase()}`} color={GOLD}/>
          <Tag label={`ESTILO: ${getFilosofia(clienteCtx).estilo?.toUpperCase()}`} color={PURPLE}/>
          <Tag label={`PÚBLICO: ${getFilosofia(clienteCtx).publico?.toUpperCase()}`} color={BLUE}/>
        </div>
      </Card>

      <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
        {tabs.map(tb=>(
          <button key={tb.id} onClick={()=>setTab(tb.id)} className="char-btn" style={{
            background:tab===tb.id?`linear-gradient(135deg,${GOLD},#8b6010)`:c.s2,
            color:tab===tb.id?'#050510':c.text2,
            border:tab===tb.id?'none':`1px solid ${c.border}`,
            borderRadius:'10px',padding:'10px 16px',cursor:'pointer',
            fontSize:'12px',fontWeight:700,fontFamily:'Rajdhani,sans-serif',
            display:'flex',alignItems:'center',gap:'6px',transition:'all 0.15s',
          }}>
            {tb.icon}{tb.label}
          </button>
        ))}
      </div>

      {tab==='chat'&&(
        <Card t={t} style={{padding:'0',overflow:'hidden'}}>
          <div style={{padding:'18px 22px',borderBottom:`1px solid ${c.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',gap:'10px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{width:'36px',height:'36px',background:`linear-gradient(135deg,${GOLD},#8b6010)`,borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',boxShadow:`0 4px 14px ${GOLD}40`}}>{I.bolt}</div>
              <div>
                <div style={{fontSize:'14px',fontWeight:700,color:c.text}}>CHAR IA — {clienteCtx}</div>
                <div style={{fontSize:'11px',color:GREEN,display:'flex',alignItems:'center',gap:'4px'}}>
                  <div style={{width:'6px',height:'6px',borderRadius:'50%',background:GREEN,boxShadow:`0 0 6px ${GREEN}`}}/>
                  Gemini activo · Historial guardado
                </div>
              </div>
            </div>
            <button onClick={limpiarChat} style={{background:'transparent',color:RED,border:`1px solid ${RED}35`,borderRadius:'8px',padding:'6px 10px',cursor:'pointer',fontSize:'11px',fontFamily:'Rajdhani,sans-serif',display:'flex',alignItems:'center',gap:'4px'}}>
              {I.trash} Limpiar
            </button>
          </div>
          <div ref={chatRef} style={{height:'420px',overflowY:'auto',padding:'20px',display:'grid',gap:'16px',alignContent:'start'}}>
            {mensajes.map(m=>(
              <div key={m.id} style={{display:'flex',gap:'10px',justifyContent:m.rol==='user'?'flex-end':'flex-start',alignItems:'flex-end'}}>
                {m.rol==='ia'&&(
                  <div style={{width:'30px',height:'30px',background:`linear-gradient(135deg,${GOLD},#8b6010)`,borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',flexShrink:0}}>{I.bolt}</div>
                )}
                <div style={{maxWidth:'75%',display:'grid',gap:'4px'}}>
                  <div style={{padding:'12px 16px',borderRadius:m.rol==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px',background:m.rol==='user'?`linear-gradient(135deg,${GOLD},#8b6010)`:c.s2,color:m.rol==='user'?'#050510':c.text,fontSize:'13px',lineHeight:'1.7',border:m.rol==='ia'?`1px solid ${c.border}`:'none',whiteSpace:'pre-wrap'}}>
                    {m.texto}
                  </div>
                  {m.rol==='ia'&&(
                    <button onClick={()=>copiarTexto(m.texto)} style={{background:'transparent',border:'none',color:c.text3,cursor:'pointer',fontSize:'10px',display:'flex',alignItems:'center',gap:'4px',padding:'2px 4px',fontFamily:'Rajdhani,sans-serif'}}>
                      {I.copy} Copiar
                    </button>
                  )}
                </div>
                {m.rol==='user'&&(
                  <div style={{width:'30px',height:'30px',background:c.s2,borderRadius:'8px',border:`1px solid ${c.border}`,display:'flex',alignItems:'center',justifyContent:'center',color:c.text3,flexShrink:0}}>{I.user}</div>
                )}
              </div>
            ))}
            {escribiendo&&tab==='chat'&&(
              <div style={{display:'flex',gap:'10px',alignItems:'flex-end'}}>
                <div style={{width:'30px',height:'30px',background:`linear-gradient(135deg,${GOLD},#8b6010)`,borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',flexShrink:0}}>{I.bolt}</div>
                <div style={{padding:'12px 16px',borderRadius:'14px 14px 14px 4px',background:c.s2,border:`1px solid ${c.border}`,display:'flex',gap:'4px',alignItems:'center'}}>
                  {[0,1,2].map(i=><div key={i} style={{width:'6px',height:'6px',borderRadius:'50%',background:GOLD,animation:`glow 1s ease-in-out ${i*0.2}s infinite`}}/>)}
                </div>
              </div>
            )}
          </div>
          <div style={{padding:'16px 22px',borderTop:`1px solid ${c.border}`,display:'flex',gap:'10px'}}>
            <input
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&enviarMensaje()}
              placeholder={`Preguntale algo sobre ${clienteCtx}...`}
              style={{...inputSt,flex:1}}
              disabled={escribiendo}
            />
            <Btn v="primary" t={t} onClick={enviarMensaje} disabled={escribiendo||!input.trim()}>
              {I.send} Enviar
            </Btn>
          </div>
        </Card>
      )}

      {tab==='shadow'&&(
        <div style={{display:'grid',gap:'16px'}}>
          <Card t={t}>
            <Eb text={`SHADOW — ${clienteCtx.toUpperCase()}`} t={t}/>
            <h3 style={{fontSize:'18px',fontWeight:700,color:c.text,margin:'0 0 8px'}}>¿Esto representa a {clienteCtx}?</h3>
            <div style={{fontSize:'13px',color:c.text2,marginBottom:'20px',lineHeight:'1.6'}}>
              Describí un diseño, copy, idea o estrategia y Gemini lo analiza desde la filosofía de {clienteCtx}.
            </div>
            <textarea
              value={shadowTexto}
              onChange={e=>setShadowTexto(e.target.value)}
              placeholder={`Ej: Quiero publicar un carrusel para ${clienteCtx} con fondo blanco y texto en negro...`}
              style={{...inputSt,height:'140px',resize:'none',marginBottom:'14px'}}
            />
            <Btn v="primary" t={t} onClick={analizarShadow} disabled={escribiendo||!shadowTexto.trim()}>
              {I.eye} Analizar desde filosofía de {clienteCtx}
            </Btn>
          </Card>
          {escribiendo&&tab==='shadow'&&(
            <Card t={t} style={{padding:'20px',textAlign:'center'}}>
              <div style={{display:'flex',gap:'4px',justifyContent:'center',alignItems:'center'}}>
                {[0,1,2].map(i=><div key={i} style={{width:'8px',height:'8px',borderRadius:'50%',background:GOLD,animation:`glow 1s ease-in-out ${i*0.2}s infinite`}}/>)}
                <span style={{marginLeft:'8px',color:c.text3,fontSize:'13px'}}>Analizando...</span>
              </div>
            </Card>
          )}
          {shadowRespuesta&&!escribiendo&&(
            <Card t={t} style={{borderLeft:`3px solid ${GOLD}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                <Eb text="ANÁLISIS GEMINI IA" t={t}/>
                <button onClick={()=>copiarTexto(shadowRespuesta)} style={{background:'transparent',border:'none',color:c.text3,cursor:'pointer',fontSize:'11px',display:'flex',alignItems:'center',gap:'4px',fontFamily:'Rajdhani,sans-serif'}}>
                  {I.copy} Copiar
                </button>
              </div>
              <div style={{fontSize:'13px',color:c.text2,lineHeight:'1.8',whiteSpace:'pre-wrap'}}>{shadowRespuesta}</div>
            </Card>
          )}
        </div>
      )}

      {tab==='autopitch'&&(
        <div style={{display:'grid',gap:'16px'}}>
          <Card t={t}>
            <Eb text="AUTO-PITCH" t={t}/>
            <h3 style={{fontSize:'18px',fontWeight:700,color:c.text,margin:'0 0 8px'}}>Generá una propuesta en segundos</h3>
            <div style={{fontSize:'13px',color:c.text2,marginBottom:'20px',lineHeight:'1.6'}}>
              Completá los datos del lead y Gemini genera una propuesta profesional lista para enviar.
            </div>
            <div className="g2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'14px'}}>
              <input value={pitchData.empresa} onChange={e=>setPitchData({...pitchData,empresa:e.target.value})} placeholder="Nombre de la empresa / lead" style={inputSt}/>
              <input value={pitchData.rubro} onChange={e=>setPitchData({...pitchData,rubro:e.target.value})} placeholder="Rubro o industria" style={inputSt}/>
              <select value={pitchData.red} onChange={e=>setPitchData({...pitchData,red:e.target.value})} style={inputSt}>
                {['Instagram','YouTube','LinkedIn','TikTok','Meta Ads','Google Ads'].map(r=><option key={r}>{r}</option>)}
              </select>
              <textarea value={pitchData.problema} onChange={e=>setPitchData({...pitchData,problema:e.target.value})} placeholder="¿Cuál es el problema principal del lead?" style={{...inputSt,resize:'none',height:'48px'}}/>
            </div>
            <Btn v="primary" t={t} onClick={generarPitch} disabled={escribiendo||!pitchData.empresa.trim()}>
              {I.target} Generar propuesta ahora
            </Btn>
          </Card>
          {escribiendo&&tab==='autopitch'&&(
            <Card t={t} style={{padding:'20px',textAlign:'center'}}>
              <div style={{display:'flex',gap:'4px',justifyContent:'center',alignItems:'center'}}>
                {[0,1,2].map(i=><div key={i} style={{width:'8px',height:'8px',borderRadius:'50%',background:GOLD,animation:`glow 1s ease-in-out ${i*0.2}s infinite`}}/>)}
                <span style={{marginLeft:'8px',color:c.text3,fontSize:'13px'}}>Generando propuesta...</span>
              </div>
            </Card>
          )}
          {pitchGenerado&&!escribiendo&&(
            <Card t={t} style={{borderLeft:`3px solid ${GOLD}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}}>
                <div>
                  <Eb text="PROPUESTA GENERADA POR GEMINI" t={t}/>
                  <Tag label="LISTA PARA ENVIAR" color={GREEN}/>
                </div>
                <button onClick={()=>copiarTexto(pitchGenerado)} style={{background:GOLD+'20',color:GOLD,border:`1px solid ${GOLD}55`,borderRadius:'8px',padding:'6px 12px',cursor:'pointer',fontSize:'12px',fontFamily:'Rajdhani,sans-serif',fontWeight:700,display:'flex',alignItems:'center',gap:'6px'}}>
                  {I.copy} Copiar propuesta
                </button>
              </div>
              <div style={{fontSize:'13px',color:c.text2,lineHeight:'1.8',whiteSpace:'pre-wrap'}}>{pitchGenerado}</div>
            </Card>
          )}
        </div>
      )}

      {tab==='filosofia'&&(
        <Card t={t}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}}>
            <div>
              <Eb text={`ADN DE ${clienteCtx.toUpperCase()}`} t={t}/>
              <h3 style={{fontSize:'18px',fontWeight:700,color:c.text,margin:0}}>Filosofía de {clienteCtx}</h3>
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              {editandoFilosofia&&(
                <Btn v="primary" t={t} onClick={guardarFilosofia} disabled={guardando}>
                  {I.save} {guardando?'Guardando...':'Guardar en Supabase'}
                </Btn>
              )}
              <Btn v="outline" t={t} onClick={()=>setEditandoFilosofia(!editandoFilosofia)}>
                {editandoFilosofia?'Cancelar':(<>{I.pen} Editar</>)}
              </Btn>
            </div>
          </div>
          <div style={{fontSize:'13px',color:c.text2,marginBottom:'16px',lineHeight:'1.6'}}>
            Gemini aprende de este texto para responder siempre alineado con la identidad de {clienteCtx}.
          </div>
          <div style={{display:'grid',gap:'12px',marginBottom:'16px'}}>
            {(['tono','estilo','publico'] as const).map(campo=>(
              <div key={campo}>
                <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>{campo.toUpperCase()}</div>
                {editandoFilosofia?(
                  <input
                    value={getFilosofia(clienteCtx)[campo]||''}
                    onChange={e=>setFilosofias(prev=>({...prev,[clienteCtx]:{...getFilosofia(clienteCtx),[campo]:e.target.value}}))}
                    style={inputSt}
                  />
                ):(
                  <div style={{background:c.s2,border:`1px solid ${c.border}`,borderRadius:'8px',padding:'10px 14px',fontSize:'13px',color:c.text2}}>
                    {getFilosofia(clienteCtx)[campo]||'—'}
                  </div>
                )}
              </div>
            ))}
            <div>
              <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>DESCRIPCIÓN COMPLETA</div>
              {editandoFilosofia?(
                <textarea
                  value={getFilosofia(clienteCtx).descripcion||''}
                  onChange={e=>setFilosofias(prev=>({...prev,[clienteCtx]:{...getFilosofia(clienteCtx),descripcion:e.target.value}}))}
                  style={{...inputSt,height:'160px',resize:'none'}}
                />
              ):(
                <div style={{background:c.s2,border:`1px solid ${c.border}`,borderRadius:'12px',padding:'18px',fontSize:'13px',color:c.text2,lineHeight:'1.8'}}>
                  {getFilosofia(clienteCtx).descripcion||'—'}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

    {tab==='blog'&&(
  <div style={{display:'grid',gap:'16px'}}>

    <Card t={t} style={{padding:'16px 20px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px'}}>
        <div>
          <Eb text="CHAR MEDIA" t={t}/>
          <h3 style={{fontSize:'18px',fontWeight:700,color:c.text,margin:0}}>Daily Blog</h3>
          <div style={{fontSize:'12px',color:c.text3,marginTop:'4px'}}>Posts de CHAR + Noticias IA en tiempo real</div>
        </div>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
          <Tag label="GEMINI ACTIVO ✅" color={GREEN}/>
          <a href="/blog" target="_blank" style={{padding:'6px 12px',borderRadius:'8px',background:BLUE+'20',color:BLUE,border:`1px solid ${BLUE}55`,fontSize:'11px',fontWeight:700,textDecoration:'none',letterSpacing:'0.5px'}}>
            🌐 VER BLOG PÚBLICO
          </a>
        </div>
      </div>
    </Card>

    <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
      {([
        {id:'feed',label:'📋 Posts de CHAR'},
        {id:'noticias',label:'🤖 Noticias IA'},
        {id:'nuevo',label:'✏️ Nuevo Post'},
      ] as const).map(bt=>(
        <button key={bt.id} onClick={()=>setBlogTab(bt.id)} className="char-btn" style={{
          background:blogTab===bt.id?`linear-gradient(135deg,${GOLD},#8b6010)`:c.s2,
          color:blogTab===bt.id?'#050510':c.text2,
          border:blogTab===bt.id?'none':`1px solid ${c.border}`,
          borderRadius:'10px',padding:'8px 16px',cursor:'pointer',
          fontSize:'12px',fontWeight:700,fontFamily:'Rajdhani,sans-serif',transition:'all 0.15s',
        }}>{bt.label}</button>
      ))}
    </div>

    {blogTab==='feed'&&(
      <div style={{display:'grid',gap:'14px'}}>
        {blogPosts.length===0&&(
          <Card t={t} style={{textAlign:'center',padding:'40px'}}>
            <div style={{fontSize:'32px',marginBottom:'12px'}}>✏️</div>
            <div style={{color:c.text2,fontSize:'14px',marginBottom:'16px'}}>Todavía no hay posts publicados.</div>
            <Btn v="primary" t={t} onClick={()=>setBlogTab('nuevo')}>Crear primer post</Btn>
          </Card>
        )}
        {blogPosts.map((post:any)=>(
          <Card key={post.id} t={t} style={{padding:'20px'}}>
            {post.imagen_url&&(
              <img src={post.imagen_url} alt={post.titulo} style={{width:'100%',borderRadius:'10px',marginBottom:'14px',maxHeight:'300px',objectFit:'cover'}}/>
            )}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px',flexWrap:'wrap',gap:'8px'}}>
              <div style={{fontSize:'16px',fontWeight:700,color:c.text,lineHeight:'1.4',flex:1}}>{post.titulo}</div>
              <Tag label="CHAR" color={GOLD}/>
            </div>
            {post.resumen&&<div style={{fontSize:'13px',color:GOLD,marginBottom:'10px',fontStyle:'italic'}}>{post.resumen}</div>}
            <div style={{fontSize:'13px',color:c.text2,lineHeight:'1.8',marginBottom:'14px',whiteSpace:'pre-wrap'}}>{post.contenido}</div>
            {post.video_url&&(
              <div style={{marginBottom:'14px'}}>
                <a href={post.video_url} target="_blank" style={{color:BLUE,fontSize:'12px',textDecoration:'none'}}>▶ Ver video</a>
              </div>
            )}
            {post.tags&&post.tags.length>0&&(
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'14px'}}>
                {post.tags.map((tag:string,i:number)=>(
                  <Tag key={i} label={`#${tag}`} color={PURPLE}/>
                ))}
              </div>
            )}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'12px',borderTop:`1px solid ${c.border}`,flexWrap:'wrap',gap:'8px'}}>
              <div style={{fontSize:'11px',color:c.text3}}>
                Por {post.autor} · {new Date(post.created_at).toLocaleDateString('es-AR')}
              </div>
              <div style={{display:'flex',gap:'8px'}}>
                <button onClick={()=>copiarTexto(`${post.titulo}\n\n${post.contenido}`)} style={{background:'transparent',color:c.text3,border:`1px solid ${c.border}`,borderRadius:'6px',padding:'4px 10px',cursor:'pointer',fontSize:'11px',fontFamily:'Rajdhani,sans-serif',display:'flex',alignItems:'center',gap:'4px'}}>
                  {I.copy} Copiar
                </button>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://project-gpu0d.vercel.app/blog')}`} target="_blank" style={{background:BLUE+'20',color:BLUE,border:`1px solid ${BLUE}55`,borderRadius:'6px',padding:'4px 10px',fontSize:'11px',fontWeight:700,textDecoration:'none',fontFamily:'Rajdhani,sans-serif'}}>
                  LinkedIn
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.titulo)}&url=${encodeURIComponent('https://project-gpu0d.vercel.app/blog')}`} target="_blank" style={{background:PURPLE+'20',color:PURPLE,border:`1px solid ${PURPLE}55`,borderRadius:'6px',padding:'4px 10px',fontSize:'11px',fontWeight:700,textDecoration:'none',fontFamily:'Rajdhani,sans-serif'}}>
                  X/Twitter
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )}

    {blogTab==='noticias'&&(
      <div style={{display:'grid',gap:'14px'}}>
        {cargandoNoticias&&(
          <Card t={t} style={{textAlign:'center',padding:'40px'}}>
            <div style={{display:'flex',gap:'4px',justifyContent:'center',alignItems:'center'}}>
              {[0,1,2].map(i=><div key={i} style={{width:'8px',height:'8px',borderRadius:'50%',background:GOLD,animation:`glow 1s ease-in-out ${i*0.2}s infinite`}}/>)}
              <span style={{marginLeft:'8px',color:c.text3,fontSize:'13px'}}>Gemini generando noticias...</span>
            </div>
          </Card>
        )}
        {!cargandoNoticias&&noticiasIA.length===0&&(
          <Card t={t} style={{textAlign:'center',padding:'40px'}}>
            <div style={{color:c.text2,fontSize:'14px',marginBottom:'16px'}}>No se pudieron cargar las noticias.</div>
            <Btn v="outline" t={t} onClick={()=>{setNoticiasIA([]);generarNoticiasIA()}}>Reintentar</Btn>
          </Card>
        )}
        {noticiasIA.map((n:any,i:number)=>(
          <Card key={i} t={t} style={{padding:'18px'}}>
            <div style={{display:'flex',gap:'14px',alignItems:'flex-start'}}>
              <div style={{color:GOLD,flexShrink:0,marginTop:'2px'}}>{I.news}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'8px',marginBottom:'8px',flexWrap:'wrap'}}>
                  <div style={{fontSize:'14px',fontWeight:700,color:c.text,lineHeight:'1.4',flex:1}}>{n.titulo}</div>
                  <Tag label={n.categoria||'Marketing'} color={BLUE}/>
                </div>
                <div style={{fontSize:'12px',color:c.text2,lineHeight:'1.7',marginBottom:'10px'}}>{n.resumen}</div>
                <div style={{fontSize:'11px',color:c.text3}}>{n.fuente} · Generado por Gemini hoy</div>
              </div>
            </div>
          </Card>
        ))}
        <div style={{textAlign:'center'}}>
          <Btn v="outline" t={t} onClick={()=>{setNoticiasIA([]);generarNoticiasIA()}}>
            🔄 Regenerar noticias
          </Btn>
        </div>
      </div>
    )}

    {blogTab==='nuevo'&&(
      <Card t={t}>
        <Eb text="NUEVO POST" t={t}/>
        <h3 style={{fontSize:'18px',fontWeight:700,color:c.text,margin:'0 0 20px'}}>Publicar en el Blog de CHAR</h3>
        <div style={{display:'grid',gap:'14px'}}>
          <div>
            <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>TÍTULO *</div>
            <input value={nuevoPost.titulo} onChange={e=>setNuevoPost({...nuevoPost,titulo:e.target.value})} placeholder="Título del post..." style={inputSt}/>
          </div>
          <div>
            <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>RESUMEN (opcional)</div>
            <input value={nuevoPost.resumen} onChange={e=>setNuevoPost({...nuevoPost,resumen:e.target.value})} placeholder="Una línea que describe el post..." style={inputSt}/>
          </div>
          <div>
            <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>CONTENIDO *</div>
            <textarea value={nuevoPost.contenido} onChange={e=>setNuevoPost({...nuevoPost,contenido:e.target.value})} placeholder="Escribí tu post acá..." style={{...inputSt,height:'200px',resize:'none'}}/>
          </div>
          <div>
            <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>URL DE IMAGEN (opcional)</div>
            <input value={nuevoPost.imagen_url} onChange={e=>setNuevoPost({...nuevoPost,imagen_url:e.target.value})} placeholder="https://..." style={inputSt}/>
          </div>
          <div>
            <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>URL DE VIDEO (opcional)</div>
            <input value={nuevoPost.video_url} onChange={e=>setNuevoPost({...nuevoPost,video_url:e.target.value})} placeholder="https://youtube.com/..." style={inputSt}/>
          </div>
          <div>
            <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>TAGS (separados por coma)</div>
            <input value={nuevoPost.tags} onChange={e=>setNuevoPost({...nuevoPost,tags:e.target.value})} placeholder="marketing, instagram, ia..." style={inputSt}/>
          </div>
          <div style={{display:'flex',gap:'10px',justifyContent:'flex-end',marginTop:'8px'}}>
            <Btn v="ghost" t={t} onClick={()=>setBlogTab('feed')}>Cancelar</Btn>
            <Btn v="primary" t={t} onClick={publicarPost} disabled={guardandoPost||!nuevoPost.titulo.trim()||!nuevoPost.contenido.trim()}>
              {I.save} {guardandoPost?'Publicando...':'Publicar Post'}
            </Btn>
          </div>
        </div>
      </Card>
    )}

  </div>
)}

    </div>
  )
}
