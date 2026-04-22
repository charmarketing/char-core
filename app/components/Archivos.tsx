'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

type Theme = 'dark' | 'light'
const D = { bg:'#05050f',surface:'#0b0b18',s2:'#111124',border:'#16163a',b2:'#1e1e3a',text:'#f0f0ff',text2:'#9090b8',text3:'#4a4a6a',muted:'#2a2a4a' }
const L = { bg:'#eef0f8',surface:'#ffffff',s2:'#f4f6ff',border:'#dde0f0',b2:'#c8cbdf',text:'#0d0d20',text2:'#2a2a4a',text3:'#606088',muted:'#9090aa' }
const th = (t:Theme) => t==='dark'?D:L
const GOLD='#c9a96e',BLUE='#4f8fff',GREEN='#3dd68c',RED='#f87171',AMBER='#f59e0b',PURPLE='#a78bfa',PINK='#ec4899'

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

const I={
  folder:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  file:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
  image:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  video:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  audio:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  doc:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  design:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>,
  plus:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  dl:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  trash:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  share:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  upload:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  grid:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  list:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  check:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  close:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
}

type TipoArchivo = 'Video'|'Foto'|'Diseño'|'Documento'|'Audio'|'Logo'|'Otro'

type Archivo = {
  id: string
  nombre: string
  tipo: TipoArchivo
  cliente: string
  fecha: string
  tamaño: string
  extension: string
  path: string
}

const extATipo=(ext:string):TipoArchivo=>{
  const e=ext.toLowerCase()
  if(['mp4','mov','avi','mkv','webm'].includes(e)) return 'Video'
  if(['jpg','jpeg','png','gif','webp','heic'].includes(e)) return 'Foto'
  if(['mp3','wav','aac','m4a','ogg'].includes(e)) return 'Audio'
  if(['pdf','doc','docx','txt','xls','xlsx','ppt','pptx'].includes(e)) return 'Documento'
  if(['psd','ai','fig','sketch','xd'].includes(e)) return 'Diseño'
  if(['svg'].includes(e)) return 'Logo'
  return 'Otro'
}

const fmtBytes=(b:number):string=>{
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
  const [mostrarModal,setMostrarModal]=useState(false)
  const [archivosPendientes,setArchivosPendientes]=useState<File[]>([])
  const [clienteUpload,setClienteUpload]=useState('')
  const inputRef=useRef<HTMLInputElement>(null)

  useEffect(()=>{
    if(clientes.length>0){
      setClienteUpload(clientes[0].nombre)
      cargarArchivos()
    } else {
      setLoading(false)
    }
  },[clientes])

  const cargarArchivos=async()=>{
    setLoading(true)
    const todos:Archivo[]=[]
    for(const cliente of clientes){
      const carpeta=cliente.nombre.replace(/\s+/g,'_')
      const {data,error}=await supabase.storage.from('archivos').list(carpeta,{limit:100})
      if(!error&&data){
        data.forEach(file=>{
          if(file.name==='.emptyFolderPlaceholder') return
          const partes=file.name.split('.')
          const ext=partes.length>1?partes[partes.length-1]:'otro'
          const nombreCompleto=partes.slice(0,-1).join('.')
          const nombreLimpio=nombreCompleto.replace(/^\d+_/,'')
          todos.push({
            id:`${carpeta}/${file.name}`,
            nombre:nombreLimpio,
            tipo:extATipo(ext),
            cliente:cliente.nombre,
            fecha:file.created_at?file.created_at.split('T')[0]:new Date().toISOString().split('T')[0],
            tamaño:file.metadata?.size?fmtBytes(file.metadata.size):'—',
            extension:ext,
            path:`${carpeta}/${file.name}`,
          })
        })
      }
    }
    setArchivos(todos)
    setLoading(false)
  }

  const handleFiles=(files:FileList|null)=>{
    if(!files||files.length===0) return
    if(clientes.length===0){alert('No hay clientes cargados');return}
    setArchivosPendientes(Array.from(files))
    setMostrarModal(true)
  }

  const subirArchivos=async()=>{
    if(!clienteUpload||archivosPendientes.length===0) return
    setSubiendo(true)
    const carpeta=clienteUpload.replace(/\s+/g,'_')
    for(const file of archivosPendientes){
      const ts=Date.now()
      const path=`${carpeta}/${ts}_${file.name}`
      await supabase.storage.from('archivos').upload(path,file)
    }
    setMostrarModal(false)
    setArchivosPendientes([])
    setSubiendo(false)
    await cargarArchivos()
  }

  const eliminarArchivo=async(path:string)=>{
    if(!confirm('¿Eliminar este archivo? Esta acción no se puede deshacer.')) return
    const {error}=await supabase.storage.from('archivos').remove([path])
    if(!error) setArchivos(prev=>prev.filter(a=>a.path!==path))
  }

  const descargarArchivo=async(path:string,nombre:string,ext:string)=>{
    const {data}=await supabase.storage.from('archivos').download(path)
    if(data){
      const url=URL.createObjectURL(data)
      const a=document.createElement('a');a.href=url;a.download=`${nombre}.${ext}`;a.click()
      URL.revokeObjectURL(url)
    }
  }

  const compartirArchivo=async(path:string)=>{
    const {data}=supabase.storage.from('archivos').getPublicUrl(path)
    if(data?.publicUrl){
      await navigator.clipboard.writeText(data.publicUrl)
      alert('Link copiado al portapapeles ✅')
    }
  }

  const archivosFiltrados=archivos
    .filter(a=>filtroCliente==='Todos'||a.cliente===filtroCliente)
    .filter(a=>filtroTipo==='Todos'||a.tipo===filtroTipo)

  const storageUsado=archivos.reduce((acc,a)=>{
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

  const exportar=()=>exportCSV('CHAR_Archivos',
    ['Nombre','Tipo','Cliente','Fecha','Tamaño','Extensión'],
    archivos.map(a=>[a.nombre,a.tipo,a.cliente,a.fecha,a.tamaño,a.extension]))

  const inputSt:React.CSSProperties={background:c.s2,color:c.text,border:`1px solid ${c.border}`,borderRadius:'10px',padding:'10px 14px',fontFamily:'Rajdhani,sans-serif',fontSize:'13px',outline:'none'}

  return(
    <div className="char-fade" style={{display:'grid',gap:'28px'}}>

      {/* MODAL SUBIR */}
      {mostrarModal&&(
        <div style={{position:'fixed',inset:0,background:'#000000aa',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'16px',padding:'28px',width:'100%',maxWidth:'440px',boxShadow:'0 20px 60px #00000060'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <div>
                <Eb text="SUBIR ARCHIVOS" t={t}/>
                <h3 style={{fontSize:'18px',fontWeight:800,color:c.text,margin:0}}>
                  {archivosPendientes.length} archivo{archivosPendientes.length!==1?'s':''} seleccionado{archivosPendientes.length!==1?'s':''}
                </h3>
              </div>
              <button onClick={()=>{setMostrarModal(false);setArchivosPendientes([])}} style={{background:'transparent',border:'none',color:c.text3,cursor:'pointer',padding:'4px'}}>
                {I.close}
              </button>
            </div>
            <div style={{display:'grid',gap:'10px',marginBottom:'20px',maxHeight:'160px',overflowY:'auto'}}>
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
            <div style={{marginBottom:'20px'}}>
              <div style={{fontSize:'11px',color:c.text3,marginBottom:'8px',letterSpacing:'1px'}}>CLIENTE</div>
              <select value={clienteUpload} onChange={e=>setClienteUpload(e.target.value)} style={{...inputSt,width:'100%'}}>
                {CLIENTES_NOMBRES.map(n=><option key={n}>{n}</option>)}
              </select>
            </div>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={()=>{setMostrarModal(false);setArchivosPendientes([])}}
                style={{flex:1,background:'transparent',color:c.text2,border:`1px solid ${c.border}`,borderRadius:'10px',padding:'11px',cursor:'pointer',fontSize:'13px',fontWeight:700,fontFamily:'Rajdhani,sans-serif'}}>
                Cancelar
              </button>
              <button onClick={subirArchivos} disabled={subiendo}
                style={{flex:2,background:`linear-gradient(135deg,${GOLD},#8b6010)`,color:'#050510',border:'none',borderRadius:'10px',padding:'11px',cursor:subiendo?'not-allowed':'pointer',fontSize:'13px',fontWeight:700,fontFamily:'Rajdhani,sans-serif',opacity:subiendo?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                {subiendo?'Subiendo...':<>{I.upload} Subir a Supabase</>}
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
          <div style={{fontSize:'12px',color:c.text3,marginTop:'4px'}}>Almacenamiento real en Supabase Storage ✅</div>
        </div>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
          <button onClick={exportar} style={{background:'transparent',color:GOLD,border:`1px solid ${GOLD}55`,borderRadius:'8px',padding:'8px 16px',fontSize:'12px',cursor:'pointer',fontFamily:'Rajdhani,sans-serif',fontWeight:600,display:'flex',alignItems:'center',gap:'6px'}}>
            {I.dl} Exportar CSV
          </button>
          <button onClick={()=>inputRef.current?.click()} style={{background:`linear-gradient(135deg,${GOLD},#8b6010)`,color:'#050510',border:'none',borderRadius:'8px',padding:'8px 16px',fontSize:'12px',cursor:'pointer',fontFamily:'Rajdhani,sans-serif',fontWeight:700,display:'flex',alignItems:'center',gap:'6px'}}>
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
          <div style={{fontSize:'11px',color:c.text3,marginTop:'4px'}}>en Supabase Storage</div>
        </Card>
        <Card t={t} style={{padding:'18px'}}>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>CLIENTES</div>
          <div style={{fontSize:'30px',fontWeight:800,color:GOLD}}>{clientes.length}</div>
          <div style={{fontSize:'11px',color:c.text3,marginTop:'4px'}}>con carpeta activa</div>
        </Card>
        <Card t={t} style={{padding:'18px'}}>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>TIPOS</div>
          <div style={{fontSize:'30px',fontWeight:800,color:PURPLE}}>{new Set(archivos.map(a=>a.tipo)).size||0}</div>
          <div style={{fontSize:'11px',color:c.text3,marginTop:'4px'}}>formatos distintos</div>
        </Card>
        <Card t={t} style={{padding:'18px'}}>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>STORAGE USADO</div>
          <div style={{fontSize:'18px',fontWeight:800,color:GREEN,marginBottom:'6px'}}>{storageUsado.toFixed(1)} MB</div>
          <div style={{height:'4px',background:c.border,borderRadius:'4px'}}>
            <div style={{height:'100%',width:`${Math.min((storageUsado/1024)*100,100)}%`,background:GREEN,borderRadius:'4px',boxShadow:`0 0 8px ${GREEN}55`,minWidth:'4px'}}/>
          </div>
          <div style={{fontSize:'10px',color:c.text3,marginTop:'4px'}}>de 1 GB gratis</div>
        </Card>
      </div>

      {/* ZONA DRAG & DROP */}
      <div
        onDrop={e=>{e.preventDefault();setDragOver(false);handleFiles(e.dataTransfer.files)}}
        onDragOver={e=>{e.preventDefault();setDragOver(true)}}
        onDragLeave={()=>setDragOver(false)}
        onClick={()=>inputRef.current?.click()}
        style={{border:`2px dashed ${dragOver?GOLD:c.b2}`,borderRadius:'14px',padding:'32px',textAlign:'center',background:dragOver?GOLD+'08':c.s2,transition:'all 0.2s',cursor:'pointer'}}
      >
        <div style={{color:dragOver?GOLD:c.text3,marginBottom:'10px',display:'flex',justifyContent:'center'}}>{I.upload}</div>
        <div style={{fontSize:'14px',fontWeight:700,color:dragOver?GOLD:c.text2,marginBottom:'4px'}}>
          {dragOver?'Soltá para subir':'Arrastrá archivos acá o hacé click'}
        </div>
        <div style={{fontSize:'11px',color:c.text3,marginBottom:'10px'}}>Videos, fotos, diseños, documentos, audios, logos</div>
        <Tag label="SUPABASE STORAGE ACTIVO ✅" color={GREEN}/>
      </div>

      {/* CONTROLES */}
      <div style={{display:'flex',gap:'12px',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
          <select value={filtroCliente} onChange={e=>setFiltroCliente(e.target.value)} style={{...inputSt,padding:'8px 12px'}}>
            <option>Todos</option>
            {CLIENTES_NOMBRES.map(n=><option key={n}>{n}</option>)}
          </select>
          <select value={filtroTipo} onChange={e=>setFiltroTipo(e.target.value)} style={{...inputSt,padding:'8px 12px'}}>
            <option>Todos</option>
            {TIPOS.map(tp=><option key={tp}>{tp}</option>)}
          </select>
          <button onClick={cargarArchivos} style={{background:c.s2,color:c.text2,border:`1px solid ${c.border}`,borderRadius:'8px',padding:'8px 14px',cursor:'pointer',fontSize:'12px',fontWeight:600,fontFamily:'Rajdhani,sans-serif'}}>
            ↻ Actualizar
          </button>
        </div>
        <div style={{display:'flex',gap:'6px'}}>
          <button onClick={()=>setVistaGrid(true)} className="char-btn" style={{background:vistaGrid?GOLD+'25':c.s2,color:vistaGrid?GOLD:c.text2,border:`1px solid ${vistaGrid?GOLD+'55':c.border}`,borderRadius:'8px',padding:'8px',cursor:'pointer',display:'flex'}}>
            {I.grid}
          </button>
          <button onClick={()=>setVistaGrid(false)} className="char-btn" style={{background:!vistaGrid?GOLD+'25':c.s2,color:!vistaGrid?GOLD:c.text2,border:`1px solid ${!vistaGrid?GOLD+'55':c.border}`,borderRadius:'8px',padding:'8px',cursor:'pointer',display:'flex'}}>
            {I.list}
          </button>
        </div>
      </div>

      {/* ESTADO LOADING */}
      {loading&&(
        <Card t={t} style={{textAlign:'center',padding:'40px'}}>
          <div style={{fontSize:'13px',color:c.text3}}>Cargando archivos desde Supabase...</div>
        </Card>
      )}

      {/* ARCHIVOS AGRUPADOS POR CLIENTE */}
      {!loading&&Object.entries(grupos).map(([cliente,items])=>(
        <div key={cliente}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'14px',flexWrap:'wrap'}}>
            <div style={{color:clienteColor(cliente)}}>{I.folder}</div>
            <h3 style={{fontSize:'16px',fontWeight:800,color:c.text,margin:0}}>{cliente}</h3>
            <Tag label={`${items.length} ARCHIVOS`} color={clienteColor(cliente)}/>
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
                  {tipoItems.sort((a,b)=>b.fecha.localeCompare(a.fecha)).map(a=>(
                    <ArchivoCard key={a.id} archivo={a} t={t}
                      onEliminar={()=>eliminarArchivo(a.path)}
                      onDescargar={()=>descargarArchivo(a.path,a.nombre,a.extension)}
                      onCompartir={()=>compartirArchivo(a.path)}
                    />
                  ))}
                </div>
              ):(
                <div style={{display:'grid',gap:'8px'}}>
                  {tipoItems.sort((a,b)=>b.fecha.localeCompare(a.fecha)).map(a=>(
                    <ArchivoRow key={a.id} archivo={a} t={t}
                      onEliminar={()=>eliminarArchivo(a.path)}
                      onDescargar={()=>descargarArchivo(a.path,a.nombre,a.extension)}
                      onCompartir={()=>compartirArchivo(a.path)}
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
          <div style={{fontSize:'14px',fontWeight:700,color:c.text3,marginBottom:'6px'}}>No hay archivos</div>
          <div style={{fontSize:'12px',color:c.muted}}>Subí el primer archivo usando el botón de arriba</div>
        </Card>
      )}

      {/* FOOTER */}
      <Card t={t} style={{padding:'16px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:'13px',fontWeight:700,color:c.text,marginBottom:'4px'}}>Supabase Storage activo</div>
            <div style={{fontSize:'11px',color:c.text3}}>Los archivos se organizan por cliente automáticamente · 1 GB gratis incluido</div>
          </div>
          <Tag label="STORAGE REAL ACTIVO ✅" color={GREEN}/>
        </div>
      </Card>

    </div>
  )
}

function ArchivoCard({archivo,t,onEliminar,onDescargar,onCompartir}:{archivo:Archivo;t:Theme;onEliminar:()=>void;onDescargar:()=>void;onCompartir:()=>void}){
  const c=th(t)
  const color=tipoColor(archivo.tipo)
  return(
    <div className="char-card char-row" style={{background:c.s2,border:`1px solid ${c.border}`,borderRadius:'12px',padding:'16px',display:'grid',gap:'10px',borderTop:`2px solid ${color}`,transition:'all 0.15s'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div style={{color,padding:'8px',background:color+'15',borderRadius:'8px'}}>{tipoIcon(archivo.tipo)}</div>
        <Tag label={archivo.extension.toUpperCase()} color={color}/>
      </div>
      <div>
        <div style={{fontSize:'13px',fontWeight:700,color:c.text,marginBottom:'4px',lineHeight:'1.3',wordBreak:'break-word'}}>{archivo.nombre}</div>
        <div style={{fontSize:'11px',color:c.text3}}>{archivo.tipo}</div>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:'10px',color:c.text3}}>{archivo.tamaño} · {new Date(archivo.fecha+'T12:00:00').toLocaleDateString('es-AR',{day:'numeric',month:'short'})}</span>
      </div>
      <div style={{display:'flex',gap:'6px'}}>
        <button className="char-btn" onClick={onDescargar} style={{flex:1,background:color+'15',color,border:`1px solid ${color}35`,borderRadius:'7px',padding:'6px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'4px',fontSize:'11px',fontWeight:700,fontFamily:'Rajdhani,sans-serif'}}>
          ↓ Bajar
        </button>
        <button className="char-btn" onClick={onCompartir} style={{background:c.surface,color:c.text3,border:`1px solid ${c.border}`,borderRadius:'7px',padding:'6px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}} title="Copiar link">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
        <button className="char-btn" onClick={onEliminar} style={{background:'transparent',color:RED,border:`1px solid ${RED}35`,borderRadius:'7px',padding:'6px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
    </div>
  )
}

function ArchivoRow({archivo,t,onEliminar,onDescargar,onCompartir}:{archivo:Archivo;t:Theme;onEliminar:()=>void;onDescargar:()=>void;onCompartir:()=>void}){
  const c=th(t)
  const color=tipoColor(archivo.tipo)
  return(
    <div className="char-row" style={{background:c.s2,border:`1px solid ${c.border}`,borderRadius:'10px',padding:'14px 16px',display:'flex',alignItems:'center',gap:'14px',borderLeft:`3px solid ${color}`,transition:'all 0.15s'}}>
      <div style={{color,flexShrink:0}}>{tipoIcon(archivo.tipo)}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:'13px',fontWeight:700,color:c.text,marginBottom:'2px'}}>{archivo.nombre}.{archivo.extension}</div>
        <div style={{fontSize:'11px',color:c.text3}}>{archivo.cliente} · {new Date(archivo.fecha+'T12:00:00').toLocaleDateString('es-AR',{day:'numeric',month:'short',year:'numeric'})}</div>
      </div>
      <Tag label={archivo.tipo.toUpperCase()} color={color}/>
      <span style={{fontSize:'11px',color:c.text3,flexShrink:0}}>{archivo.tamaño}</span>
      <div style={{display:'flex',gap:'6px',flexShrink:0}}>
        <button className="char-btn" onClick={onDescargar} style={{background:color+'15',color,border:`1px solid ${color}35`,borderRadius:'7px',padding:'6px',cursor:'pointer',display:'flex'}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button className="char-btn" onClick={onCompartir} style={{background:c.surface,color:c.text3,border:`1px solid ${c.border}`,borderRadius:'7px',padding:'6px',cursor:'pointer',display:'flex'}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
        <button className="char-btn" onClick={onEliminar} style={{background:'transparent',color:RED,border:`1px solid ${RED}35`,borderRadius:'7px',padding:'6px',cursor:'pointer',display:'flex'}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
    </div>
  )
}
