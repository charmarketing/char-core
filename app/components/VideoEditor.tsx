'use client'
import { useState, useRef, useEffect } from 'react'
import { useGlobal } from '../context/GlobalContext' 

// ── CONSTANTES DE CONFIGURACIÓN Y DIRECCIÓN DE ARTE ───────────────────────
const GOLD = '#D4AF37'; 
const SUCCESS = '#3dd68c';
const ERROR = '#f87171';
const PRESETS = ['#ffffff','#ffcd38','#c9a96e','#00cfff','#3dd68c','#f87171','#a78bfa','#000000']
const TIPOS = ['Podcast B2B','Entrevista Autoridad','Charla / Keynote','Clase High Ticket','Video de cliente Corporativo','Caso de Estudio']
const CLIPS_N = [3,4,5,6,7,8,9,10]
const IDIOMAS = ['Español', 'Inglés', 'Portugués', 'Italiano', 'Alemán']
const FORMATOS = [
  {id: '9:16', name: '9:16 — TikTok / Reels / Shorts', aspectRatio: 9/16, red: 'Vertical'},
  {id: '16:9', name: '16:9 — YouTube / LinkedIn', aspectRatio: 16/9, red: 'Horizontal'},
]

// ── INTERFACES ESTRATÉGICAS UNIFICADAS ────────────────────────────────────
interface Clip {
  numero: number;
  titulo: string;
  gancho_viral_options: string[]; 
  copy_caption_professional: string; 
  justificacion_estrategica: string; 
  timestamp_inicio: string; 
  timestamp_fin: string; 
  duracion_seg: number;
  red_recomendada: string;
  subtitulos: string[];
  subtitulos_traducidos?: string[];
  score_viral: number;
  portada_prompt_ia: string;
  portada_texto_impacto: string;
}

interface Cliente { 
  id: string; 
  nombre: string; 
  nicho: string; 
  dolor_principal: string; 
}

interface Props {
  theme?: 'dark' | 'light'
  clientes?: Cliente[] 
  onUpload?: (file: File, clientData?: Cliente) => Promise<{ url: string }>
}

function useTheme(t: 'dark'|'light') {
  return t === 'dark'
    ? { bg:'#05050f', surface:'#0b0b18', s2:'#111124', border:'#16163a', b2:'#1e1e3a', text:'#f0f0ff', text2:'#9090b8', text3:'#4a4a6a' }
    : { bg:'#eef0f8', surface:'#ffffff', s2:'#f4f6ff', border:'#dde0f0', b2:'#c8cbdf', text:'#0d0d20', text2:'#2a2a4a', text3:'#6060aa' }
}

// ── COMPONENTE CLIP CARD (VISTA RESUMIDA) ─────────────────────────────────
function ClipCard({ 
  clip, 
  theme, 
  handlePreviewClip,
  videoDuration,
  setActiveClip,
  setModalOpen
}: { 
  clip: Clip; 
  theme: 'dark' | 'light'; 
  handlePreviewClip: (inicio: string, fin: string) => void;
  videoDuration: number; 
  setActiveClip: (clip: Clip) => void;
  setModalOpen: (open: boolean) => void;
}) {
  const c = useTheme(theme);
  
  const parseToSecondsHelper = (timeStr: string) => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] || 0;
  };

  const inicioSeg = parseToSecondsHelper(clip.timestamp_inicio);
  const isInvalidTimestamp = inicioSeg > videoDuration && videoDuration > 0;
  const sc = isInvalidTimestamp ? ERROR : (clip.score_viral >= 85 ? SUCCESS : (clip.score_viral >= 70 ? GOLD : ERROR));

  return (
    <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, borderLeft: `4px solid ${sc}`, transition:'all 0.2s', marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: GOLD }}>CLIP #{clip.numero}</span>
        <span style={{ fontSize: 11, background: `${sc}20`, color: sc, padding: '2px 8px', borderRadius: 20, fontWeight: 800 }}>{clip.score_viral} PTS</span>
      </div>

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px', color: c.text }}>{clip.titulo}</h3>
        <p style={{ fontSize: 12, color: c.text2, margin: 0 }}>⏱️ <strong>{clip.timestamp_inicio} - {clip.timestamp_fin}</strong> ({clip.duracion_seg}s)</p>
        <span style={{ fontSize: 11, color: c.text3, marginTop: 4, display: 'block' }}>Red sugerida: <strong>{clip.red_recomendada}</strong></span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button onClick={() => handlePreviewClip(clip.timestamp_inicio, clip.timestamp_fin)} style={{ flex: 1, background: c.s2, color: c.text, border: `1px solid ${c.border}`, padding: '6px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          👁️ Ver Clip
        </button>
        <button onClick={() => { setActiveClip(clip); setModalOpen(true); }} style={{ flex: 1, background: GOLD, color: '#000', border: 'none', padding: '6px', borderRadius: 6, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
          ⚡ Ver Estrategia y Portadas
        </button>
      </div>
    </div>
  );
}

// ── COMPONENTE ADVANCED COLOR PICKER ──────────────────────────────────────
function ColorPicker({ color, onChange }: { color: string; onChange: (c: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hue, setHue] = useState(0)
  const [hex, setHex] = useState(color.replace('#',''))
  const drawCanvas = (h: number) => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d')!; const w = canvas.width, ht = canvas.height; const base = `hsl(${h},100%,50%)`; const gW = ctx.createLinearGradient(0,0,w,0); gW.addColorStop(0,'#fff'); gW.addColorStop(1,base); ctx.fillStyle = gW; ctx.fillRect(0,0,w,ht); const gB = ctx.createLinearGradient(0,0,0,ht); gB.addColorStop(0,'transparent'); gB.addColorStop(1,'#000'); ctx.fillStyle = gB; ctx.fillRect(0,0,w,ht); }
  useEffect(() => { drawCanvas(hue) }, [hue])
  const hexToHue = (hexColor: string): number => { const r = parseInt(hexColor.slice(0,2),16)/255; const g = parseInt(hexColor.slice(2,4),16)/255; const b = parseInt(hexColor.slice(4,6),16)/255; const max = Math.max(r,g,b), min = Math.min(r,g,b); if (max === min) return 0; const d = max - min; let h = 0; if (max === r) h = ((g-b)/d + (g<b?6:0))/6; else if (max === g) h = ((b-r)/d + 2)/6; else h = ((r-g)/d + 4)/6; return Math.round(h * 360) }
  return ( <div style={{ background:'#111124', padding:12, borderRadius:8, border:'1px solid #16163a', width:220 }}> <canvas ref={canvasRef} width={200} height={120} style={{ borderRadius:4, cursor:'crosshair', display:'block', marginBottom:8 }} onClick={(e) => { const canvas = canvasRef.current!; const rect = canvas.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; const ctx = canvas.getContext('2d')!; const imgData = ctx.getImageData(x,y,1,1).data; const r=imgData[0].toString(16).padStart(2,'0'); const g=imgData[1].toString(16).padStart(2,'0'); const b=imgData[2].toString(16).padStart(2,'0'); const h=`${r}${g}${b}`.toUpperCase(); setHex(h); onChange(`#${h}`); }} /> <input type="range" min="0" max="360" value={hue} onChange={(e) => { const val=Number(e.target.value); setHue(val); drawCanvas(val); }} style={{ width:'100%', marginBottom:8, accentColor:'#c9a96e' }} /> <div style={{ display:'flex', gap:6, alignItems:'center' }}> <span style={{ fontSize:11,color:'#9090b8' }}>HEX:</span> <input type="text" value={hex} onChange={(e) => { const val=e.target.value.toUpperCase(); setHex(val); if(val.length===6) onChange(`#${val}`); }} style={{ width:'100%', background:'#05050f', border:'1px solid #16163a', borderRadius:4, color:'#f0f0ff', padding:'4px 6px', fontSize:12, fontFamily:'monospace' }} /> <div style={{ width:24,height:24,borderRadius:4,background:`#${hex}`,border:'1px solid #16163a' }} /> </div> <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:8 }}> {PRESETS.map(c => ( <button key={c} onClick={() => { setHex(c.replace('#','')); onChange(c); const h=hexToHue(c.replace('#','')); setHue(h); drawCanvas(h); }} style={{ width:28, height:20, borderRadius:4, background:c, border:'none', cursor:'pointer' }} /> ))} </div> </div> ) }

// ── COMPONENTE PRINCIPAL (PANEL INTEGRADO) ────────────────────────────────
export default function VideoEditor({ theme = 'dark', clientes = [], onUpload }: Props) {
  const c = useTheme(theme)
  const { clienteGlobal, setClienteGlobal } = useGlobal();
  const [inputTipo, setInputTipo] = useState<'archivo'|'youtube'>('archivo')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [videoFile, setVideoFile] = useState<File|null>(null)
  const [urlFinal, setUrlFinal] = useState('') 
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const videoPlayerRef = useRef<HTMLVideoElement>(null)
  const [realVideoDuration, setRealVideoDuration] = useState(0);

  // Estados del Modal de Estrategia
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeClip, setActiveClip] = useState<Clip | null>(null);

  // Estados de Configuración y Filtros Conectados
  const [sesion, setSesion] = useState('')
  const [tipo, setTipo] = useState(TIPOS[0])
  const [cantidad, setCantidad] = useState(5)
  const [formato, setFormato] = useState(FORMATOS[0].id)
  const [idioma, setIdioma] = useState('Español')
  const [traducir, setTraducir] = useState(false)
  const [idiomaDestino, setIdiomaDestino] = useState('Inglés')
  const [colorSub, setColorSub] = useState('#ffffff')
  
  // Procesamiento
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('')
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState<{clips:Clip[];resumen:string;palabras:number}|null>(null)

  // Obtener la información del cliente seleccionado para inyectar al "cerebro"
  const clienteActivo = clientes.find(cl => cl.id === clienteGlobal || cl.nombre === clienteGlobal) || null;

  useEffect(() => {
    const video = videoPlayerRef.current;
    if (video) {
      const handleLoadedMetadata = () => { setRealVideoDuration(video.duration); setError(''); };
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }
  }, [urlFinal]);

  const handlePreviewClip = (inicioStr: string, finStr: string) => {
    if (!videoPlayerRef.current) return;
    const parseToSeconds = (timeStr: string) => {
      const parts = timeStr.split(':').map(Number);
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      return parts[0] || 0;
    };
    const inicioSeg = parseToSeconds(inicioStr);
    const finSeg = parseToSeconds(finStr);
    const video = videoPlayerRef.current;
    video.currentTime = inicioSeg;
    video.play();
    const onTimeUpdate = () => {
      if (video.currentTime >= finSeg) { video.pause(); video.removeEventListener('timeupdate', onTimeUpdate); }
    };
    video.removeEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('timeupdate', onTimeUpdate);
  };

  const copyProfessionalData = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('✨ Datos estratégicos copiados al portapapeles');
  }

  const handleFile = (f: File) => {
    const ok = ['video/mp4','video/mov','video/avi','video/webm','video/quicktime','audio/mpeg','audio/mp4','audio/m4a']
    if (!ok.some(t => f.type.includes(t.split('/')[1]))) { setError('Formato multimedia no soportado. Usá MP4, MOV, AVI, MP3 o M4A.'); return; }
    setVideoFile(f); setError(''); setInputTipo('archivo');
  }

  const procesar = async () => {
    setError(''); setResultado(null); setLoading(true); setUrlFinal('');
    try {
      let urlTemporal = '';
      if (inputTipo === 'archivo') {
        if (!videoFile) throw new Error('Seleccioná un archivo de video primero.')
        setStep('🚀 Servidores: Subiendo material multimedia High Ticket...')
        if (!onUpload) throw new Error('Cargador de archivos no configurado en la plataforma.')
        const r = await onUpload(videoFile, clienteActivo || undefined) 
        urlTemporal = r.url;
      } else {
        if (!youtubeUrl.trim()) throw new Error('Ingresá una URL de YouTube válida.')
        urlTemporal = youtubeUrl.trim();
      }
      setUrlFinal(urlTemporal);

      setStep('🎧 Procesando Audio: Transcribiendo bloque fonético...')
      const transcRes = await fetch('/api/transcribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: urlTemporal, tipo_input: inputTipo, idioma }) });
      if (!transcRes.ok) throw new Error('Error crítico en el servicio de transcripción.')
      const transcData = await transcRes.json()
      const transcript: string = transcData.transcript || ''
      if (transcript.length < 50) throw new Error('La transcripción obtenida es demasiado corta o el archivo no contiene audio procesable.')
   
      setStep(`🧠 Conectando con la IA: Ejecutando Frameworks Estratégicos y Dirección de Arte...`)
      const analysisRes = await fetch('/api/video-editor', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          url: urlTemporal, 
          transcript, 
          cantidad, 
          tipo, 
          formato, 
          idioma, 
          traducir, 
          idiomaDestino, 
          clientData: clienteActivo 
        }) 
      });
      if (!analysisRes.ok) throw new Error('La IA falló al parsear los datos estructurados.')
      const data = await analysisRes.json();
      
      setResultado(data);

    } catch (e: any) { setError(e.message || 'Error en el núcleo del sistema.'); setUrlFinal(''); } finally { setLoading(false); setStep(''); }
  }

  // Estilos de la Interfaz Premium
  const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({ background:c.surface, border:`1px solid ${c.border}`, borderRadius:14, padding:24, ...extra })
  const lbl = (): React.CSSProperties => ({ fontSize:10, color:c.text3, letterSpacing:'1.5px', fontWeight:800, marginBottom:8, display:'block', textTransform:'uppercase' })
  const sel = (): React.CSSProperties => ({ width:'100%', background:c.s2, border:`1px solid ${c.border}`, borderRadius:8, color:c.text, padding:'11px 16px', fontSize:14, outline:'none', fontWeight:500 })
  const inp = (): React.CSSProperties => ({ width:'100%', background:c.s2, border:`1px solid ${c.border}`, borderRadius:8, color:c.text, padding:'11px 16px', fontSize:14, outline:'none', boxSizing:'border-box', fontWeight:500 })

  return (
    <div style={{ display:'grid', gap:28, maxWidth:1600, margin:'0 auto', padding:'20px', minHeight:'100vh' }}>
      
      {/* ENCABEZADO CORPORATIVO DE LA AGENCIA */}
      <div style={{ borderBottom:`1px solid ${c.border}`, paddingBottom:20 }}>
        <div style={{ fontSize:10, color:GOLD, letterSpacing:4, fontWeight:800, marginBottom:6, textTransform:'uppercase' }}>CHAR CORE — SISTEMA DE INGESTIÓN AUTOMATIZADA</div>
        <h1 style={{ fontSize:36, fontWeight:900, margin:'0 0 8px', color:c.text, letterSpacing:'-1px' }}>Video Editor IA</h1>
        <p style={{ fontSize:14, color:c.text3, margin:0, fontWeight:500 }}>Dirección de Arte y Curación Viral Conectada a la Base de Datos de Clientes</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(420px, 1fr) 2fr', gap:28 }}>
        
        {/* PARTE IZQUIERDA: PANEL DE ENTRADAS Y FILTROS TÁCTICOS */}
        <div style={{ display:'grid', gap:20, alignContent:'start' }}>
          
          {/* Origen del Archivo */}
          <div style={card()}>
            <div style={lbl()}>Carga de Material Multimedia</div>
            <div style={{ display:'flex', gap:10, marginBottom:18 }}>
              {(['archivo','youtube'] as const).map(t => (
                <button key={t} onClick={() => setInputTipo(t)} style={{ flex:1, background: inputTipo===t ? GOLD+'20' : c.s2, border: `1px solid ${inputTipo===t ? GOLD : c.border}`, borderRadius:10, color: inputTipo===t ? GOLD : c.text2, padding:'12px 0', fontSize:13, fontWeight: inputTipo===t ? 800 : 600, cursor:'pointer' }}>
                  {t === 'archivo' ? '📁 Archivo Local' : '🔗 Enlace de YouTube'}
                </button>
              ))}
            </div>
            {inputTipo === 'archivo' ? (
              <div onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(e)=>{ e.preventDefault(); setDragging(false); const f=e.dataTransfer.files[0]; if(f) handleFile(f); }} onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${dragging ? GOLD : videoFile ? SUCCESS : c.border}`, borderRadius:12, padding:'40px 20px', textAlign:'center', cursor:'pointer', background: dragging ? GOLD+'08' : c.s2, transition:'all 0.2s' }}>
                <input ref={fileRef} type="file" accept="video/*,audio/*" style={{ display:'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                {videoFile ? (
                  <>
                    <div style={{ fontSize:32, marginBottom:10 }}>✅</div>
                    <div style={{ fontSize:14, color:SUCCESS, fontWeight:700 }}>{videoFile.name}</div>
                    <div style={{ fontSize:11, color:c.text3, marginTop:5 }}>{(videoFile.size/1024/1024).toFixed(1)} MB · Click para reescribir</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize:40, marginBottom:12, color:c.text3 }}>🎬</div>
                    <div style={{ fontSize:15, color:c.text2, fontWeight:700 }}>Arrastrá el Bruto de Video o Audio</div>
                  </>
                )}
              </div>
            ) : (
              <div>
                <label style={lbl()}>URL de YouTube para Extracción</label>
                <input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." style={inp()} />
              </div>
            )}
          </div>

          {/* Conexión con Clientes e Identidad de la Sesión */}
          <div style={card()}>
            <div style={lbl()}>Conexión de Contexto (Base de Datos)</div>
            <div style={{ display:'grid', gap:16 }}>
              <div>
                <label style={lbl()}>Nombre Identificador de Sesión</label>
                <input value={sesion} onChange={e => setSesion(e.target.value)} placeholder="Ej: Grabación Chalet - Sesión 1" style={inp()} />
              </div>
              
              {/* Selector de Cliente Conectado */}
              <div>
                <label style={lbl()}>Vincular con Cliente del Panel</label>
                <select 
                  value={clienteGlobal} 
                  onChange={(e) => setClienteGlobal(e.target.value)} 
                  style={sel()}
                >
                  <option value="CHAR">-- No vincular / General --</option>
                  {clientes.map(cl => (
                    <option key={cl.id} value={cl.id}>
                      {cl.nombre} — [{cl.nicho}]
                    </option>
                  ))}
                </select>
              </div>

              {clienteActivo && (
                <div style={{ marginTop: 10, padding: 12, background: c.s2, borderRadius: 8, border: `1px solid ${GOLD}30`, fontSize: 12, color: c.text2 }}>
                  <strong>Contexto Inyectado a la IA:</strong> Dolor principal: <em>{clienteActivo.dolor_principal}</em>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl()}>Tipo de Contenido</label>
                  <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={sel()}>
                    {TIPOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl()}>Clips Requeridos</label>
                  <select value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} style={sel()}>
                    {CLIPS_N.map(n => <option key={n} value={n}>{n} Destacados</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Formato del Render y Dirección Visual */}
          <div style={card()}>
            <div style={lbl()}>Filtros de Distribución e Idioma</div>
            <div style={{ display:'grid', gap:16 }}>
              <div>
                <label style={lbl()}>Formato de Salida Escogido</label>
                <select value={formato} onChange={e => setFormato(e.target.value)} style={sel()}>
                  {FORMATOS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:c.s2, border:`1px solid ${c.border}`, borderRadius:8, padding:'12px 16px' }}>
                <div>
                  <div style={{ fontSize:13, color:c.text, fontWeight:700 }}>Activar Localización / Traducción</div>
                  <div style={{ fontSize:11, color:c.text3, fontWeight:500 }}>Duplicar subtítulos en idioma secundario</div>
                </div>
                <button onClick={() => setTraducir(!traducir)} style={{ width:48, height:26, borderRadius:13, cursor:'pointer', background: traducir ? GOLD : c.border, border:'none', position:'relative', transition:'background 0.2s' }}>
                  <span style={{ position:'absolute', top:3, left: traducir ? 25 : 3, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }}/>
                </button>
              </div>

              {traducir && (
                <div>
                  <label style={lbl()}>Idioma de Destino para la IA</label>
                  <select value={idiomaDestino} onChange={e => setIdiomaDestino(e.target.value)} style={sel()}>
                    {IDIOMAS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              )}
              
              <div>
                <label style={lbl()}>Color del Subtítulo Quemado (Preview)</label>
                <ColorPicker color={colorSub} onChange={setColorSub} />
              </div>
            </div>
          </div>

          {/* Botón Maestro de Ingestión */}
          <button onClick={procesar} disabled={loading} style={{ background: loading ? c.border : `linear-gradient(135deg,${GOLD},#8b6010)`, color: loading ? c.text3 : '#05050f', border:'none', borderRadius:12, padding:'18px 24px', fontSize:16, fontWeight:900, cursor: loading ? 'not-allowed' : 'pointer', textTransform:'uppercase', transition:'opacity 0.2s' }}>
            {loading ? `⏳ ${step}` : `⚡ Auditar Pieza Multimedia`}
          </button>
          
          {error && (
            <div style={{ background:ERROR+'15', border:`1px solid ${ERROR}40`, borderRadius:12, padding:'16px', color:ERROR, fontSize:14, fontWeight:600 }}>
              ⚠️ ERROR CRÍTICO DEL PANEL: {error}
            </div>
          )}
        </div>

        {/* PARTE DERECHA: SECCIÓN DE RENDER, VIDEO STICKY Y TARJETAS VIRALES */}
        <div style={{ display:'grid', gap:28, alignContent:'start' }}>
          {resultado ? (
            <>
              {/* Reproductor de Video Anclado (Sticky) */}
              <div style={{ position:'sticky', top:20, zIndex:10 }}>
                <div style={{ background:'#000', border:`1px solid ${c.border}`, borderRadius:14, padding:15, boxShadow:'0 10px 40px rgba(0,0,0,0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize:10, color:'#999', letterSpacing:2, fontWeight:700, textTransform:'uppercase' }}>Monitor de Control Táctico</span>
                    <span style={{ fontSize:10, color:GOLD, fontWeight:800, background:`${GOLD}20`, padding:'2px 6px', borderRadius:4 }}>Formato: {formato}</span>
                  </div>
                  {urlFinal ? (
                    <video ref={videoPlayerRef} src={urlFinal} controls style={{ width:'100%', borderRadius:8, background:'#000', maxHeight:'400px' }}/>
                  ) : (
                    <div style={{ background:'#111', borderRadius:8, padding:'40px 20px', textAlign:'center', color:'#666', fontSize:13 }}>
                      Reproductor cargado con la URL procesada.
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de Clips Hallados */}
              <div style={{ display:'grid', gap:10 }}>
                <div style={{ ...card(), background:GOLD+'05', border:`1px solid ${GOLD}20` }}>
                  <div style={{ fontSize:11, color:GOLD, fontWeight:800, letterSpacing:2, marginBottom:8 }}>INFORME ESTRATÉGICO GENERADO</div>
                  <p style={{ fontSize:14, color:c.text, lineHeight:1.6, margin:0, fontWeight:500 }}>{resultado.resumen}</p>
                </div>
                
                {resultado.clips.map((clip: any, index: number) => (
                  <ClipCard 
                    key={index}
                    clip={clip}
                    theme={theme}
                    videoDuration={realVideoDuration}
                    handlePreviewClip={handlePreviewClip}
                    setActiveClip={setActiveClip}
                    setModalOpen={setIsModalOpen}
                  />
                ))}
              </div>
            </>
          ) : (
            <div style={{ border:`2px dashed ${c.border}`, borderRadius:14, padding:'100px 40px', textAlign:'center', color:c.text3, height:'100%', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
              <span style={{ fontSize: 48, marginBottom: 16 }}>📊</span>
              <h3 style={{ fontSize: 18, color: c.text2, margin:'0 0 8px' }}>Consola de Resultados Vacía</h3>
              <p style={{ fontSize: 13, margin: 0, maxWidth: 400, lineHeight: 1.5 }}>Cargá un archivo o link de origen a la izquierda para ejecutar la auditoría de retención y la extracción automatizada de ganchos.</p>
            </div>
          )}
        </div>

      </div>

      {/* ── MODAL FLOTANTE MAESTRO: AUDITORÍA DETALLADA Y DIRECCIÓN DE ARTE ────── */}
      {isModalOpen && activeClip && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3, 3, 10, 0.9)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: c.surface, border: `1px solid ${GOLD}60`, borderRadius: 20, width: '100%', maxWidth: 1200, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header Modal */}
            <div style={{ padding: '20px 30px', borderBottom: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: c.s2 }}>
              <div>
                <span style={{ fontSize: 11, color: GOLD, fontWeight: 900, letterSpacing: 1.5 }}>DIRECCIÓN DE ARTE SENIOR & ESTRATEGIA B2B</span>
                <h2 style={{ fontSize: 20, fontWeight: 900, margin: '4px 0 0', color: c.text }}>{activeClip.titulo}</h2>
              </div>
              <button onClick={() => { setIsModalOpen(false); setActiveClip(null); }} style={{ background: '#f8717120', color: '#f87171', border: 'none', width: 36, height: 36, borderRadius: '50%', fontWeight: 900, cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>

            {/* Panel de Datos del Modal */}
            <div style={{ padding: 30, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 30 }}>
              
              {/* Lado Izquierdo */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <span style={{ fontSize: 10, color: c.text3, fontWeight: 800, display: 'block', marginBottom: 6 }}>🎯 VARIANTES DE GANCHOS DE ALTO IMPACTO (AI GENERATED)</span>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {activeClip.gancho_viral_options?.map((g: string, idx: number) => (
                      <div key={idx} style={{ background: `${GOLD}0A`, padding: '10px 14px', borderRadius: 8, border: `1px solid ${GOLD}25`, color: GOLD, fontWeight: 600, fontSize: 13 }}>
                        <strong>Opción {idx + 1}:</strong> "{g}"
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 10, color: c.text3, fontWeight: 800, display: 'block', marginBottom: 6 }}>📝 COPY CAPTION PROFESIONAL ESTRATÉGICO (FRAMEWORK PAS/AIDA)</span>
                  <div style={{ position: 'relative' }}>
                    <textarea readOnly value={activeClip.copy_caption_professional} style={{ width: '100%', background: c.s2, border: `1px solid ${c.border}`, borderRadius: 8, color: c.text2, padding: '12px', fontSize: 13, height: 200, fontFamily: 'inherit', resize: 'none', lineHeight:1.5 }} />
                    <button onClick={() => copyProfessionalData(activeClip.copy_caption_professional)} style={{ position: 'absolute', bottom: 12, right: 12, background: GOLD, color: '#000', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
                      📋 Copiar Copy
                    </button>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 10, color: c.text3, fontWeight: 800, display: 'block', marginBottom: 6 }}>🧠 JUSTIFICACIÓN DE AUTORIDAD CHAR CORE</span>
                  <div style={{ fontSize: 13, color: c.text, background: c.s2, padding: 16, borderRadius: 8, border: `1px solid ${c.border}`, lineHeight: 1.5 }}>
                    {activeClip.justificacion_estrategica}
                  </div>
                </div>
              </div>

              {/* Lado Derecho */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, borderLeft: `1px solid ${c.border}`, paddingLeft: 24 }}>
                
                {/* Métricas y Segmentos */}
                <div style={{ background: c.s2, padding: 14, borderRadius: 8, border: `1px solid ${c.border}` }}>
                  <span style={{ fontSize: 10, color: c.text3, fontWeight: 800, display: 'block', marginBottom: 4 }}>📊 DATOS CRÍTICOS DE TIEMPOS</span>
                  <div style={{ fontSize: 13, color: c.text2 }}>Canal sugerido: <strong>{activeClip.red_recomendada}</strong></div>
                  <div style={{ fontSize: 13, color: c.text2, marginTop: 4 }}>Puntos de corte: <strong>{activeClip.timestamp_inicio} a {activeClip.timestamp_fin}</strong></div>
                  <div style={{ fontSize: 13, color: c.text2, marginTop: 4 }}>Duración exacta del fragmento: <strong>{activeClip.duracion_seg} segundos</strong></div>
                </div>

                {/* Receta de Portada Profesional */}
                <div style={{ background: `${GOLD}08`, border: `1px solid ${GOLD}20`, borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 11, color: GOLD, fontWeight: 900, letterSpacing: 1.5, marginBottom: 12 }}>🎨 RECETA MAESTRA PARA PORTADAS HIGH TICKET</div>
                  
                  <div style={{ marginBottom: 12 }}>
                    <label style={lbl()}>Texto Principal (Escribir en Canva/Photoshop):</label>
                    <div style={{ fontSize: 16, fontWeight: 900, color: GOLD, textTransform: 'uppercase', background: c.s2, padding: '8px 12px', borderRadius: 6, border:`1px solid ${GOLD}40`, display: 'inline-block' }}>
                      {activeClip.portada_texto_impacto || 'SIN TEXTO SUGERIDO'}
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={lbl()}>Prompt de Composición de Fondo (Copiar a DALL-E / Midjourney):</label>
                    <div style={{ position: 'relative' }}>
                      <textarea readOnly value={activeClip.portada_prompt_ia} style={{ width: '100%', background: c.s2, border: `1px solid ${c.border}`, borderRadius: 8, color: c.text, padding: '10px', fontSize: 12, height: 90, fontFamily: 'monospace', resize: 'none' }} />
                      <button onClick={() => copyProfessionalData(activeClip.portada_prompt_ia)} style={{ position: 'absolute', bottom: 10, right: 10, background: 'transparent', border: `1px solid ${GOLD}`, color: GOLD, padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        📋 Copiar Prompt
                      </button>
                    </div>
                  </div>

                  {/* Bloque Fónico de Subtítulos */}
                  <div>
                    <span style={{ fontSize: 10, color: c.text3, fontWeight: 800, display: 'block', marginBottom: 6 }}>⌨️ SUBTÍTULOS CRUCIALES DEL BLOQUE</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                      {activeClip.subtitulos?.map((sub: string, sIdx: number) => (
                        <div key={sIdx} style={{ fontSize: 12, color: c.text2, background: c.s2, padding: '8px 12px', borderRadius: 6, borderLeft: `3px solid ${GOLD}` }}>
                          {sub}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
