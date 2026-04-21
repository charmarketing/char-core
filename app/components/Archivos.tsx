'use client'
import { useState, useRef } from 'react'

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
  supabase:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.111 12.888.749 14.1 1.824 14.1h9.327l.012 8.864c.015.986 1.26 1.41 1.874.637l9.262-11.652c.653-.837.015-2.05-1.06-2.05h-9.327L11.9 1.036z"/></svg>,
}

type TipoArchivo = 'Video'|'Foto'|'Diseño'|'Documento'|'Audio'|'Afiche'|'Logo'|'Flyer'|'Otro'
type OrganizacionVista = 'cliente-tipo-fecha'|'cliente-proyecto-tipo'

type Archivo = {
  id:number
  nombre:string
  tipo:TipoArchivo
  cliente:string
  proyecto:string
  fecha:string
  tamaño:string
  extension:string
}

const tipoColor = (tipo:TipoArchivo) => {
  const map:Record<TipoArchivo,string> = {
    Video:BLUE, Foto:GREEN, Diseño:PURPLE, Documento:GOLD,
    Audio:PINK, Afiche:AMBER, Logo:RED, Flyer:AMBER, Otro:BLUE
  }
  return map[tipo]||GOLD
}

const tipoIcon = (tipo:TipoArchivo) => {
  if(tipo==='Video') return I.video
  if(tipo==='Foto') return I.image
  if(tipo==='Audio') return I.audio
  if(['Documento'].includes(tipo)) return I.doc
  return I.design
}

const CLIENTES_NOMBRES = clientes.map(cl=>cl.nombre)
const PROYECTOS = ['Redes Sociales','Campaña Mayo','Identidad Visual','SEO','Google Ads','Contenido Orgánico']
const TIPOS:TipoArchivo[] = ['Video','Foto','Diseño','Documento','Audio','Afiche','Logo','Flyer','Otro']
const clienteColor = (nombre:string) => {
  const colors=[GOLD,BLUE,PURPLE,GREEN,AMBER]
  const idx=clientes.findIndex(cl=>cl.nombre===nombre)
  return colors[idx>=0?idx%colors.length:0]
}

const ARCHIVOS_INICIALES:Archivo[] = [
  {id:1,nombre:'Reel_Teaser_Campaña_Alfa',tipo:'Video',cliente:'Cliente Alfa',proyecto:'Redes Sociales',fecha:'2026-04-14',tamaño:'245 MB',extension:'mp4'},
  {id:2,nombre:'Logo_CHAR_Final_v3',tipo:'Logo',cliente:'Cliente Alfa',proyecto:'Identidad Visual',fecha:'2026-04-10',tamaño:'2.4 MB',extension:'svg'},
  {id:3,nombre:'Foto_Producto_Shoot_01',tipo:'Foto',cliente:'Cliente Beta',proyecto:'Redes Sociales',fecha:'2026-04-18',tamaño:'8.2 MB',extension:'jpg'},
  {id:4,nombre:'Propuesta_Campaña_Mayo',tipo:'Documento',cliente:'Cliente Alfa',proyecto:'Campaña Mayo',fecha:'2026-04-12',tamaño:'1.1 MB',extension:'pdf'},
  {id:5,nombre:'Musica_Fondo_Reel',tipo:'Audio',cliente:'Cliente Beta',proyecto:'Contenido Orgánico',fecha:'2026-04-16',tamaño:'4.8 MB',extension:'mp3'},
  {id:6,nombre:'Afiche_Evento_Gamma',tipo:'Afiche',cliente:'Cliente Gamma',proyecto:'Redes Sociales',fecha:'2026-04-20',tamaño:'12.5 MB',extension:'psd'},
  {id:7,nombre:'Banner_GoogleAds_v2',tipo:'Diseño',cliente:'Cliente Gamma',proyecto:'Google Ads',fecha:'2026-04-22',tamaño:'3.7 MB',extension:'png'},
  {id:8,nombre:'Flyer_Promo_Beta',tipo:'Flyer',cliente:'Cliente Beta',proyecto:'Campaña Mayo',fecha:'2026-04-19',tamaño:'5.1 MB',extension:'pdf'},
]

export default function Archivos({t,clientes=[]}:{t:Theme,clientes:any[]}){
  const c=th(t)
  const [archivos,setArchivos]=useState<Archivo[]>([])
  const [organizacion,setOrganizacion]=useState<OrganizacionVista>('cliente-tipo-fecha')
  const [vistaGrid,setVistaGrid]=useState(true)
  const [filtroCliente,setFiltroCliente]=useState('Todos')
  const [filtroTipo,setFiltroTipo]=useState('Todos')
  const [dragOver,setDragOver]=useState(false)
  const inputRef=useRef<HTMLInputElement>(null)

  const storageUsado = 282.8
  const storageTotal = 1024
  const storagePct = (storageUsado/storageTotal)*100

  const archivosFiltrados = archivos
    .filter(a=>filtroCliente==='Todos'||a.cliente===filtroCliente)
    .filter(a=>filtroTipo==='Todos'||a.tipo===filtroTipo)

  const handleDrop=(e:React.DragEvent)=>{
    e.preventDefault()
    setDragOver(false)
    alert('Subida real disponible en Módulo 8 con Supabase Storage')
  }

  const handleDragOver=(e:React.DragEvent)=>{
    e.preventDefault()
    setDragOver(true)
  }

  const exportar=()=>exportCSV('CHAR_Archivos',
    ['Nombre','Tipo','Cliente','Proyecto','Fecha','Tamaño','Extensión'],
    archivos.map(a=>[a.nombre,a.tipo,a.cliente,a.proyecto,a.fecha,a.tamaño,a.extension])
  )

  const groupBy = (key:(a:Archivo)=>string) => {
    const map:Record<string,Archivo[]>={}
    archivosFiltrados.forEach(a=>{
      const k=key(a)
      if(!map[k]) map[k]=[]
      map[k].push(a)
    })
    return map
  }

  const grupos = organizacion==='cliente-tipo-fecha'
    ? groupBy(a=>a.cliente)
    : groupBy(a=>a.cliente)

  const inputSt:React.CSSProperties={background:c.s2,color:c.text,border:`1px solid ${c.border}`,borderRadius:'10px',padding:'10px 14px',fontFamily:'Rajdhani,sans-serif',fontSize:'13px',outline:'none'}

  return(
    <div className="char-fade" style={{display:'grid',gap:'28px'}}>

      {/* HEADER */}
      <div className="topbar" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:'12px'}}>
        <div>
          <Eb text="GESTIÓN DE CONTENIDO" t={t}/>
          <h1 style={{fontSize:'28px',fontWeight:800,margin:0,color:c.text}}>Archivos</h1>
        </div>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
          <Btn v="outline" t={t} onClick={exportar}>{I.dl} Exportar CSV</Btn>
          <Btn v="primary" t={t} onClick={()=>inputRef.current?.click()}>{I.upload} Subir Archivo</Btn>
          <input ref={inputRef} type="file" multiple style={{display:'none'}} onChange={()=>alert('Subida real disponible en Módulo 8 con Supabase Storage')}/>
        </div>
      </div>

      {/* MÉTRICAS */}
      <div className="g4" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px'}}>
        <Card t={t} style={{padding:'18px'}}>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>TOTAL ARCHIVOS</div>
          <div style={{fontSize:'30px',fontWeight:800,color:c.text}}>{archivos.length}</div>
        </Card>
        <Card t={t} style={{padding:'18px'}}>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>CLIENTES</div>
          <div style={{fontSize:'30px',fontWeight:800,color:GOLD}}>{clientes.length}</div>
        </Card>
        <Card t={t} style={{padding:'18px'}}>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>TIPOS</div>
          <div style={{fontSize:'30px',fontWeight:800,color:PURPLE}}>{TIPOS.length}</div>
        </Card>
        <Card t={t} style={{padding:'18px'}}>
          <div style={{fontSize:'11px',color:c.text3,marginBottom:'6px',letterSpacing:'1px'}}>STORAGE SUPABASE</div>
          <div style={{fontSize:'16px',fontWeight:800,color:storagePct>80?RED:GREEN,marginBottom:'6px'}}>{storageUsado} MB / {storageTotal} MB</div>
          <div style={{height:'4px',background:c.border,borderRadius:'4px'}}>
            <div style={{height:'100%',width:`${storagePct}%`,background:storagePct>80?RED:GREEN,borderRadius:'4px',boxShadow:`0 0 8px ${storagePct>80?RED:GREEN}55`}}/>
          </div>
        </Card>
      </div>

      {/* ZONA DRAG & DROP */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={()=>setDragOver(false)}
        style={{
          border:`2px dashed ${dragOver?GOLD:c.b2}`,
          borderRadius:'14px',
          padding:'32px',
          textAlign:'center',
          background:dragOver?GOLD+'08':c.s2,
          transition:'all 0.2s',
          cursor:'pointer',
        }}
        onClick={()=>inputRef.current?.click()}
      >
        <div style={{color:dragOver?GOLD:c.text3,marginBottom:'10px',display:'flex',justifyContent:'center'}}>{I.upload}</div>
        <div style={{fontSize:'14px',fontWeight:700,color:dragOver?GOLD:c.text2,marginBottom:'4px'}}>
          {dragOver?'Soltá para subir':'Arrastrá archivos acá o hacé click'}
        </div>
        <div style={{fontSize:'11px',color:c.text3}}>
          Videos, fotos, diseños, documentos, audios, afiches, logos, flyers
        </div>
        <div style={{marginTop:'10px',display:'flex',justifyContent:'center'}}>
          <Tag label="ALMACENAMIENTO REAL EN MÓDULO 8 — SUPABASE" color={GOLD}/>
        </div>
      </div>

      {/* CONTROLES */}
      <div style={{display:'flex',gap:'12px',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
          {/* Toggle organización */}
          <div style={{display:'flex',gap:'6px'}}>
            <button onClick={()=>setOrganizacion('cliente-tipo-fecha')} className="char-btn" style={{
              background:organizacion==='cliente-tipo-fecha'?`linear-gradient(135deg,${GOLD},#8b6010)`:c.s2,
              color:organizacion==='cliente-tipo-fecha'?'#050510':c.text2,
              border:organizacion==='cliente-tipo-fecha'?'none':`1px solid ${c.border}`,
              borderRadius:'8px',padding:'8px 14px',cursor:'pointer',
              fontSize:'12px',fontWeight:700,fontFamily:'Rajdhani,sans-serif',
            }}>
              Cliente → Tipo → Fecha
            </button>
            <button onClick={()=>setOrganizacion('cliente-proyecto-tipo')} className="char-btn" style={{
              background:organizacion==='cliente-proyecto-tipo'?`linear-gradient(135deg,${GOLD},#8b6010)`:c.s2,
              color:organizacion==='cliente-proyecto-tipo'?'#050510':c.text2,
              border:organizacion==='cliente-proyecto-tipo'?'none':`1px solid ${c.border}`,
              borderRadius:'8px',padding:'8px 14px',cursor:'pointer',
              fontSize:'12px',fontWeight:700,fontFamily:'Rajdhani,sans-serif',
            }}>
              Cliente → Proyecto → Tipo
            </button>
          </div>

          {/* Filtro cliente */}
          <select value={filtroCliente} onChange={e=>setFiltroCliente(e.target.value)} style={{...inputSt,padding:'8px 12px'}}>
            <option>Todos</option>
            {CLIENTES_NOMBRES.map(c=><option key={c}>{c}</option>)}
          </select>

          {/* Filtro tipo */}
          <select value={filtroTipo} onChange={e=>setFiltroTipo(e.target.value)} style={{...inputSt,padding:'8px 12px'}}>
            <option>Todos</option>
            {TIPOS.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Toggle grid/lista */}
        <div style={{display:'flex',gap:'6px'}}>
          <button onClick={()=>setVistaGrid(true)} className="char-btn" style={{background:vistaGrid?GOLD+'25':c.s2,color:vistaGrid?GOLD:c.text2,border:`1px solid ${vistaGrid?GOLD+'55':c.border}`,borderRadius:'8px',padding:'8px',cursor:'pointer',display:'flex'}}>
            {I.grid}
          </button>
          <button onClick={()=>setVistaGrid(false)} className="char-btn" style={{background:!vistaGrid?GOLD+'25':c.s2,color:!vistaGrid?GOLD:c.text2,border:`1px solid ${!vistaGrid?GOLD+'55':c.border}`,borderRadius:'8px',padding:'8px',cursor:'pointer',display:'flex'}}>
            {I.list}
          </button>
        </div>
      </div>

      {/* ARCHIVOS AGRUPADOS */}
      {Object.entries(grupos).map(([grupo,items])=>(
        <div key={grupo}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'14px'}}>
            <div style={{color:clienteColor(grupo)}}>{I.folder}</div>
            <h3 style={{fontSize:'16px',fontWeight:800,color:c.text,margin:0}}>{grupo}</h3>
            <Tag label={`${items.length} ARCHIVOS`} color={clienteColor(grupo)}/>
          </div>

          {organizacion==='cliente-tipo-fecha' ? (
            // Agrupado por tipo dentro del cliente
            Object.entries(
              items.reduce((acc,a)=>{
                if(!acc[a.tipo]) acc[a.tipo]=[]
                acc[a.tipo].push(a)
                return acc
              },{} as Record<string,Archivo[]>)
            ).map(([tipo,tipoItems])=>(
              <div key={tipo} style={{marginBottom:'16px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px',paddingLeft:'8px'}}>
                  <div style={{color:tipoColor(tipo as TipoArchivo),fontSize:'12px'}}>{tipoIcon(tipo as TipoArchivo)}</div>
                  <span style={{fontSize:'12px',fontWeight:700,color:c.text3,letterSpacing:'1px'}}>{tipo.toUpperCase()}</span>
                  <span style={{fontSize:'11px',color:c.muted}}>({tipoItems.length})</span>
                </div>
                {vistaGrid ? (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'12px'}}>
                    {tipoItems.sort((a,b)=>b.fecha.localeCompare(a.fecha)).map(a=>(
                      <ArchivoCard key={a.id} archivo={a} t={t} onEliminar={id=>setArchivos(prev=>prev.filter(x=>x.id!==id))}/>
                    ))}
                  </div>
                ):(
                  <div style={{display:'grid',gap:'8px'}}>
                    {tipoItems.sort((a,b)=>b.fecha.localeCompare(a.fecha)).map(a=>(
                      <ArchivoRow key={a.id} archivo={a} t={t} onEliminar={id=>setArchivos(prev=>prev.filter(x=>x.id!==id))}/>
                    ))}
                  </div>
                )}
              </div>
            ))
          ):(
            // Agrupado por proyecto dentro del cliente
            Object.entries(
              items.reduce((acc,a)=>{
                if(!acc[a.proyecto]) acc[a.proyecto]=[]
                acc[a.proyecto].push(a)
                return acc
              },{} as Record<string,Archivo[]>)
            ).map(([proyecto,proyItems])=>(
              <div key={proyecto} style={{marginBottom:'16px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px',paddingLeft:'8px'}}>
                  <div style={{color:BLUE}}>{I.folder}</div>
                  <span style={{fontSize:'12px',fontWeight:700,color:c.text3,letterSpacing:'1px'}}>{proyecto.toUpperCase()}</span>
                  <span style={{fontSize:'11px',color:c.muted}}>({proyItems.length})</span>
                </div>
                {vistaGrid ? (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'12px'}}>
                    {proyItems.map(a=>(
                      <ArchivoCard key={a.id} archivo={a} t={t} onEliminar={id=>setArchivos(prev=>prev.filter(x=>x.id!==id))}/>
                    ))}
                  </div>
                ):(
                  <div style={{display:'grid',gap:'8px'}}>
                    {proyItems.map(a=>(
                      <ArchivoRow key={a.id} archivo={a} t={t} onEliminar={id=>setArchivos(prev=>prev.filter(x=>x.id!==id))}/>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ))}

      {archivosFiltrados.length===0&&(
        <Card t={t} style={{textAlign:'center',padding:'40px'}}>
          <div style={{fontSize:'13px',color:c.text3}}>No hay archivos que mostrar</div>
        </Card>
      )}

      {/* FOOTER SUPABASE */}
      <Card t={t} style={{padding:'16px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{color:GREEN}}>{I.supabase}</div>
            <div>
              <div style={{fontSize:'13px',fontWeight:700,color:c.text}}>Supabase Storage</div>
              <div style={{fontSize:'11px',color:c.text3}}>Almacenamiento real se activa en Módulo 8</div>
            </div>
          </div>
          <Tag label="PENDIENTE — MÓDULO 8" color={AMBER}/>
        </div>
      </Card>

    </div>
  )
}

function ArchivoCard({archivo,t,onEliminar}:{archivo:Archivo;t:Theme;onEliminar:(id:number)=>void}){
  const c=th(t)
  const color=tipoColor(archivo.tipo)
  return(
    <div className="char-card char-row" style={{
      background:c.s2,border:`1px solid ${c.border}`,borderRadius:'12px',
      padding:'16px',display:'grid',gap:'10px',
      borderTop:`2px solid ${color}`,transition:'all 0.15s',
    }}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div style={{color,padding:'8px',background:color+'15',borderRadius:'8px'}}>{tipoIcon(archivo.tipo)}</div>
        <Tag label={archivo.extension.toUpperCase()} color={color}/>
      </div>
      <div>
        <div style={{fontSize:'13px',fontWeight:700,color:c.text,marginBottom:'4px',lineHeight:'1.3',wordBreak:'break-word'}}>{archivo.nombre}</div>
        <div style={{fontSize:'11px',color:c.text3}}>{archivo.proyecto}</div>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:'10px',color:c.text3}}>{archivo.tamaño} · {new Date(archivo.fecha+'T12:00:00').toLocaleDateString('es-AR',{day:'numeric',month:'short'})}</span>
      </div>
      <div style={{display:'flex',gap:'6px'}}>
        <button className="char-btn" onClick={()=>alert('Descarga real en Módulo 8')} style={{flex:1,background:color+'15',color,border:`1px solid ${color}35`,borderRadius:'7px',padding:'6px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'4px',fontSize:'11px',fontWeight:700,fontFamily:'Rajdhani,sans-serif'}}>
          {I.dl} Descargar
        </button>
        <button className="char-btn" onClick={()=>alert('Compartir real en Módulo 8')} style={{background:c.surface,color:c.text3,border:`1px solid ${c.border}`,borderRadius:'7px',padding:'6px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {I.share}
        </button>
        <button className="char-btn" onClick={()=>onEliminar(archivo.id)} style={{background:'transparent',color:RED,border:`1px solid ${RED}35`,borderRadius:'7px',padding:'6px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {I.trash}
        </button>
      </div>
    </div>
  )
}

function ArchivoRow({archivo,t,onEliminar}:{archivo:Archivo;t:Theme;onEliminar:(id:number)=>void}){
  const c=th(t)
  const color=tipoColor(archivo.tipo)
  return(
    <div className="char-row archivo-row-lista" style={{
  background:c.s2,border:`1px solid ${c.border}`,borderRadius:'10px',
  padding:'14px 16px',display:'flex',alignItems:'center',gap:'14px',
  borderLeft:`3px solid ${color}`,transition:'all 0.15s',
}}>
      <div style={{color,flexShrink:0}}>{tipoIcon(archivo.tipo)}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:'13px',fontWeight:700,color:c.text,marginBottom:'2px'}}>{archivo.nombre}.{archivo.extension}</div>
        <div style={{fontSize:'11px',color:c.text3}}>{archivo.cliente} · {archivo.proyecto} · {new Date(archivo.fecha+'T12:00:00').toLocaleDateString('es-AR',{day:'numeric',month:'short',year:'numeric'})}</div>
      </div>
      <Tag label={archivo.tipo.toUpperCase()} color={color}/>
      <span style={{fontSize:'11px',color:c.text3,flexShrink:0}}>{archivo.tamaño}</span>
      <div style={{display:'flex',gap:'6px',flexShrink:0}}>
        <button className="char-btn" onClick={()=>alert('Descarga real en Módulo 8')} style={{background:color+'15',color,border:`1px solid ${color}35`,borderRadius:'7px',padding:'6px',cursor:'pointer',display:'flex'}}>
          {I.dl}
        </button>
        <button className="char-btn" onClick={()=>alert('Compartir real en Módulo 8')} style={{background:c.surface,color:c.text3,border:`1px solid ${c.border}`,borderRadius:'7px',padding:'6px',cursor:'pointer',display:'flex'}}>
          {I.share}
        </button>
        <button className="char-btn" onClick={()=>onEliminar(archivo.id)} style={{background:'transparent',color:RED,border:`1px solid ${RED}35`,borderRadius:'7px',padding:'6px',cursor:'pointer',display:'flex'}}>
          {I.trash}
        </button>
      </div>
    </div>
  )
}
