'use client'
import { useState, useRef, useCallback, useEffect } from 'react'

// ── TIPOS ──────────────────────────────────────────────────────────────────
interface Clip {
  numero: number
  titulo: string
  gancho: string
  timestamp_inicio: string
  timestamp_fin: string
  duracion_seg: number
  por_que_viral: string
  red_recomendada: string
  copy_caption: string
  subtitulos: string[]
  score_viral: number
}
interface Cliente { id: string; nombre: string }
interface Props {
  theme?: 'dark' | 'light'
  clientes?: Cliente[]
  onUpload?: (file: File) => Promise<{ url: string }>
}

// ── CONSTANTES ─────────────────────────────────────────────────────────────
const GOLD = '#c9a96e'
const FUENTES = ['Rajdhani','Glacial Indifference','Montserrat','Bebas Neue','Oswald','Roboto','Poppins']
const PRESETS = ['#ffffff','#ffcd38','#c9a96e','#00cfff','#3dd68c','#f87171','#a78bfa','#000000']
const TIPOS = ['Podcast','Entrevista','Charla / Keynote','Clase / Tutorial','Reunión','Video de cliente','Otro']
const CLIPS_N = [3,4,5,6,7,8,9,10]
const FORMATOS = [
  '9:16 — TikTok / Reels / Shorts / Stories',
  '1:1 — Instagram Feed / Twitter',
  '4:5 — Instagram Optimizado',
  '16:9 — YouTube / LinkedIn',
  '4:3 — Facebook clásico',
]
const REDES = ['Instagram Reels','TikTok','YouTube Shorts','LinkedIn','Twitter/X','Facebook','Pinterest','Snapchat']
const POSICIONES_SUB = ['Arriba','Centro','Abajo (recomendado)']
const POSICIONES_LOGO = ['Arriba izquierda','Arriba derecha','Abajo izquierda','Abajo derecha','Centro']
const IDIOMAS = ['Español','Inglés','Portugués','Francés','Alemán','Italiano','Japonés','Chino','Árabe','Hindi']

// ── COLORES TEMA ───────────────────────────────────────────────────────────
function useTheme(t: 'dark'|'light') {
  return t === 'dark'
    ? { bg:'#05050f', surface:'#0b0b18', s2:'#111124', border:'#16163a', b2:'#1e1e3a', text:'#f0f0ff', text2:'#9090b8', text3:'#4a4a6a' }
    : { bg:'#eef0f8', surface:'#ffffff', s2:'#f4f6ff', border:'#dde0f0', b2:'#c8cbdf', text:'#0d0d20', text2:'#2a2a4a', text3:'#6060aa' }
}

// ── COLOR PICKER tipo Canva ────────────────────────────────────────────────
function ColorPicker({ color, onChange }: { color: string; onChange: (c: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hue, setHue] = useState(0)
  const [hex, setHex] = useState(color.replace('#',''))
 
  const drawCanvas = useCallback((h: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const w = canvas.width, ht = canvas.height
    const base = `hsl(${h},100%,50%)`
    const gW = ctx.createLinearGradient(0,0,w,0)
    gW.addColorStop(0,'#fff'); gW.addColorStop(1,base)
    ctx.fillStyle = gW; ctx.fillRect(0,0,w,ht)
    const gB = ctx.createLinearGradient(0,0,0,ht)
    gB.addColorStop(0,'transparent'); gB.addColorStop(1,'#000')
    ctx.fillStyle = gB; ctx.fillRect(0,0,w,ht)
  }, [])
 
  // FIX: dibuja el canvas al montar y cuando cambia el hue
  useEffect(() => { drawCanvas(hue) }, [hue, drawCanvas])
 
  const hexToHue = (hexColor: string): number => {
    const r = parseInt(hexColor.slice(0,2),16)/255
    const g = parseInt(hexColor.slice(2,4),16)/255
    const b = parseInt(hexColor.slice(4,6),16)/255
    const max = Math.max(r,g,b), min = Math.min(r,g,b)
    if (max === min) return 0
    const d = max - min
    let h = 0
    if (max === r) h = ((g-b)/d + (g<b?6:0))/6
    else if (max === g) h = ((b-r)/d + 2)/6
    else h = ((r-g)/d + 4)/6
    return Math.round(h * 360)
  }
 
  const pickColor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const x = Math.round((e.clientX-rect.left)*(canvas.width/rect.width))
    const y = Math.round((e.clientY-rect.top)*(canvas.height/rect.height))
    const px = canvas.getContext('2d')!.getImageData(Math.max(0,x),Math.max(0,y),1,1).data
    const h = `#${px[0].toString(16).padStart(2,'0')}${px[1].toString(16).padStart(2,'0')}${px[2].toString(16).padStart(2,'0')}`
    setHex(h.replace('#','')); onChange(h)
  }
 
  // FIX: al clickear preset, sincroniza hue Y redibuja canvas
  const handlePreset = (c: string) => {
    const newHex = c.replace('#','')
    const newHue = hexToHue(newHex)
    setHex(newHex)
    setHue(newHue)
    onChange(c)
    setTimeout(() => drawCanvas(newHue), 10)
  }
 
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <canvas ref={canvasRef} width={220} height={140}
        style={{ width:'100%', borderRadius:8, cursor:'crosshair', border:'1px solid #1e1e3a' }}
        onClick={pickColor}
        onMouseMove={e => { if(e.buttons===1) pickColor(e) }}
      />
      <input type="range" min={0} max={360} value={hue}
        style={{ width:'100%', accentColor:'#c9a96e', cursor:'pointer' }}
        onChange={e => setHue(+e.target.value)}
      />
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:34,height:34,borderRadius:7,background:`#${hex}`,border:'2px solid #333',flexShrink:0 }}/>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:9,color:'#666',letterSpacing:1 }}>HEX</div>
          <input value={`#${hex}`}
            onChange={e => {
              const v=e.target.value.replace('#','')
              setHex(v)
              if(v.length===6){ onChange('#'+v); const h=hexToHue(v); setHue(h); setTimeout(()=>drawCanvas(h),10) }
            }}
            style={{ background:'transparent',border:'none',color:'#fff',fontSize:13,fontWeight:700,fontFamily:'monospace',width:'100%',outline:'none' }}
          />
        </div>
      </div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {PRESETS.map(c => (
          <button key={c} onClick={() => handlePreset(c)}
            style={{ width:32,height:26,borderRadius:6,background:c,border:color===c?`2px solid #c9a96e`:'1px solid #333',cursor:'pointer' }}
          />
        ))}
      </div>
    </div>
  )
}

// ── CLIP CARD ──────────────────────────────────────────────────────────────
function ClipCard({ clip, theme }: { clip: Clip; theme: 'dark'|'light' }) {
  const [open, setOpen] = useState(false)
  const c = useTheme(theme)
  const sc = clip.score_viral >= 85 ? '#3dd68c' : clip.score_viral >= 70 ? GOLD : '#f87171'
  const copy = () => {
    navigator.clipboard.writeText(
      `CLIP ${clip.numero}: ${clip.titulo}\nTimestamps: ${clip.timestamp_inicio} → ${clip.timestamp_fin} (${clip.duracion_seg}s)\n\nGANCHO:\n${clip.gancho}\n\nPOR QUÉ ES VIRAL:\n${clip.por_que_viral}\n\nRED: ${clip.red_recomendada}\n\nCAPTION:\n${clip.copy_caption}\n\nSUBTÍTULOS:\n${clip.subtitulos.join('\n')}`
    )
  }
  return (
    <div style={{ background:c.surface, border:`1px solid ${c.border}`, borderRadius:14, overflow:'hidden', borderTop:`3px solid ${sc}` }}>
      <div style={{ padding:'16px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
              <span style={{ fontSize:9,color:sc,fontWeight:700,letterSpacing:1,background:sc+'20',border:`1px solid ${sc}40`,padding:'2px 8px',borderRadius:20 }}>
                CLIP {clip.numero}
              </span>
              <span style={{ fontSize:9,color:c.text3 }}>{clip.timestamp_inicio} → {clip.timestamp_fin}</span>
              <span style={{ fontSize:9,color:c.text3 }}>{clip.duracion_seg}s</span>
            </div>
            <div style={{ fontSize:15,fontWeight:700,color:c.text,lineHeight:1.3 }}>{clip.titulo}</div>
          </div>
          <div style={{ textAlign:'center', flexShrink:0 }}>
            <div style={{ fontSize:22,fontWeight:800,color:sc,lineHeight:1 }}>{clip.score_viral}</div>
            <div style={{ fontSize:9,color:c.text3 }}>VIRAL</div>
          </div>
        </div>
        <div style={{ background:theme==='dark'?'#161628':'#eef0ff',borderRadius:8,padding:'10px 14px',marginBottom:10 }}>
          <div style={{ fontSize:9,color:GOLD,letterSpacing:1,fontWeight:700,marginBottom:4 }}>GANCHO</div>
          <div style={{ fontSize:13,color:c.text,fontStyle:'italic',lineHeight:1.4 }}>"{clip.gancho}"</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:8, marginBottom:10 }}>
          <div style={{ background:c.s2,border:`1px solid ${c.border}`,borderRadius:8,padding:'8px 12px' }}>
            <div style={{ fontSize:9,color:c.text3,letterSpacing:1,marginBottom:2 }}>RED</div>
            <div style={{ fontSize:12,fontWeight:600,color:c.text }}>{clip.red_recomendada}</div>
          </div>
          <div style={{ background:c.s2,border:`1px solid ${c.border}`,borderRadius:8,padding:'8px 12px' }}>
            <div style={{ fontSize:9,color:c.text3,letterSpacing:1,marginBottom:2 }}>POR QUÉ FUNCIONA</div>
            <div style={{ fontSize:11,color:c.text2,lineHeight:1.4 }}>{clip.por_que_viral}</div>
          </div>
        </div>
        {open && (
          <>
            <div style={{ background:c.s2,border:`1px solid ${c.border}`,borderRadius:8,padding:'10px 14px',marginBottom:10 }}>
              <div style={{ fontSize:9,color:GOLD,letterSpacing:1,fontWeight:700,marginBottom:6 }}>CAPTION</div>
              <div style={{ fontSize:12,color:c.text2,lineHeight:1.5,whiteSpace:'pre-line' }}>{clip.copy_caption}</div>
            </div>
            <div style={{ background:c.s2,border:`1px solid ${c.border}`,borderRadius:8,padding:'10px 14px',marginBottom:10 }}>
              <div style={{ fontSize:9,color:GOLD,letterSpacing:1,fontWeight:700,marginBottom:6 }}>SUBTÍTULOS</div>
              {clip.subtitulos.map((s,i) => (
                <div key={i} style={{ fontSize:12,color:c.text,padding:'3px 0',borderBottom:i<clip.subtitulos.length-1?`1px solid ${c.border}`:'none' }}>
                  {i+1}. {s}
                </div>
              ))}
            </div>
          </>
        )}
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setOpen(!open)} style={{ flex:1,background:'transparent',border:`1px solid ${c.border}`,borderRadius:8,color:c.text2,padding:'7px 0',fontSize:11,cursor:'pointer',fontFamily:'inherit' }}>
            {open ? '▲ Menos' : '▼ Caption y subtítulos'}
          </button>
          <button onClick={copy} style={{ background:GOLD+'20',border:`1px solid ${GOLD}50`,borderRadius:8,color:GOLD,padding:'7px 14px',fontSize:11,cursor:'pointer',fontWeight:700,fontFamily:'inherit' }}>
            📋 Copiar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── EXPORTS ────────────────────────────────────────────────────────────────
function exportCSV(clips: Clip[], sesion: string) {
  const rows = [
    ['Clip','Título','Inicio','Fin','Duración (s)','Score Viral','Red','Gancho','Por qué viral','Caption'],
    ...clips.map(c => [c.numero,c.titulo,c.timestamp_inicio,c.timestamp_fin,c.duracion_seg,c.score_viral,c.red_recomendada,c.gancho,c.por_que_viral,c.copy_caption])
  ]
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(';')).join('\r\n')
  dl(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}), `CHAR_Video_${sesion||'sesion'}.csv`)
}
function exportTXT(clips: Clip[], sesion: string) {
  const lines = [`CHAR CORE — Video Editor IA\nSesión: ${sesion}\nFecha: ${new Date().toLocaleDateString('es-AR')}\n${'═'.repeat(50)}`]
  clips.forEach(c => {
    lines.push(`\nCLIP ${c.numero}: ${c.titulo}`)
    lines.push(`Timestamps: ${c.timestamp_inicio} → ${c.timestamp_fin} (${c.duracion_seg}s)`)
    lines.push(`Score viral: ${c.score_viral}/100 · Red: ${c.red_recomendada}`)
    lines.push(`\nGancho: "${c.gancho}"`)
    lines.push(`\nPor qué viral:\n${c.por_que_viral}`)
    lines.push(`\nCaption:\n${c.copy_caption}`)
    lines.push(`\nSubtítulos:\n${c.subtitulos.map((s,i)=>`${i+1}. ${s}`).join('\n')}`)
    lines.push(`\n${'─'.repeat(40)}`)
  })
  dl(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8;'}), `CHAR_Video_${sesion||'sesion'}.txt`)
}
function dl(blob: Blob, name: string) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click()
}

// ── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────
export default function VideoEditor({ theme = 'dark', clientes = [], onUpload }: Props) {
  const c = useTheme(theme)

  // Estado — tab
  const [tab, setTab] = useState<'procesar'|'historial'>('procesar')

  // Estado — fuente de video
  const [inputTipo, setInputTipo] = useState<'archivo'|'youtube'>('archivo')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [videoFile, setVideoFile] = useState<File|null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Estado — configuración
  const [sesion, setSesion] = useState('')
  const [clienteId, setClienteId] = useState(clientes[0]?.id || '')
  const [tipo, setTipo] = useState('Podcast')
  const [cantidad, setCantidad] = useState(3)
  const [formato, setFormato] = useState(FORMATOS[0])
  const [idioma, setIdioma] = useState('Español')
  const [traducir, setTraducir] = useState(false)
  const [idiomaDestino, setIdiomaDestino] = useState('Inglés')

  // Estado — subtítulos
  const [fuente, setFuente] = useState('Rajdhani')
  const [colorSub, setColorSub] = useState('#ffffff')
  const [posSub, setPosSub] = useState('Abajo (recomendado)')
  const [posLogo, setPosLogo] = useState('Arriba derecha')

  // Estado — procesamiento
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('')
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState<{clips:Clip[];resumen:string;palabras:number}|null>(null)
  const [historial, setHistorial] = useState<{sesion:string;clips:Clip[];fecha:string}[]>([])

  // ── Manejo de archivo ────────────────────────────────────────────────────
  const handleFile = (f: File) => {
    const ok = ['video/mp4','video/mov','video/avi','video/webm','video/quicktime','audio/mpeg','audio/mp4','audio/m4a','audio/wav','audio/x-m4a']
    if (!ok.some(t => f.type.includes(t.split('/')[1]))) {
      setError('Formato no soportado. Usá MP4, MOV, AVI, MP3 o M4A.'); return
    }
    if (f.size > 500 * 1024 * 1024) {
      setError('Archivo muy grande. Máximo 500MB.'); return
    }
    setVideoFile(f); setError(''); setInputTipo('archivo')
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  // ── Procesamiento principal ──────────────────────────────────────────────
  const procesar = async () => {
    setError(''); setResultado(null); setLoading(true)
    try {
      let urlFinal = videoUrl

      // 1. Subir archivo si corresponde
      if (inputTipo === 'archivo') {
        if (!videoFile) throw new Error('Seleccioná un archivo primero')
        setStep('Subiendo video a almacenamiento...')
        if (!onUpload) throw new Error('Función de upload no disponible. Recargá la página.')
        const r = await onUpload(videoFile)
        if (!r?.url) throw new Error('Error al subir el archivo. Verificá la conexión con R2.')
        urlFinal = r.url
      } else {
        if (!youtubeUrl.trim()) throw new Error('Pegá el link de YouTube primero')
        urlFinal = youtubeUrl.trim()
      }

      // 2. Transcribir
      setStep('Transcribiendo con Deepgram...')
      const transcRes = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlFinal, tipo_input: inputTipo, idioma })
      })
      if (!transcRes.ok) {
        const e = await transcRes.json().catch(() => ({}))
        throw new Error(e.error || 'Error al transcribir')
      }
      const transcData = await transcRes.json()
      const transcript: string = transcData.transcript || ''
      if (transcript.length < 50) throw new Error('No se pudo obtener la transcripción. Verificá que el video tenga audio claro.')

// subir video primero
let urlFinal = url

if (videoFile) {
  const form = new FormData()
  form.append("file", videoFile)

  const upload = await fetch("/api/upload", {
    method: "POST",
    body: form
  })

  const data = await upload.json()
  urlFinal = data.url
}
      
      // 3. Detectar clips virales
      setStep(`Detectando ${cantidad} clips virales con IA...`)
      const analysisRes = await fetch('/api/video-editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
  url: urlFinal,
  tipo_input: 'transcript',
  transcript,
  config: { cantidad, tipo, formato, idioma, traducir, idiomaDestino }
})
      })
      if (!analysisRes.ok) {
        const e = await analysisRes.json().catch(() => ({}))
        throw new Error(e.error || 'Error al analizar clips')
      }
      const data = await analysisRes.json()
      setResultado(data)
      setHistorial(prev => [{ sesion: sesion || 'Sesión sin nombre', clips: data.clips, fecha: new Date().toLocaleDateString('es-AR') }, ...prev.slice(0,9)])

    } catch (e: any) {
      setError(e.message || 'Error desconocido')
    } finally {
      setLoading(false); setStep('')
    }
  }

  // ── Helpers de estilo ────────────────────────────────────────────────────
  const card  = (extra: React.CSSProperties = {}): React.CSSProperties => ({ background:c.surface, border:`1px solid ${c.border}`, borderRadius:14, padding:22, ...extra })
  const lbl   = (): React.CSSProperties => ({ fontSize:9, color:c.text3, letterSpacing:'2px', fontWeight:700, marginBottom:6, display:'block' })
  const sel   = (): React.CSSProperties => ({ width:'100%', background:c.s2, border:`1px solid ${c.border}`, borderRadius:8, color:c.text, padding:'10px 14px', fontSize:13, cursor:'pointer', fontFamily:'inherit', outline:'none' })
  const inp   = (): React.CSSProperties => ({ width:'100%', background:c.s2, border:`1px solid ${c.border}`, borderRadius:8, color:c.text, padding:'10px 14px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' })

  return (
    <div style={{ display:'grid', gap:28 }}>

      {/* ── HEADER ── */}
      <div>
        <div style={{ fontSize:9, color:c.text3, letterSpacing:3, fontWeight:700, marginBottom:4 }}>INTELIGENCIA ARTIFICIAL</div>
        <h1 style={{ fontSize:28, fontWeight:800, margin:'0 0 6px', color:c.text }}>Video Editor IA</h1>
        <p style={{ fontSize:12, color:c.text3, margin:0 }}>
          Convertí videos largos en clips virales · Transcripción con Deepgram · Análisis con Groq
        </p>
      </div>

      {/* ── MÉTRICAS ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        {[
          { label:'HORAS AHORRADAS', val:'20+', sub:'por semana estimadas', color:'#3dd68c' },
          { label:'CLIPS GENERADOS', val: resultado ? String(resultado.clips.length) : '0', sub:'en esta sesión', color:GOLD },
          { label:'TRANSCRIPCIÓN', val:'DEEPGRAM', sub:'Hasta 200h/mes gratis', color:'#4f8fff' },
          { label:'ANÁLISIS VIRAL', val:'GROQ', sub:'LLaMA 3.3 · gratis', color:'#a78bfa' },
        ].map((m,i) => (
          <div key={i} style={{ ...card(), position:'relative', overflow:'hidden', padding:18 }}>
            <div style={{ position:'absolute', top:0, right:0, width:60, height:60, background:`radial-gradient(circle at top right,${m.color}15,transparent 70%)` }}/>
            <div style={{ fontSize:9, color:c.text3, letterSpacing:2, fontWeight:700, marginBottom:8 }}>{m.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:m.color, lineHeight:1, marginBottom:4 }}>{m.val}</div>
            <div style={{ fontSize:10, color:c.text3 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div style={{ display:'flex', gap:10 }}>
        {(['procesar','historial'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab===t ? GOLD : c.s2,
            color: tab===t ? '#05050f' : c.text2,
            border: `1px solid ${tab===t ? GOLD : c.border}`,
            borderRadius:8, padding:'8px 20px', fontSize:12, fontWeight:700,
            cursor:'pointer', fontFamily:'inherit',
            boxShadow: tab===t ? `0 4px 16px ${GOLD}40` : 'none'
          }}>
            {t === 'procesar' ? '⚡ Procesar Video' : '📋 Historial'}
          </button>
        ))}
      </div>

      {/* ── HISTORIAL ── */}
      {tab === 'historial' && (
        <div style={card()}>
          <div style={{ fontSize:9, color:c.text3, letterSpacing:3, fontWeight:700, marginBottom:16 }}>SESIONES ANTERIORES</div>
          {historial.length === 0
            ? <div style={{ textAlign:'center', padding:'40px 0', color:c.text3, fontSize:13 }}>No hay sesiones aún.</div>
            : historial.map((h,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom: i<historial.length-1 ? `1px solid ${c.border}` : 'none' }}>
                <div>
                  <div style={{ fontSize:13, color:c.text, fontWeight:600 }}>{h.sesion}</div>
                  <div style={{ fontSize:11, color:c.text3 }}>{h.clips.length} clips · {h.fecha}</div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => exportCSV(h.clips, h.sesion)} style={{ background:'transparent', border:`1px solid ${c.border}`, borderRadius:7, color:c.text2, padding:'5px 10px', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>CSV</button>
                  <button onClick={() => exportTXT(h.clips, h.sesion)} style={{ background:'transparent', border:`1px solid ${c.border}`, borderRadius:7, color:c.text2, padding:'5px 10px', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>TXT</button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* ── PROCESAR ── */}
      {tab === 'procesar' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

          {/* ── COLUMNA IZQUIERDA ── */}
          <div style={{ display:'grid', gap:16 }}>

            {/* Fuente de video */}
            <div style={card()}>
              <div style={{ fontSize:9, color:c.text3, letterSpacing:3, fontWeight:700, marginBottom:14 }}>FUENTE DE VIDEO</div>
              <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                {(['archivo','youtube'] as const).map(t => (
                  <button key={t} onClick={() => setInputTipo(t)} style={{
                    flex:1, background: inputTipo===t ? GOLD+'20' : c.s2,
                    border: `1px solid ${inputTipo===t ? GOLD : c.border}`,
                    borderRadius:8, color: inputTipo===t ? GOLD : c.text2,
                    padding:'8px 0', fontSize:12, fontWeight: inputTipo===t ? 700 : 500,
                    cursor:'pointer', fontFamily:'inherit'
                  }}>
                    {t === 'archivo' ? '📁 Archivo local' : '🔗 YouTube'}
                  </button>
                ))}
              </div>

              {inputTipo === 'archivo' ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragging ? GOLD : videoFile ? '#3dd68c' : c.border}`,
                    borderRadius:10, padding:'32px 20px', textAlign:'center',
                    cursor:'pointer', background: dragging ? GOLD+'08' : c.s2,
                    transition:'all 0.2s'
                  }}>
                  <input ref={fileRef} type="file" accept="video/*,audio/*" style={{ display:'none' }}
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  {videoFile ? (
                    <>
                      <div style={{ fontSize:28, marginBottom:8 }}>✅</div>
                      <div style={{ fontSize:13, color:'#3dd68c', fontWeight:700 }}>{videoFile.name}</div>
                      <div style={{ fontSize:11, color:c.text3, marginTop:4 }}>
                        {(videoFile.size/1024/1024).toFixed(1)} MB · Click para cambiar
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize:36, marginBottom:10, color:c.text3 }}>🎬</div>
                      <div style={{ fontSize:14, color:c.text2, fontWeight:600 }}>Arrastrá tu video acá</div>
                      <div style={{ fontSize:11, color:c.text3, marginTop:6 }}>MP4, MOV, AVI, MP3, M4A · Hasta 500MB</div>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <label style={lbl()}>URL DE YOUTUBE</label>
                  <input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    style={inp()} />
                  <div style={{ fontSize:10, color:c.text3, marginTop:6 }}>
                    El video necesita subtítulos automáticos activados en YouTube
                  </div>
                </div>
              )}
            </div>

            {/* Configuración general */}
            <div style={card()}>
              <div style={{ fontSize:9, color:c.text3, letterSpacing:3, fontWeight:700, marginBottom:16 }}>CONFIGURACIÓN GENERAL</div>
              <div style={{ display:'grid', gap:14 }}>
                <div>
                  <label style={lbl()}>NOMBRE DE SESIÓN</label>
                  <input value={sesion} onChange={e => setSesion(e.target.value)}
                    placeholder="Ej: Podcast Ep.15 — Mayo 2026"
                    style={inp()} />
                </div>
                <div>
                  <label style={lbl()}>CLIENTE</label>
                  <select value={clienteId} onChange={e => setClienteId(e.target.value)} style={sel()}>
                    {clientes.map(cl => <option key={cl.id} value={cl.id}>{cl.nombre}</option>)}
                    {clientes.length === 0 && <option value="">Sin clientes cargados</option>}
                  </select>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div>
                    <label style={lbl()}>TIPO DE CONTENIDO</label>
                    <select value={tipo} onChange={e => setTipo(e.target.value)} style={sel()}>
                      {TIPOS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl()}>CLIPS A DETECTAR</label>
                    <select value={cantidad} onChange={e => setCantidad(+e.target.value)} style={sel()}>
                      {CLIPS_N.map(n => <option key={n} value={n}>{n} clips</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={lbl()}>FORMATO DE EXPORTACIÓN</label>
                  <select value={formato} onChange={e => setFormato(e.target.value)} style={sel()}>
                    {FORMATOS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl()}>IDIOMA DEL VIDEO</label>
                  <select value={idioma} onChange={e => setIdioma(e.target.value)} style={sel()}>
                    {IDIOMAS.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:c.s2, border:`1px solid ${c.border}`, borderRadius:8, padding:'10px 14px' }}>
                  <div>
                    <div style={{ fontSize:12, color:c.text, fontWeight:600 }}>Traducir subtítulos</div>
                    <div style={{ fontSize:10, color:c.text3 }}>Genera versión en otro idioma</div>
                  </div>
                  <button onClick={() => setTraducir(!traducir)} style={{
                    width:44, height:24, borderRadius:12, cursor:'pointer',
                    background: traducir ? GOLD : c.border, border:'none',
                    position:'relative', transition:'background 0.2s'
                  }}>
                    <span style={{ position:'absolute', top:2, left: traducir ? 22 : 2, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }}/>
                  </button>
                </div>
                {traducir && (
                  <div>
                    <label style={lbl()}>IDIOMA DESTINO</label>
                    <select value={idiomaDestino} onChange={e => setIdiomaDestino(e.target.value)} style={sel()}>
                      {IDIOMAS.filter(i => i !== idioma).map(i => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Subtítulos */}
            <div style={card()}>
              <div style={{ fontSize:9, color:c.text3, letterSpacing:3, fontWeight:700, marginBottom:16 }}>SUBTÍTULOS Y ESTILO</div>
              <div style={{ display:'grid', gap:16 }}>
                <div>
                  <label style={lbl()}>TIPOGRAFÍA</label>
                  <div style={{ display:'grid', gap:6 }}>
                    {FUENTES.map(f => (
                      <button key={f} onClick={() => setFuente(f)} style={{
                        background: fuente===f ? GOLD+'20' : c.s2,
                        border: `1px solid ${fuente===f ? GOLD : c.border}`,
                        borderRadius:8, color: fuente===f ? GOLD : c.text2,
                        padding:'8px 14px', fontSize:13, cursor:'pointer',
                        fontFamily: f, textAlign:'left', fontWeight: fuente===f ? 700 : 400
                      }}>
                        {f}
                        <span style={{ float:'right', fontSize:11, opacity:0.6, fontFamily:'Rajdhani' }}>Aa Bb Cc</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={lbl()}>COLOR DE SUBTÍTULOS</label>
                  <ColorPicker color={colorSub} onChange={setColorSub} />
                </div>
                <div>
                  <label style={lbl()}>POSICIÓN SUBTÍTULOS</label>
                  <select value={posSub} onChange={e => setPosSub(e.target.value)} style={sel()}>
                    {POSICIONES_SUB.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl()}>POSICIÓN LOGO DEL CLIENTE</label>
                  <select value={posLogo} onChange={e => setPosLogo(e.target.value)} style={sel()}>
                    {POSICIONES_LOGO.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── COLUMNA DERECHA ── */}
          <div style={{ display:'grid', gap:16, alignContent:'start' }}>

            {/* Preview subtítulos */}
            <div style={{ background:'#000', border:`1px solid ${c.border}`, borderRadius:14, padding:20 }}>
              <div style={{ fontSize:9, color:c.text3, letterSpacing:2, fontWeight:700, marginBottom:12 }}>PREVIEW DE SUBTÍTULOS</div>
              <div style={{ background:'#111', borderRadius:8, padding:'28px 16px', textAlign:'center', minHeight:90, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:6 }}>
                <div style={{ fontSize:20, fontWeight:800, color:colorSub, fontFamily:`'${fuente}', sans-serif`, textShadow:'0 2px 8px #00000099', transition:'all 0.3s' }}>
          Así se verán los subtítulos
        </div>
        <div style={{ fontSize:10, color:'#666', fontFamily:'Rajdhani,sans-serif' }}>{fuente} · {colorSub} · {posSub}</div>
              </div>
            </div>

            {/* Redes sociales de exportación */}
            <div style={card()}>
              <div style={{ fontSize:9, color:c.text3, letterSpacing:3, fontWeight:700, marginBottom:12 }}>REDES DE EXPORTACIÓN</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {REDES.map(r => (
                  <div key={r} style={{ background:c.s2, border:`1px solid ${c.border}`, borderRadius:20, padding:'4px 12px', fontSize:11, color:c.text2 }}>
                    {r}
                  </div>
                ))}
              </div>
              <div style={{ fontSize:10, color:c.text3, marginTop:10 }}>
                Los clips se exportan en el formato seleccionado, listos para cada red.
              </div>
            </div>

            {/* Botón procesar */}
            <button onClick={procesar} disabled={loading} style={{
              background: loading ? c.border : `linear-gradient(135deg,${GOLD},#8b6010)`,
              color: loading ? c.text3 : '#05050f',
              border:'none', borderRadius:10, padding:'16px 20px',
              fontSize:15, fontWeight:800, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily:'inherit', letterSpacing:'0.5px',
              boxShadow: loading ? 'none' : `0 6px 20px ${GOLD}40`,
              transition:'all 0.2s'
            }}>
              {loading ? `⏳ ${step || 'Procesando...'}` : `⚡ Detectar ${cantidad} clips virales`}
            </button>

            {/* Error */}
            {error && (
              <div style={{ background:'#f8717120', border:'1px solid #f8717150', borderRadius:10, padding:'14px 18px', color:'#f87171', fontSize:13 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Resultados */}
            {resultado && (
              <div style={{ display:'grid', gap:12 }}>
                <div style={{ ...card(), borderLeft:`3px solid ${GOLD}` }}>
                  <div style={{ fontSize:9, color:GOLD, letterSpacing:2, fontWeight:700, marginBottom:8 }}>ANÁLISIS GENERAL</div>
                  <div style={{ fontSize:13, color:c.text2, lineHeight:1.5 }}>{resultado.resumen}</div>
                  <div style={{ fontSize:10, color:c.text3, marginTop:8 }}>
                    {resultado.palabras?.toLocaleString()} palabras · {resultado.clips.length} clips detectados
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => exportCSV(resultado.clips, sesion)}
                    style={{ flex:1, background:c.s2, border:`1px solid ${c.border}`, borderRadius:8, color:c.text2, padding:'9px 0', fontSize:12, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
                    📊 Exportar CSV
                  </button>
                  <button onClick={() => exportTXT(resultado.clips, sesion)}
                    style={{ flex:1, background:c.s2, border:`1px solid ${c.border}`, borderRadius:8, color:c.text2, padding:'9px 0', fontSize:12, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
                    📄 Exportar TXT
                  </button>
                </div>
                {resultado.clips.map(clip => (
                  <ClipCard key={clip.numero} clip={clip} theme={theme} />
                ))}
              </div>
            )}

            {!resultado && !loading && !error && (
              <div style={{ ...card(), minHeight:220, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:`1px dashed ${c.b2}` }}>
                <div style={{ fontSize:40, marginBottom:14, opacity:0.3 }}>🎬</div>
                <div style={{ fontSize:13, color:c.text3, textAlign:'center', lineHeight:1.6 }}>
                  Subí un video o pegá un link de YouTube<br/>y hacé clic en "Detectar clips virales"
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
