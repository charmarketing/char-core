'use client'
import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

let ffmpeg: any = null

async function loadFFmpeg() {
  if (typeof window === "undefined") return null
  const { FFmpeg } = await import("@ffmpeg/ffmpeg")

  if (!ffmpeg) {
    ffmpeg = new FFmpeg()
    await ffmpeg.load()
  }

  return ffmpeg
}

type Theme = 'dark' | 'light'

const D = { bg:'#05050f',surface:'#0b0b18',s2:'#111124',border:'#16163a',b2:'#1e1e3a',text:'#f0f0ff',text2:'#9090b8',text3:'#4a4a6a',muted:'#2a2a4a' }
const L = { bg:'#eef0f8',surface:'#ffffff',s2:'#f4f6ff',border:'#dde0f0',b2:'#c8cbdf',text:'#0d0d20',text2:'#2a2a4a',text3:'#606088',muted:'#9090aa' }
const th = (t:Theme)=> t==='dark'?D:L

const GOLD='#ffcd38'
const BLUE='#4f8fff'
const GREEN='#3dd68c'
const RED='#f87171'
const AMBER='#f59e0b'
const PURPLE='#a78bfa'

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
    primary:{background:`linear-gradient(135deg,${GOLD},#cc8800)`,color:'#050510',border:'none',fontWeight:700,boxShadow:`0 4px 16px ${GOLD}40`},
    ghost:{background:c.s2,color:c.text2,border:`1px solid ${c.border}`,fontWeight:500},
    outline:{background:'transparent',color:GOLD,border:`1px solid ${GOLD}55`,fontWeight:600},
    danger:{background:'transparent',color:RED,border:`1px solid ${RED}55`,fontWeight:600},
  }
  return(
    <button className="char-btn" onClick={onClick} disabled={disabled}
      style={{
        ...vs[v],
        padding:'8px 16px',
        borderRadius:'8px',
        fontSize:'12px',
        cursor:disabled?'not-allowed':'pointer',
        display:'flex',
        alignItems:'center',
        gap:'6px',
        letterSpacing:'0.3px',
        transition:'all 0.15s',
        fontFamily:'Rajdhani,sans-serif',
        opacity:disabled?0.5:1
      }}>
      {children}
    </button>
  )
}

type EstadoProceso = 'idle'|'subiendo'|'analizando'|'detectando'|'cortando'|'completado'
type Tab = 'procesar'|'historial'

type Clip = {
  id:number
  titulo:string
  gancho:string
  duracion:string
  inicio:string
  fin:string
  score:number
  motivo:string
  cliente:string
  red_recomendada:string
  copy_caption:string
  subtitulos:string[]
}

export default function VideoEditor({t,clientes=[]}:{t:Theme,clientes?:any[]}){

  const c=th(t)

  const [youtubeUrl,setYoutubeUrl]=useState("")
  const [clips,setClips]=useState<Clip[]>([])
  const [tab,setTab]=useState<Tab>('procesar')

  const [estado,setEstado]=useState<EstadoProceso>('idle')
  const [pasoActual,setPasoActual]=useState(0)

  const [errorMsg,setErrorMsg]=useState("")
  const [resumen,setResumen]=useState("")
  const [transcriptPreview,setTranscriptPreview]=useState("")

  const [tipoInput,setTipoInput]=useState<'youtube'|'archivo'>('youtube')

  const [archivoFile,setArchivoFile]=useState<File|null>(null)

  const inputRef=useRef<HTMLInputElement>(null)

  const clientesNombres=clientes.map((cl:any)=>cl.nombre)

  const [config,setConfig]=useState({
    cliente:'',
    tipoContenido:'Podcast',
    nombreSesion:'',
    clipsCantidad:'5',
    formato:'9:16',
    formatoExport:'MP4 (recomendado)',
    traducir:false,
    idioma:'Inglés',
    tipografia:'Rajdhani',
    colorSub:'#ffffff',
    posicionSub:'Abajo (recomendado)',
    posicionLogo:'Arriba derecha',
  })

  async function detectarClips(){

    if(!youtubeUrl.trim()){
      setErrorMsg("Ingresá una URL válida")
      return
    }

    try{

      setEstado('analizando')
      setPasoActual(2)

      const res=await fetch("/api/video-editor",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          tipo_input:"youtube",
          youtube_url:youtubeUrl,
          config:{
            cantidad:3,
            tipo:"Podcast",
            formato:"9:16",
            idioma:"Español"
          }
        })
      })

      const data=await res.json()

      if(data?.clips){
        setClips(data.clips)
      }

      setEstado('completado')
      setPasoActual(5)

    }catch(err:any){
      setErrorMsg(err.message || "Error procesando")
      setEstado('idle')
      setPasoActual(0)
    }

  }

  const procesarVideo=async()=>{

    setErrorMsg('')
    setClips([])
    setTranscriptPreview('')
    setResumen('')

    if(tipoInput==='youtube' && !youtubeUrl.trim()){
      setErrorMsg('Ingresá una URL de YouTube válida')
      return
    }

    if(tipoInput==='archivo' && !archivoFile){
      setErrorMsg('Subí un archivo primero')
      return
    }

    try{

      let transcript=''

      if(tipoInput==='youtube'){

        setEstado('analizando')
        setPasoActual(2)

        const res=await fetch('/api/video-editor',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            tipo_input:'youtube',
            youtube_url:youtubeUrl,
            config:{
              cantidad:parseInt(config.clipsCantidad),
              tipo:config.tipoContenido,
              formato:config.formato,
              idioma:'Español'
            }
          })
        })

        const data=await res.json()

        if(!res.ok){
          throw new Error(data.error || 'Error al procesar YouTube')
        }

        setTranscriptPreview(data.transcript_preview || '')
        setResumen(data.resumen || '')

        const clipsF:Clip[]=(data.clips || []).map((cl:any,i:number)=>({
          id:i+1,
          titulo:cl.titulo,
          gancho:cl.gancho,
          duracion:`${cl.duracion_seg}s`,
          inicio:cl.timestamp_inicio,
          fin:cl.timestamp_fin,
          score:cl.score_viral,
          motivo:cl.por_que_viral,
          cliente:config.cliente,
          red_recomendada:cl.red_recomendada,
          copy_caption:cl.copy_caption,
          subtitulos:cl.subtitulos || []
        }))

        setClips(clipsF)
        setEstado('completado')
        setPasoActual(5)

        return
      }

      setEstado('analizando')
      setPasoActual(2)

      const formData=new FormData()
      formData.append('file',archivoFile!)

      const dgRes=await fetch('/api/deepgram',{method:'POST',body:formData})

      const dgData=await dgRes.json()

      if(!dgRes.ok){
        throw new Error(dgData.error || 'Error al transcribir')
      }

      transcript=dgData.transcript

      setTranscriptPreview(transcript.slice(0,300)+'...')

      setEstado('detectando')
      setPasoActual(3)

      const grRes=await fetch('/api/video-editor',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          tipo_input:'transcript',
          transcript,
          config:{
            cantidad:parseInt(config.clipsCantidad),
            tipo:config.tipoContenido,
            formato:config.formato,
            idioma:'Español'
          }
        })
      })

      const grData=await grRes.json()

      if(!grRes.ok){
        throw new Error(grData.error || 'Error al analizar con IA')
      }

      setResumen(grData.resumen || '')

     const clipsF:Clip[]=(grData.clips || []).map((c:any,i:number)=>({
  id: i,
  titulo: c.titulo,
  gancho: c.gancho,
  duracion: `${c.duracion_seg}s`,
  inicio: c.timestamp_inicio,
  final: c.timestamp_fin,
  score: c.score_viral,
  motivo: c.por_que_viral,
  cliente: config.cliente,
  red_recomendada: c.red_recomendada,
  copy_caption: c.copy_caption,
  subtitulos: c.subtitulos || []
}))

      setClips(clipsF)

      setPasoActual(5)
      setEstado('completado')
}
    
    catch(err:any){
  setErrorMsg(err.message || 'Error al procesar')

  setEstado('idle')
  setPasoActual(0)
};

const inputSt: React.CSSProperties = {
    background: c.s2,
    color: c.text,
    border: `1px solid ${c.border}`,
    borderRadius: '10px',
    padding: '10px 14px',
    fontFamily: 'Rajdhani, sans-serif',
    fontSize: '13px',
    outline: 'none',
    width: '100%'
  }

  return (

    <div className="char-fade" style={{display:'grid',gap:'28px'}}>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:'12px'}}>

        <div>
          <Eb text="INTELIGENCIA ARTIFICIAL" t={t}/>
          <h1 style={{fontSize:'28px',fontWeight:800,margin:0,color:c.text}}>
            Video Editor IA
          </h1>
          <div style={{fontSize:'12px',color:c.text3,marginTop:'4px'}}>
            Convertí cualquier video largo en clips virales automáticamente
          </div>
        </div>

      <div style={{
  fontSize:'11px',
  padding:'4px 8px',
  borderRadius:'6px',
  background:AMBER,
  color:'#000',
  fontWeight:600
}}>
  MODO DEMO
</div>

      </div>

      <div style={{display:'flex',gap:'8px'}}>

        <button
          onClick={()=>setTab('procesar')}
          className="char-btn"
          style={{
            background:tab==='procesar'?`linear-gradient(135deg,${GOLD},#cc8800)`:c.s2,
            color:tab==='procesar'?'#050510':c.text2,
            border:tab==='procesar'?'none':`1px solid ${c.border}`,
            borderRadius:'10px',
            padding:'10px 16px',
            cursor:'pointer',
            fontSize:'12px',
            fontWeight:700,
            fontFamily:'Rajdhani,sans-serif'
          }}
        >
          Procesar Video
        </button>

        <button
          onClick={()=>setTab('historial')}
          className="char-btn"
          style={{
            background:tab==='historial'?`linear-gradient(135deg,${GOLD},#cc8800)`:c.s2,
            color:tab==='historial'?'#050510':c.text2,
            border:tab==='historial'?'none':`1px solid ${c.border}`,
            borderRadius:'10px',
            padding:'10px 16px',
            cursor:'pointer',
            fontSize:'12px',
            fontWeight:700,
            fontFamily:'Rajdhani,sans-serif'
          }}
        >
          Historial
        </button>

      </div>

      {tab==='procesar' && (

        <Card t={t}>

          <Eb text="LINK DE YOUTUBE" t={t}/>

          "use client"

import { useState } from "react"

export default function VideoUpload() {

  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState("")

  async function handleUpload(file: File) {

    setUploading(true)
    setFileName(file.name)

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    })

    const data = await res.json()

    console.log("VIDEO URL:", data)

    setUploading(false)
  }

  function handleDrop(e:any){
    e.preventDefault()

    const file = e.dataTransfer.files[0]

    if(file){
      handleUpload(file)
    }
  }

  return (

    <div
      onDrop={handleDrop}
      onDragOver={(e)=>e.preventDefault()}
      className="border-2 border-dashed border-gray-600 rounded-xl p-20 text-center cursor-pointer"
    >

      {uploading ? (

        <p>Subiendo {fileName}...</p>

      ) : (

        <p>Arrastra tu video aquí</p>

      )}

    </div>

  )
}

          {errorMsg && (
            <div style={{
              marginTop:'10px',
              padding:'10px 14px',
              background:RED+'15',
              border:`1px solid ${RED}40`,
              borderRadius:'8px',
              fontSize:'12px',
              color:RED
            }}>
              {errorMsg}
            </div>
          )}

        </Card>

      )}

      {clips.length>0 && (

        <Card t={t}>

          <Eb text="CLIPS DETECTADOS" t={t}/>

          <div style={{display:'grid',gap:'8px'}}>

            {clips.map((clip)=>(
              <div key={clip.id} style={{
                padding:'10px',
                border:`1px solid ${c.border}`,
                borderRadius:'8px'
              }}>
                <div style={{fontWeight:700,color:c.text}}>
                  {clip.titulo}
                </div>
                <div style={{fontSize:'12px',color:c.text3}}>
                  {clip.motivo}
                </div>
              </div>
            ))}

          </div>

        </Card>

      )}

    </div>

  )
}
