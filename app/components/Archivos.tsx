'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

type Theme = 'dark' | 'light'
const D = { bg:'#05050f',surface:'#0b0b18',s2:'#111124',border:'#16163a',b2:'#1e1e3a',text:'#f0f0ff',text2:'#9090b8',text3:'#4a4a6a',muted:'#2a2a4a' }
const L = { bg:'#eef0f8',surface:'#ffffff',s2:'#f4f6ff',border:'#dde0f0',b2:'#c8cbdf',text:'#0d0d20',text2:'#2a2a4a',text3:'#606088',muted:'#9090aa' }
const th = (t:Theme) => t==='dark'?D:L
const GOLD='#ffcd38',BLUE='#4f8fff',GREEN='#3dd68c',RED='#f87171',AMBER='#f59e0b',PURPLE='#a78bfa',PINK='#ec4899'

function Eb({text,t}:{text:string;t:Theme}){
  return <div style={{fontSize:'9px',color:th(t).text3,letterSpacing:'3px',fontWeight:700,marginBottom:'4px'}}>{text}</div>
}
function Tag({label,color}:{label:string;color:string}){
  return <span style={{padding:'2px 9px',borderRadius:'20px',background:color+'18',border:`1px solid ${color}45`,fontSize:'9px',color,fontWeight:700,letterSpacing:'1px',whiteSpace:'nowrap'}}>{label}</span>
}
function Card({children,style={},t}:{children:React.ReactNode;style?:React.CSSProperties;t:Theme}){
  const c=th(t)
  return(
    <div className={`char-card char-surface ${t}`} style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'14px',padding:'22px',boxShadow:'0 2px 16px #00000015',...style}}>
      {children}
    </div>
  )
}

const I={
  folder:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  image:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  video:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  audio:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  doc:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  design:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>,
  upload:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  link:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  grid:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  list:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  dl:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  trash:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  share:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  close:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  play:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  drive:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 21L1.5 15.5L8 4h8l-3 5.5H7L4.5 21zm15 0l-5-9h6.5L24 18.5 19.5 21zM9 21l5-9 5 9H9z" fill="#4f8fff"/></svg>,
}

type TipoArchivo='Video'|'Foto'|'Diseño'|'Documento'|'Audio'|'Logo'|'Otro'

type ArchivoStorage={
  id:string; nombre:string; tipo:TipoArchivo; cliente:string
  fecha:string; tamaño:string; extension:string; path:string
  fuente:'storage'
}
type ArchivoLink={
  id:string; nombre:string; tipo:TipoArchivo; cliente:string
  fecha:string; tamaño:string; url:string; descripcion:string
  fuente:'link'
}
type Archivo=ArchivoStorage|ArchivoLink

const extATipo=(ext:string):TipoArchivo=>{
  const e=ext.toLowerCase()
  if(['mp4','mov','avi','mkv','webm'].includes(e)) return 'Video'
  if(['jpg','jpeg','png','gif','webp','heic'].includes(e)) return 'Foto'
  if(['mp3','wav','aac','m4a'].includes(e)) return 'Audio'
  if(['pdf','doc','docx','txt','xls','xlsx','ppt','pptx'].includes(e)) return 'Documento'
  if(['psd','ai','fig','sketch','xd'].includes(e)) return 'Diseño'
  if(['svg'].includes(e)) return 'Logo'
  return 'Otro'
}
const fmtBytes=(b:number)=>{
  if(b<1024) return b+' B'
  if(b<1024*1024) return (b/1024).toFixed(1)+' KB'
  return (b/1024/1024).toFixed(1)+' MB'
}
const tipoColor=(tipo:TipoArchivo)=>{
  const map:Record<TipoArchivo,string>={Video:BLUE,Foto:GREEN,Diseño:PURPLE,Documento:GOLD,Audio:PINK,Logo:RED,Otro:AMBER}
  return map[tipo]||GOLD
}
const tipoIcon=(tipo:TipoArchivo)=>{
  if(tipo==='Video') return I.video
  if(tipo==='Foto') return I.image
  if(tipo==='Audio') return I.audio
  if(tipo==='Documento') return I.doc
  return I.design
}
const TIPOS:TipoArchivo[]=['Video','Foto','Diseño','Documento','Audio','Logo','Otro']
const TIPOS_LINK:TipoArchivo[]=['Video','Foto','Diseño','Documento','Audio','Otro']

export default function Archivos({t,clientes=[]}:{t:Theme,clientes:any[]}){
  const c=th(t)
  const CLIENTES_NOMBRES=clientes.map(cl=>cl.nombre)
  const clienteColor=(nombre:string)=>{
    const colors=[GOLD,BLUE,PURPLE,GREEN,AMBER]
    const idx=clientes.findIndex(cl=>cl.nombre===nombre)
    return colors[idx>=0?idx%colors.length:0]
  }

  const [archivos,setArchivos]=useState<Archivo[]>([])
  const [loading,setLoading]=useState(true)
  const [subiendo,setSubiendo]=useState(false)
  const [vistaGrid,setVistaGrid]=useState(true)
  const [filtroCliente,setFiltroCliente]=useState('Todos')
  const [filtroTipo,setFiltroTipo]=useState('Todos')
  const [dragOver,setDragOver]=useState(false)

  // Modal subir archivo
  const [modalSubir,setModalSubir]=useState(false)
  const [archivosPendientes,setArchivosPendientes]=useState<File[]>([])
  const [clienteUpload,setClienteUpload]=useState('')

  // Modal agregar link
  const [modalLink,setModalLink]=useState(false)
  const [linkNombre,setLinkNombre]=useState('')
  const [linkUrl,setLinkUrl]=useState('')
  const [linkTipo,setLinkTipo]=useState<TipoArchivo>('Video')
  const [linkCliente,setLinkCliente]=useState('')
  const [linkDesc,setLinkDesc]=useState('')
  const [linkTamaño,setLinkTamaño]=useState('')
  const [guardandoLink,setGuardandoLink]=useState(false)

  const inputRef=useRef<HTMLInputElement>(null)

  useEffect(()=>{
    if(clientes.length>0){
      setClienteUpload(clientes[0].nombre)
      setLinkCliente(clientes[0].nombre)
      cargarTodo()
    } else {
      setLoading(false)
    }
  },[clientes])

  const cargarTodo=async()=>{
    setLoading(true)
    const todos:Archivo[]=[]

    // 1 — Cargar desde Supabase Storage
    for(const cliente of clientes){
      const carpeta=cliente.nombre.replace(/\s+/g,'_')
      const {data,error}=await supabase.storage.from('archivos').list(carpeta,{limit:200})
      if(!error&&data){
        data.forEach(file=>{
          if(file.name==='.emptyFolderPlaceholder') return
          const partes=file.name.split('.')
          const ext=partes.length>1?partes[partes.length-1]:'otro'
          const nombreLimpio=partes.slice(0,-1).join('.').replace(/^\d+_/,'')
          todos.push({
            id:`${carpeta}/${file.name}`,
            nombre:nombreLimpio,
            tipo:extATipo(ext),
            cliente:cliente.nombre,
            fecha:file.created_at?file.created_at.split('T')[0]:new Date().toISOString().split('T')[0],
            tamaño:file.metadata?.size?fmtBytes(file.metadata.size):'—',
            extension:ext,
            path:`${carpeta}/${file.name}`,
            fuente:'storage',
          })
        })
      }
    }

    // 2 — Cargar links (videos Drive/YouTube/etc)
    const {data:links}=await supabase.from('archivos_links').select('*,clientes(nombre)').order('created_at',{ascending:false})
    if(links){
      links.forEach((l:any)=>{
        todos.push({
          id:l.id,
          nombre:l.nombre,
          tipo:l.tipo as TipoArchivo,
          cliente:l.clientes?.nombre||'—',
          fecha:l.created_at.split('T')[0],
          tamaño:l.tamaño||'—',
          url:l.url,
          descripcion:l.descripcion||'',
          fuente:'link',
        })
      })
    }

    setArchivos(todos)
    setLoading(false)
  }

  const handleFiles=(files:FileList|null)=>{
    if(!files||files.length===0) return
    if(clientes.length===0){alert('No hay clientes cargados');return}
    setArchivosPendientes(Array.from(files))
    setModalSubir(true)
  }

  const subirArchivos=async()=>{
    if(!clienteUpload||archivosPendientes.length===0) return
    setSubiendo(true)
    const carpeta=clienteUpload.replace(/\s+/g,'_')
    for(const file of archivosPendientes){
      const ts=Date.now()
      await supabase.storage.from('archivos').upload(`${carpeta}/${ts}_${file.name}`,file)
    }
    setModalSubir(false)
    setArchivosPendientes([])
    setSubiendo(false)
    await cargarTodo()
  }

  const guardarLink=async()=>{
    if(!linkNombre.trim()||!linkUrl.trim()||!linkCliente) return
    setGuardandoLink(true)
    const clienteObj=clientes.find(cl=>cl.nombre===linkCliente)
    if(!clienteObj){setGuardandoLink(false);return}
    await supabase.from('archivos_links').insert({
      cliente_id:clienteObj.id,
      nombre:linkNombre.trim(),
      tipo:linkTipo,
      url:linkUrl.trim(),
      tamaño:linkTamaño||'—',
      descripcion:linkDesc,
    })
    setModalLink(false)
    setLinkNombre('');setLinkUrl('');setLinkDesc('');setLinkTamaño('')
    setGuardandoLink(false)
    await cargarTodo()
  }

  const eliminarArchivo=async(archivo:Archivo)=>{
    if(!confirm('¿Eliminar este archivo?')) return
    if(archivo.fuente==='storage'){
      const a=archivo as ArchivoStorage
      await supabase.storage.from('archivos').remove([a.path])
    } else {
      await supabase.from('archivos_links').delete().eq('id',archivo.id)
    }
    setArchivos(prev=>prev.filter(a=>a.id!==archivo.id))
  }

  const descargarArchivo=async(archivo:Archivo)=>{
    if(archivo.fuente==='link'){
      window.open((archivo as ArchivoLink).url,'_blank')
    } else {
      const a=archivo as ArchivoStorage
      const {data}=await supabase.storage.from('archivos').download(a.path)
      if(data){
        const url=URL.createObjectURL(data)
        const el=document.createElement('a');el.href=url;el.download=`${a.nombre}.${a.extension}`;el.click()
        URL.revokeObjectURL(url)
      }
    }
  }

  const compartirArchivo=async(archivo:Archivo)=>{
    let url=''
    if(archivo.fuente==='link'){
      url=(archivo as ArchivoLink).url
    } else {
      const a=archivo as ArchivoStorage
      const {data}=supabase.storage.from('archivos').getPublicUrl(a.path)
      url=data?.publicUrl||''
    }
    if(url){await navigator.clipboard.writeText(url);alert('Link copiado ✅')}
  }

  const archivosFiltrados=archivos
    .filter(a=>filtroCliente==='Todos'||a.cliente===filtroCliente)
    .filter(a=>filtroTipo==='Todos'||a.tipo===filtroTipo)

  const storageUsado=archivos.filter(a=>a.fuente==='storage').reduce((acc,a)=>{
    const n=parseFloat(a.tamaño)
    if(a.tamaño.includes('MB')) return acc+n
    if(a.tamaño.includes('KB')) return acc+(n/1024)
    return acc
  },0)

  const grupos=archivosFiltrados.reduce((acc,a)=>{
    if(!acc[a.cliente]) acc[a.cliente]=[]
    acc[a.cliente].push(a)
    return acc
  },{} as Record<string,Archivo[]>)

  const inputSt:React.CSSProperties={background:c.s2,color:c.text,border:`1px solid ${c.border}`,borderRadius:'10px',padding:'10px 14px',fontFamily:'Rajdhani,sans-serif',fontSize:'13px',outline:'none',width:'100%'}

  return(
    <div className="char-fade" style={{display:'grid',gap:'28px'}}>

      {/* MODAL SUBIR ARCHIVO */}
      {modalSubir&&(
        <div style={{position:'fixed',inset:0,background:'#000000aa',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'16px',padding:'28px',width:'100%',maxWidth:'440px',boxShadow:'0 20px 60px #00000060'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <div>
                <Eb text="SUBIR ARCHIVOS" t={t}/>
                <h3 style={{fontSize:'18px',fontWeight:800,color:c.text,margin:0}}>{archivosPendientes.length} archivo{archivosPendientes.length!==1?'s':''} seleccionado{archivosPendientes.length!==1?'s':''}</h3>
              </div>
              <button onClick={()=>{setModalSubir(false);setArchivosPendientes([])}} style={{background:'transparent',border:'none',color:c.text3,cursor:'pointer'}}>{I.close}</button>
            </div>
            <div style={{background:AMBER+'15',border:`1px solid ${AMBER}40`,borderRadius:'10px',padding:'10px 14px',marginBottom:'16px',fontSize:'12px',color:AMBER}}>
              💡 Para videos grandes usá "Agregar Link" (Google Drive / YouTube) — ilimitado y gratis
            </div>
            <div style={{display:'grid',gap:'8px',marginBottom:'16px',maxHeight:'160px',overflowY:'auto'}}>
              {archivosPendientes.map((f,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',background:c.s2,borderRadius:'8px',border:`1px solid ${c.border}`}}>
                  <div style={{color:tipoColor(extATipo(f.name.split('.').pop()||''))}}>{tipoIcon(extATipo(f.name.split('.').pop()||''))}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'12px',fontWeight:700,color:c.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</div>
                    <div style={{fontSize:'11px',color:c.text3}}>{fmtBytes(f.size)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginBottom:'16px'}}>
              <div style={{fontSize:'11px',color:c.text3,marginBottom:'8px',letterSpacing:'1px'}}>CLIENTE</div>
              <select value={clienteUpload} onChange={e=>setClienteUpload(e.target.value)} style={inputSt}>
                {CLIENTES_NOMBRES.map(n=><option key={n}>{n}</option>)}
              </select>
            </div>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={()=>{setModalSubir(false);setArchivosPendientes([])}} style={{flex:1,background:'transparent',color:c.text2,border:`1px solid ${c.border}`,borderRadius:'10px',padding:'11px',cursor:'pointer',fontSize:'13px',fontWeight:700,fontFamily:'Rajdhani,sans-serif'}}>Cancelar</button>
              <button onClick={subirArchivos} disabled={subiendo} style={{flex:2,background:`linear-gradient(135deg,${GOLD},#cc8800)`,color:'#050510',border:'none',borderRadius:'10px',padding:'11px',cursor:subiendo?'not-allowed':'pointer',fontSize:'13px',fontWeight:700,fontFamily:'Rajdhani,sans-serif',opacity:subiendo?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                {subiendo?'Subiendo...':'↑ Subir a Supabase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR LINK */}
      {modalLink&&(
        <div style={{position:'fixed',inset:0,background:'#000000aa',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'16px',padding:'28px',width:'100%',maxWidth:'480px',boxShadow:'0 20px 60px #00000060'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <div>
                <Eb text="AGREGAR LINK EXTERNO" t={t}/>
                <h3 style={{fontSize:'18px',fontWeight:800,color:c.text,margin:0}}>Google Drive · YouTube · Dropbox</h3>
              </div>
              <button onClick={()=>setModalLink(false)} style={{background:'transparent',border:'none',color:c.text3,cursor:'pointer'}}>{I.close}</button>
            </div>
            <div style={{display:'grid',gap:'12px',marginBottom:'20px'}}>
              <div>
                <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>CLIENTE</div>
                <select value={linkCliente} onChange={e=>setLinkCliente(e.target.value)} style={inputSt}>
                  {CLIENTES_NOMBRES.map(n=><option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>NOMBRE DEL ARCHIVO</div>
                <input value={linkNombre} onChange={e=>setLinkNombre(e.target.value)} placeholder="Ej: Reel Mayo 2026" style={inputSt}/>
              </div>
              <div>
                <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>TIPO</div>
                <select value={linkTipo} onChange={e=>setLinkTipo(e.target.value as TipoArchivo)} style={inputSt}>
                  {TIPOS_LINK.map(tp=><option key={tp}>{tp}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>LINK (Drive / YouTube / Dropbox)</div>
                <input value={linkUrl} onChange={e=>setLinkUrl(e.target.value)} placeholder="https://drive.google.com/..." style={inputSt}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                <div>
                  <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>TAMAÑO (opcional)</div>
                  <input value={linkTamaño} onChange={e=>setLinkTamaño(e.target.value)} placeholder="Ej: 250 MB" style={inputSt}/>
                </div>
                <div>
                  <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>DESCRIPCIÓN (opcional)</div>
                  <input value={linkDesc} onChange={e=>setLinkDesc(e.target.value)} placeholder="Ej: Versión final" style={inputSt}/>
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={()=>setModalLink(false)} style={{flex:1,background:'transparent',color:c.text2,border:`1px solid ${c.border}`,borderRadius:'10px',padding:'11px',cursor:'pointer',fontSize:'13px',fontWeight:700,fontFamily:'Rajdhani,sans-serif'}}>Cancelar</button>
              <button onClick={guardarLink} disabled={guardandoLink||!linkNombre.trim()||!linkUrl.trim()} style={{flex:2,background:`linear-gradient(135deg,${BLUE},#2255cc)`,color:'#fff',border:'none',borderRadius:'10px',padding:'11px',cursor:'pointer',fontSize:'13px',fontWeight:700,fontFamily:'Rajdhani,sans-serif',opacity:guardandoLink||!linkNombre.trim()||!linkUrl.trim()?0.5:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                {guardandoLink?'Guardando...':'🔗 Guardar Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="topbar" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:'12px',flexWrap:'wrap'}}>
        <div>
          <Eb text="GESTIÓN DE CONTENIDO" t={t}/>
          <h1 style={{fontSize:'28px',fontWeight:800,margin:0,color:c.text}}>Archivos</h1>
          <div style={{fontSize:'12px',color:c.text3,marginTop:'4px'}}>Supabase Storage + Google Drive · Sin límite práctico</div>
        </div>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
          <button onClick={()=>setModalLink(true)} style={{background:`linear-gradient(135deg,${BLUE},#2255cc)`,color:'#fff',border:'none',borderRadius:'8px',padding:'8px 16px',fontSize:'12px',cursor:'pointer',fontFamily:'Rajdhani,sans-serif',fontWeight:700,display:'flex',alignItems:'center',gap:'6px'}}>
            🔗 Agregar Link
          </button>
          <button onClick={()=>inputRef.current?.click()} style={{background:`linear-gradient(135deg,${GOLD},#cc8800)`,color:'#050510',border:'none',borderRadius:'8px',padding:'8px 16px',fontSize:'12px',cursor:'pointer',fontFamily:'Rajdhani,sans-serif',fontWeight:700,display:'flex',alignItems:'center',gap:'6px'}}>
            {I.upload} Subir Archivo
          </button>
          <input ref={inputRef} type="file" multiple style={{display:'none'}} onChange={e=>handleFiles(e.target.files)}/>
        </div>
      </div>

      {/* MÉTRICAS */}
      <div className="g4" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px'}}>
        <Card t={t} style={{padding:'18px'}}>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>TOTAL ARCHIVOS</div>
          <div style={{fontSize:'30px',fontWeight:800,color:c.text}}>{archivos.length}</div>
          <div style={{fontSize:'11px',color:c.text3,marginTop:'4px'}}>storage + links</div>
        </Card>
        <Card t={t} style={{padding:'18px'}}>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>EN SUPABASE</div>
          <div style={{fontSize:'30px',fontWeight:800,color:GOLD}}>{archivos.filter(a=>a.fuente==='storage').length}</div>
          <div style={{fontSize:'11px',color:c.text3,marginTop:'4px'}}>fotos, docs, diseños</div>
        </Card>
        <Card t={t} style={{padding:'18px'}}>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>LINKS EXTERNOS</div>
          <div style={{fontSize:'30px',fontWeight:800,color:BLUE}}>{archivos.filter(a=>a.fuente==='link').length}</div>
          <div style={{fontSize:'11px',color:c.text3,marginTop:'4px'}}>Drive · YouTube · Dropbox</div>
        </Card>
        <Card t={t} style={{padding:'18px'}}>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>STORAGE USADO</div>
          <div style={{fontSize:'18px',fontWeight:800,color:GREEN,marginBottom:'6px'}}>{storageUsado.toFixed(1)} MB</div>
          <div style={{height:'4px',background:c.border,borderRadius:'4px'}}>
            <div style={{height:'100%',width:`${Math.min((storageUsado/1024)*100,100)}%`,background:GREEN,borderRadius:'4px',minWidth:'2px'}}/>
          </div>
          <div style={{fontSize:'10px',color:c.text3,marginTop:'4px'}}>de 1 GB (Supabase free)</div>
        </Card>
      </div>

      {/* ZONA DRAG & DROP */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
        <div
          onDrop={e=>{e.preventDefault();setDragOver(false);handleFiles(e.dataTransfer.files)}}
          onDragOver={e=>{e.preventDefault();setDragOver(true)}}
          onDragLeave={()=>setDragOver(false)}
          onClick={()=>inputRef.current?.click()}
          style={{border:`2px dashed ${dragOver?GOLD:c.b2}`,borderRadius:'14px',padding:'24px',textAlign:'center',background:dragOver?GOLD+'08':c.s2,transition:'all 0.2s',cursor:'pointer'}}
        >
          <div style={{color:dragOver?GOLD:c.text3,marginBottom:'8px',display:'flex',justifyContent:'center'}}>{I.upload}</div>
          <div style={{fontSize:'13px',fontWeight:700,color:dragOver?GOLD:c.text2,marginBottom:'4px'}}>Subir archivo directo</div>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'8px'}}>Fotos, logos, docs, diseños</div>
          <Tag label="SUPABASE STORAGE ✅" color={GREEN}/>
        </div>
        <div
          onClick={()=>setModalLink(true)}
          style={{border:`2px dashed ${c.b2}`,borderRadius:'14px',padding:'24px',textAlign:'center',background:c.s2,transition:'all 0.2s',cursor:'pointer'}}
        >
          <div style={{color:BLUE,marginBottom:'8px',display:'flex',justifyContent:'center'}}>{I.link}</div>
          <div style={{fontSize:'13px',fontWeight:700,color:c.text2,marginBottom:'4px'}}>Agregar link externo</div>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'8px'}}>Videos Drive · YouTube · Dropbox</div>
          <Tag label="SIN LÍMITE DE TAMAÑO ✅" color={BLUE}/>
        </div>
      </div>

      {/* CONTROLES */}
      <div style={{display:'flex',gap:'12px',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
          <select value={filtroCliente} onChange={e=>setFiltroCliente(e.target.value)} style={{background:c.s2,color:c.text,border:`1px solid ${c.border}`,borderRadius:'10px',padding:'8px 12px',fontFamily:'Rajdhani,sans-serif',fontSize:'13px',outline:'none'}}>
            <option>Todos</option>
            {CLIENTES_NOMBRES.map(n=><option key={n}>{n}</option>)}
          </select>
          <select value={filtroTipo} onChange={e=>setFiltroTipo(e.target.value)} style={{background:c.s2,color:c.text,border:`1px solid ${c.border}`,borderRadius:'10px',padding:'8px 12px',fontFamily:'Rajdhani,sans-serif',fontSize:'13px',outline:'none'}}>
            <option>Todos</option>
            {TIPOS.map(tp=><option key={tp}>{tp}</option>)}
          </select>
          <button onClick={cargarTodo} style={{background:c.s2,color:c.text2,border:`1px solid ${c.border}`,borderRadius:'8px',padding:'8px 14px',cursor:'pointer',fontSize:'12px',fontWeight:600,fontFamily:'Rajdhani,sans-serif'}}>
            ↻ Actualizar
          </button>
        </div>
        <div style={{display:'flex',gap:'6px'}}>
          <button onClick={()=>setVistaGrid(true)} style={{background:vistaGrid?GOLD+'25':c.s2,color:vistaGrid?GOLD:c.text2,border:`1px solid ${vistaGrid?GOLD+'55':c.border}`,borderRadius:'8px',padding:'8px',cursor:'pointer',display:'flex'}}>
            {I.grid}
          </button>
          <button onClick={()=>setVistaGrid(false)} style={{background:!vistaGrid?GOLD+'25':c.s2,color:!vistaGrid?GOLD:c.text2,border:`1px solid ${!vistaGrid?GOLD+'55':c.border}`,borderRadius:'8px',padding:'8px',cursor:'pointer',display:'flex'}}>
            {I.list}
          </button>
        </div>
      </div>

      {/* LOADING */}
      {loading&&(
        <Card t={t} style={{textAlign:'center',padding:'40px'}}>
          <div style={{fontSize:'13px',color:c.text3}}>Cargando archivos...</div>
        </Card>
      )}

      {/* ARCHIVOS AGRUPADOS */}
      {!loading&&Object.entries(grupos).map(([cliente,items])=>(
        <div key={cliente}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'14px',flexWrap:'wrap'}}>
            <div style={{color:clienteColor(cliente)}}>{I.folder}</div>
            <h3 style={{fontSize:'16px',fontWeight:800,color:c.text,margin:0}}>{cliente}</h3>
            <Tag label={`${items.filter(a=>a.fuente==='storage').length} STORAGE`} color={GREEN}/>
            <Tag label={`${items.filter(a=>a.fuente==='link').length} LINKS`} color={BLUE}/>
          </div>
          {Object.entries(
            items.reduce((acc,a)=>{
              if(!acc[a.tipo]) acc[a.tipo]=[]
              acc[a.tipo].push(a)
              return acc
            },{} as Record<string,Archivo[]>)
          ).map(([tipo,tipoItems])=>(
            <div key={tipo} style={{marginBottom:'16px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px',paddingLeft:'8px'}}>
                <div style={{color:tipoColor(tipo as TipoArchivo)}}>{tipoIcon(tipo as TipoArchivo)}</div>
                <span style={{fontSize:'12px',fontWeight:700,color:c.text3,letterSpacing:'1px'}}>{tipo.toUpperCase()}</span>
                <span style={{fontSize:'11px',color:c.muted}}>({tipoItems.length})</span>
              </div>
              {vistaGrid?(
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'12px'}}>
                  {tipoItems.map(a=>(
                    <ArchivoCard key={a.id} archivo={a} t={t}
                      onEliminar={()=>eliminarArchivo(a)}
                      onDescargar={()=>descargarArchivo(a)}
                      onCompartir={()=>compartirArchivo(a)}
                    />
                  ))}
                </div>
              ):(
                <div style={{display:'grid',gap:'8px'}}>
                  {tipoItems.map(a=>(
                    <ArchivoRow key={a.id} archivo={a} t={t}
                      onEliminar={()=>eliminarArchivo(a)}
                      onDescargar={()=>descargarArchivo(a)}
                      onCompartir={()=>compartirArchivo(a)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {!loading&&archivosFiltrados.length===0&&(
        <Card t={t} style={{textAlign:'center',padding:'40px'}}>
          <div style={{color:c.text3,marginBottom:'8px',display:'flex',justifyContent:'center'}}>{I.folder}</div>
          <div style={{fontSize:'14px',fontWeight:700,color:c.text3,marginBottom:'6px'}}>No hay archivos todavía</div>
          <div style={{fontSize:'12px',color:c.muted}}>Subí archivos livianos o agregá links de Google Drive para videos</div>
        </Card>
      )}

      {/* FOOTER */}
      <Card t={t} style={{padding:'16px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:'13px',fontWeight:700,color:c.text,marginBottom:'4px'}}>Storage híbrido — Sin límite práctico</div>
            <div style={{fontSize:'11px',color:c.text3}}>Archivos livianos en Supabase · Videos en Google Drive / YouTube · Todo organizado por cliente</div>
          </div>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
            <Tag label="SUPABASE FREE ✅" color={GREEN}/>
            <Tag label="DRIVE ILIMITADO ✅" color={BLUE}/>
          </div>
        </div>
      </Card>

    </div>
  )
}

function ArchivoCard({archivo,t,onEliminar,onDescargar,onCompartir}:{archivo:Archivo;t:Theme;onEliminar:()=>void;onDescargar:()=>void;onCompartir:()=>void}){
  const c=th(t)
  const color=tipoColor(archivo.tipo)
  const esLink=archivo.fuente==='link'
  return(
    <div className="char-card char-row" style={{background:c.s2,border:`1px solid ${c.border}`,borderRadius:'12px',padding:'16px',display:'grid',gap:'10px',borderTop:`2px solid ${color}`,transition:'all 0.15s'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div style={{color,padding:'8px',background:color+'15',borderRadius:'8px'}}>{tipoIcon(archivo.tipo)}</div>
        <div style={{display:'flex',gap:'4px',alignItems:'center'}}>
          {esLink&&<Tag label="LINK" color={BLUE}/>}
          {!esLink&&<Tag label={(archivo as any).extension?.toUpperCase()||'—'} color={color}/>}
        </div>
      </div>
      <div>
        <div style={{fontSize:'13px',fontWeight:700,color:c.text,marginBottom:'4px',lineHeight:'1.3',wordBreak:'break-word'}}>{archivo.nombre}</div>
        {esLink&&(archivo as ArchivoLink).descripcion&&(
          <div style={{fontSize:'11px',color:c.text3}}>{(archivo as ArchivoLink).descripcion}</div>
        )}
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:'10px',color:c.text3}}>{archivo.tamaño} · {new Date(archivo.fecha+'T12:00:00').toLocaleDateString('es-AR',{day:'numeric',month:'short'})}</span>
      </div>
      <div style={{display:'flex',gap:'6px'}}>
        <button onClick={onDescargar} style={{flex:1,background:color+'15',color,border:`1px solid ${color}35`,borderRadius:'7px',padding:'6px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'4px',fontSize:'11px',fontWeight:700,fontFamily:'Rajdhani,sans-serif'}}>
          {esLink?<>{I.play} Abrir</>:<>{I.dl} Bajar</>}
        </button>
        <button onClick={onCompartir} style={{background:c.surface,color:c.text3,border:`1px solid ${c.border}`,borderRadius:'7px',padding:'6px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}} title="Copiar link">
          {I.share}
        </button>
        <button onClick={onEliminar} style={{background:'transparent',color:RED,border:`1px solid ${RED}35`,borderRadius:'7px',padding:'6px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {I.trash}
        </button>
      </div>
    </div>
  )
}

function ArchivoRow({archivo,t,onEliminar,onDescargar,onCompartir}:{archivo:Archivo;t:Theme;onEliminar:()=>void;onDescargar:()=>void;onCompartir:()=>void}){
  const c=th(t)
  const color=tipoColor(archivo.tipo)
  const esLink=archivo.fuente==='link'
  return(
    <div className="char-row" style={{background:c.s2,border:`1px solid ${c.border}`,borderRadius:'10px',padding:'14px 16px',display:'flex',alignItems:'center',gap:'14px',borderLeft:`3px solid ${color}`,transition:'all 0.15s'}}>
      <div style={{color,flexShrink:0}}>{tipoIcon(archivo.tipo)}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:'13px',fontWeight:700,color:c.text,marginBottom:'2px'}}>{archivo.nombre}{!esLink?`.${(archivo as ArchivoStorage).extension}`:''}</div>
        <div style={{fontSize:'11px',color:c.text3}}>{archivo.cliente} · {new Date(archivo.fecha+'T12:00:00').toLocaleDateString('es-AR',{day:'numeric',month:'short',year:'numeric'})}{esLink?' · 🔗 Link externo':''}</div>
      </div>
      <Tag label={archivo.tipo.toUpperCase()} color={color}/>
      <span style={{fontSize:'11px',color:c.text3,flexShrink:0}}>{archivo.tamaño}</span>
      <div style={{display:'flex',gap:'6px',flexShrink:0}}>
        <button onClick={onDescargar} style={{background:color+'15',color,border:`1px solid ${color}35`,borderRadius:'7px',padding:'6px',cursor:'pointer',display:'flex'}} title={esLink?'Abrir link':'Descargar'}>
          {esLink?I.play:I.dl}
        </button>
        <button onClick={onCompartir} style={{background:c.surface,color:c.text3,border:`1px solid ${c.border}`,borderRadius:'7px',padding:'6px',cursor:'pointer',display:'flex'}}>
          {I.share}
        </button>
        <button onClick={onEliminar} style={{background:'transparent',color:RED,border:`1px solid ${RED}35`,borderRadius:'7px',padding:'6px',cursor:'pointer',display:'flex'}}>
          {I.trash}
        </button>
      </div>
    </div>
  )
}
