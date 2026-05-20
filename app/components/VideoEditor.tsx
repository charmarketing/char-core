'use client'
import { useState, useRef, useCallback, useEffect } from 'react'

// ── TIPOS UNIFICADOS Y ESTRATÉGICOS ─────────────────────────────────────────
interface Clip {
  numero: number;
  titulo: string;
  hook_viral_options?: string[]; 
  gancho?: string;
  copy_caption_professional?: string; 
  copy_caption?: string;
  justificacion_estrategica?: string; 
  por_que_viral?: string;
  timestamp_inicio: string; 
  timestamp_fin: string; 
  duracion_seg: number;
  red_recomendada: string;
  subtitulos: string[];
  score_viral: number; 
}
interface Cliente { id: string; nombre: string }
interface Props {
  theme?: 'dark' | 'light'
  clientes?: Cliente[]
  onUpload?: (file: File) => Promise<{ url: string }>
}

// ── CONSTANTES DE DISEÑO PREMIUM (AGENCIA CHAR) ────────────────────────────
const GOLD = '#c9a96e'
const SUCCESS = '#3dd68c'
const ERROR = '#f87171'
const PRESETS = ['#ffffff','#ffcd38','#c9a96e','#00cfff','#3dd68c','#f87171','#a78bfa','#000000']
const TIPOS = ['Podcast','Entrevista','Charla / Keynote','Clase / Tutorial','Reunión','Video de cliente','Otro']
const CLIPS_N = [3,4,5,6,7,8,9,10]
const FORMATOS = [
  '9:16 — TikTok / Reels / Shorts / Stories',
  '1:1 — Instagram Feed / Twitter',
  '16:9 — YouTube / LinkedIn',
]

// ── COLOR THEME LOGIC ───────────────────────────────────────────────────────
function useTheme(t: 'dark'|'light') {
  return t === 'dark'
    ? { bg:'#05050f', surface:'#0b0b18', s2:'#111124', border:'#16163a', b2:'#1e1e3a', text:'#f0f0ff', text2:'#9090b8', text3:'#4a4a6a' }
    : { bg:'#eef0f8', surface:'#ffffff', s2:'#f4f6ff', border:'#dde0f0', b2:'#c8cbdf', text:'#0d0d20', text2:'#2a2a4a', text3:'#6060aa' }
}

// ── COMPONENTE CLIP CARD PROFESIONAL ────────────────────────────────────────
function ClipCard({ 
  clip, 
  theme, 
  onPreviewClip,
  videoDuration,
  setActiveClip,
  setModalOpen
}: { 
  clip: any; 
  theme: 'dark' | 'light'; 
  onPreviewClip?: (inicio: string, fin: string) => void;
  videoDuration: number; 
  setActiveClip: (clip: any) => void;
  setModalOpen: (open: boolean) => void;
}) {
  const c = useTheme(theme);
  
  const parseToSecondsHelper = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] || 0;
  };

  const inicioSeg = parseToSecondsHelper(clip.timestamp_inicio);
  const isInvalidTimestamp = inicioSeg > videoDuration && videoDuration > 0;
  const sc = isInvalidTimestamp ? ERROR : (clip.score_viral >= 85 ? SUCCESS : (clip.score_viral >= 70 ? GOLD : ERROR));

  const ganchoTexto = clip.gancho || (clip.hook_viral_options && clip.hook_viral_options[0]) || 'Gancho estratégico generado';

  return (
    <div style={{ background:c.surface, border:`1px solid ${c.border}`, borderRadius:14, overflow:'hidden', borderTop:`3px solid ${sc}`, transition:'all 0.2s', marginBottom:14 }}>
      <div style={{ padding:'18px 22px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:14 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
              <span style={{ fontSize:10,color:sc,fontWeight:700,letterSpacing:1.2,background:sc+'15',border:`1px solid ${sc}30`,padding:'3px 10px',borderRadius:20, textTransform:'uppercase' }}>
                CLIP {clip.numero}
              </span>
              <span style={{ fontSize:11,color: isInvalidTimestamp ? ERROR : c.text2, fontWeight:600 }}>
                {clip.timestamp_inicio} → {clip.timestamp_fin}
              </span>
              <span style={{ fontSize:10,color:c.text3, fontWeight:500 }}>{clip.duracion_seg}s</span>
              {isInvalidTimestamp && <span style={{fontSize:9,color:ERROR, fontWeight:700}}>⚠️ TIME INVALID</span>}
            </div>
            <div style={{ fontSize:17,fontWeight:800,color:c.text,lineHeight:1.25 }}>{clip.titulo}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:26,fontWeight:900,color:sc,lineHeight:1 }}>{clip.score_viral}</div>
            <div style={{ fontSize:10,color:c.text3, fontWeight:700 }}>VIRAL</div>
          </div>
        </div>

        {/* Gancho Breve */}
        <div style={{ background:theme==='dark'?'#111124':'#f9fafe',borderRadius:10,padding:'12px 16px',marginBottom:12, border:`1px solid ${c.border}` }}>
          <div style={{ fontSize:10,color:GOLD,letterSpacing:1.5,fontWeight:800,marginBottom:6, textTransform:'uppercase' }}>Gancho Viral</div>
          <div style={{ fontSize:13,color:c.text,fontStyle:'italic',paddingLeft:12, borderLeft:`2px solid ${c.border}` }}>
            "{ganchoTexto}"
          </div>
        </div>

        {/* Botones de acción de la tarjeta */}
        <div style={{ display:'flex', gap:8 }}>
          {onPreviewClip && (
            <button 
              disabled={isInvalidTimestamp}
              onClick={() => onPreviewClip(clip.timestamp_inicio, clip.timestamp_fin)} 
              style={{ flex: 1, background: SUCCESS+'15', border:`1px solid ${SUCCESS}40`, borderRadius:8, color: SUCCESS, padding:'9px 0', fontSize:12, cursor: isInvalidTimestamp ? 'not-allowed' : 'pointer', fontWeight:700 }}
            >
              👁️ Ver Clip
            </button>
          )}
          <button 
            onClick={() => { setActiveClip(clip); setModalOpen(true); }} 
            style={{ flex: 1, background: GOLD, border:'none', borderRadius:8, color: '#000', padding:'9px 0', fontSize:12, cursor:'pointer', fontWeight:800 }}
          >
            ⚡ Expandir Estrategia
          </button>
        </div>
      </div>
    </div>
  );
}

// ── EXPORTS UTILIDADES ──────────────────────────────────────────────────────
function exportCSV(clips: any[], sesion: string) {
  const rows = [
    ['Clip','Título','Inicio','Fin','Duración (s)','Score Viral','Red','Gancho','Estrategia','Copy'],
    ...clips.map(c => [
      c.numero, c.titulo, c.timestamp_inicio, c.timestamp_fin, c.duracion_seg, c.score_viral, c.red_recomendada,
      c.gancho || '', c.por_que_viral || '', c.copy_caption || ''
    ])
  ]
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(';')).join('\r\n')
  dl(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}), `CHAR_Video_${sesion||'sesion'}.csv`)
}

function exportTXT(clips: any[], sesion: string) {
  const lines = [`💎 CHAR CORE — Video Editor IA High Ticket\nSesión: ${sesion}\nFecha: ${new Date().toLocaleDateString('es-AR')}\n${'═'.repeat(60)}`]
  clips.forEach(c => {
    lines.push(`\n🚀 CLIP ${c.numero}: ${c.titulo}`)
    lines.push(`⏱️ Timestamps: ${c.timestamp_inicio} → ${c.timestamp_fin} (${c.duracion_seg}s)`)
    lines.push(`\n📝 COPY:\n${c.copy_caption || c.copy_caption_professional}`)
    lines.push(`\n${'─'.repeat(50)}`)
  })
  dl(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8;'}), `CHAR_Video_${sesion||'sesion'}.txt`)
}

function dl(blob: Blob, name: string) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click()
}

// ── COMPONENTE PRINCIPAL (VIDEO EDITOR) ────────────────────────────────────
export default function VideoEditor({ theme = 'dark', clientes = [], onUpload }: Props) {
  const c = useTheme(theme)
  const [tab, setTab] = useState<'procesar'|'historial'>('procesar')
  const [inputTipo, setInputTipo] = useState<'archivo'|'youtube'>('archivo')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [videoFile, setVideoFile] = useState<File|null>(null)
  const [urlFinal, setUrlFinal] = useState('') 
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const videoPlayerRef = useRef<HTMLVideoElement>(null)
  const [realVideoDuration, setRealVideoDuration] = useState(0);

  // Estados para el Modal Maestro de CHAR
  const [activeClip, setActiveClip] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Cargar historial
  const [historial, setHistorial] = useState<{sesion:string;clips:any[];fecha:string;realDuration:number}[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('char_editor_history');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('char_editor_history', JSON.stringify(historial));
  }, [historial]);

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

    if (inicioSeg > realVideoDuration && realVideoDuration > 0) {
      setError(`Error: El timestamp de Groq (${inicioStr}) está fuera de la duración real del video.`);
      return;
    }

    const video = videoPlayerRef.current;
    video.currentTime = inicioSeg;
    video.play();

    const onTimeUpdate = () => {
      if (video.currentTime >= finSeg) {
        video.pause();
        video.removeEventListener('timeupdate', onTimeUpdate);
      }
    };
    video.removeEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('timeupdate', onTimeUpdate);
  };

  const [sesion, setSesion] = useState('')
  const [tipo, setTipo] = useState('Podcast')
  const [cantidad, setCantidad] = useState(3)
  const [formato, setFormato] = useState(FORMATOS[0])
  const [idioma, setIdioma] = useState('Español')
  const [traducir, setTraducir] = useState(false)
  const [idiomaDestino, setIdiomaDestino] = useState('Inglés')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('')
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState<{clips:any[];resumen:string;palabras:number}|null>(null)

  const handleFile = (f: File) => {
    const ok = ['video/mp4','video/mov','video/avi','video/webm','video/quicktime','audio/mpeg','audio/mp4','audio/m4a']
    if (!ok.some(t => f.type.includes(t.split('/')[1]))) { setError('Formato no soportado High Ticket.'); return; }
    setVideoFile(f); setError(''); setInputTipo('archivo');
  }

  const procesar = async () => {
    setError(''); setResultado(null); setLoading(true); setUrlFinal('');
    try {
      let urlTemporal = '';
      if (inputTipo === 'archivo') {
        if (!videoFile) throw new Error('Seleccioná un archivo primero')
        setStep('🚀 CHAR CORE: Subiendo video a servidores High Ticket...')
        if (!onUpload) throw new Error('Función de upload no disponible.')
        const r = await onUpload(videoFile)
        urlTemporal = r.url;
      } else {
        if (!youtubeUrl.trim()) throw new Error('Pegá el link de YouTube primero')
        urlTemporal = youtubeUrl.trim();
      }
      setUrlFinal(urlTemporal);

      setStep('🎧 CHAR CORE: Transcribiendo con Inteligencia Artificial...')
      const transcRes = await fetch('/api/transcribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: urlTemporal, tipo_input: inputTipo, idioma }) });
      if (!transcRes.ok) throw new Error('Error en transcripción CHAR')
      const transcData = await transcRes.json()
      const transcript: string = transcData.transcript || ''
      if (transcript.length < 50) throw new Error('Transcripción insuficiente. Verificá el audio.')
   
      setStep(`🧠 CHAR CORE: Generando Dirección de Arte y Textos de Autoridad...`)
      const analysisRes = await fetch('/api/video-editor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: urlTemporal, transcript, cantidad, tipo, formato, idioma, traducir, idiomaDestino }) });
      if (!analysisRes.ok) throw new Error('Error en análisis viral Groq CHAR')
      const data = await analysisRes.json();
      
      setResultado(data);
      setHistorial(prev => [{ 
        sesion: sesion || `Sesión CHAR`, 
        clips: data.clips, 
        fecha: new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString('es-AR'),
        realDuration: realVideoDuration
      }, ...prev.slice(0,19)]);

    } catch (e: any) { setError(e.message || 'Error desconocido CHAR CORE'); setUrlFinal(''); } finally { setLoading(false); setStep(''); }
  }

  // Estilos Base
  const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({ background:c.surface, border:`1px solid ${c.border}`, borderRadius:14, padding:24, ...extra })
  const lbl = (): React.CSSProperties => ({ fontSize:10, color:c.text3, letterSpacing:'1.5px', fontWeight:800, marginBottom:8, display:'block', textTransform:'uppercase' })
  const sel = (): React.CSSProperties => ({ width:'100%', background:c.s2, border:`1px solid ${c.border}`, borderRadius:8, color:c.text, padding:'11px 16px', fontSize:14, outline:'none', fontWeight:500 })
  const inp = (): React.CSSProperties => ({ width:'100%', background:c.s2, border:`1px solid ${c.border}`, borderRadius:8, color:c.text, padding:'11px 16px', fontSize:14, outline:'none', boxSizing:'border-box', fontWeight:500 })

  return (
    <div style={{ display:'grid', gap:28, maxWidth:1600, margin:'0 auto', padding:'20px', minHeight:'100vh' }}>
      
      {/* HEADER AGENCIA */}
      <div style={{borderBottom:`1px solid ${c.border}`, paddingBottom:20}}>
        <div style={{ fontSize:10, color:GOLD, letterSpacing:4, fontWeight:800, marginBottom:6, textTransform:'uppercase' }}>CHAR CORE — High Ticket Content Labs</div>
        <h1 style={{ fontSize:36, fontWeight:900, margin:'0 0 8px', color:c.text, letterSpacing:'-1px' }}>Video Editor IA (Nivel Mundial)</h1>
        <p style={{ fontSize:14, color:c.text3, margin:0, fontWeight:500 }}>Automatización Creativa Estratégica · Deepgram Ultra · Groq LLaMA 3.3</p>
      </div>

      {/* TABS */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, background:c.surface, padding:10, borderRadius:12, border:`1px solid ${c.border}` }}>
        <div style={{ display:'flex', gap:8 }}>
          {(['procesar','historial'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab===t ? GOLD : 'transparent', color: tab===t ? '#05050f' : c.text2, border: `1px solid ${tab===t ? GOLD : 'transparent'}`, borderRadius:8, padding:'10px 24px', fontSize:13, fontWeight:800, cursor:'pointer', transition:'all 0.2s' }}>
              {t === 'procesar' ? '⚡ NUEVA SESIÓN HIGH TICKET' : '📋 HISTORIAL DE ENTREGAS'}
            </button>
          ))}
        </div>
      </div>

      {/* HISTORIAL */}
      {tab === 'historial' && (
        <div style={card()}>
          <div style={lbl()}>ENTREGAS RECIENTES AGENCIA CHAR</div>
          {historial.length === 0 ? <div style={{ textAlign:'center', padding:'60px 0', color:c.text3, fontSize:14 }}>No hay entregas registradas.</div> : 
            historial.map((h,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0', borderBottom: i<historial.length-1 ? `1px solid ${c.border}` : 'none' }}>
                <div>
                  <div style={{ fontSize:15, color:c.text, fontWeight:700 }}>{h.sesion}</div>
                  <div style={{ fontSize:12, color:c.text3 }}>{h.clips.length} clips High Ticket · {h.fecha}</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => { setResultado({clips: h.clips, resumen:'Cargado desde historial', palabras:0}); setUrlFinal(''); setTab('procesar'); }} style={{ background:GOLD+'15', border:`1px solid ${GOLD}40`, borderRadius:7, color:GOLD, padding:'6px 12px', fontSize:12, cursor:'pointer', fontWeight:700 }}>Cargar Sesión</button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* PROCESADOR */}
      {tab === 'procesar' && (
        <div style={{ display:'grid', gridTemplateColumns:'minmax(400px, 1fr) 2fr', gap:28 }}>
          
          <div style={{ display:'grid', gap:20, alignContent:'start' }}>
            <div style={card()}>
              <div style={lbl()}>FUENTE DE INPUT MULTIMEDIA</div>
              <div style={{ display:'flex', gap:10, marginBottom:18 }}>
                {(['archivo','youtube'] as const).map(t => (
                  <button key={t} onClick={() => setInputTipo(t)} style={{ flex:1, background: inputTipo===t ? GOLD+'20' : c.s2, border: `1px solid ${inputTipo===t ? GOLD : c.border}`, borderRadius:10, color: inputTipo===t ? GOLD : c.text2, padding:'12px 0', fontSize:13, fontWeight: inputTipo===t ? 800 : 600, cursor:'pointer' }}>
                    {t === 'archivo' ? '📁 Archivo local' : '🔗 YouTube Link'}
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
                      <div style={{ fontSize:11, color:c.text3, marginTop:5 }}>{(videoFile.size/1024/1024).toFixed(1)} MB</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize:40, marginBottom:12 }}>🎬</div>
                      <div style={{ fontSize:15, color:c.text2, fontWeight:700 }}>Arrastrá tu video High Ticket acá</div>
                    </>
                  )}
                </div>
              ) : (
                <div style={{marginBottom:10}}>
                  <label style={lbl()}>URL DE YOUTUBE</label>
                  <input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." style={inp()} />
                </div>
              )}
            </div>

            <div style={card()}>
              <div style={lbl()}>PARÁMETROS ESTRATÉGICOS</div>
              <div style={{ display:'grid', gap:16 }}>
                <div><label style={lbl()}>CLIENTE / SESIÓN</label><input value={sesion} onChange={e => setSesion(e.target.value)} placeholder="Ej: DG Clean" style={inp()} /></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div><label style={lbl()}>CANTIDAD CLIPS</label><select value={cantidad} onChange={e => setCantidad(+e.target.value)} style={sel()}>{CLIPS_N.map(n => <option key={n} value={n}>{n} clips</option>)}</select></div>
                </div>
              </div>
            </div>

            <button onClick={procesar} disabled={loading} style={{ background: loading ? c.border : GOLD, color: loading ? c.text3 : '#000', border:'none', borderRadius:12, padding:'18px 24px', fontSize:16, fontWeight:900, cursor: loading ? 'not-allowed' : 'pointer', textTransform:'uppercase' }}>
              {loading ? `⏳ ${step || 'Procesando...'}` : `⚡ Auditar y Detectar Virales`}
            </button>
            {error && <div style={{ background:ERROR+'15', border:`1px solid ${ERROR}40`, borderRadius:12, padding:'16px', color:ERROR, fontSize:14, fontWeight:600 }}>⚠️ ERROR: {error}</div>}
          </div>

          <div style={{ display:'grid', gap:28, alignContent:'start' }}>
            {resultado && (
              <>
                <div style={{ position:'sticky', top:20, zIndex:10 }}>
                  <div style={{background:'#000', border:`1px solid ${c.border}`, borderRadius:14, padding:15 }}>
                    <div style={{ fontSize:10, color:'#999', letterSpacing:2, fontWeight:700, marginBottom:10 }}>REPRODUCTOR AGENCIA CHAR</div>
                    {urlFinal ? (
                      <video ref={videoPlayerRef} src={urlFinal} controls style={{ width:'100%', borderRadius:8, background:'#000', maxHeight:'450px' }}/>
                    ) : (
                      <div style={{ background:'#111', borderRadius:8, padding:'50px 20px', textAlign:'center', color:'#666', fontSize:14 }}>Usar timestamps locales.</div>
                    )}
                  </div>
                </div>

                <div style={{ display:'grid', gap:20 }}>
                  <div style={{ ...card(), background:GOLD+'05', border:`1px solid ${GOLD}20` }}>
                    <div style={{fontSize:11, color:GOLD, fontWeight:800, letterSpacing:2, marginBottom:8}}>RESUMEN ESTRATÉGICO CHAR CORE</div>
                    <p style={{fontSize:14, color:c.text, lineHeight:1.6, margin:0, fontWeight:500}}>{resultado.resumen}</p>
                  </div>
                  
                  {resultado.clips.map((clip: any, index: number) => (
                    <ClipCard 
                      key={index}
                      clip={clip}
                      theme={theme}
                      videoDuration={realVideoDuration}
                      onPreviewClip={handlePreviewClip}
                      setActiveClip={setActiveClip}
                      setModalOpen={setIsModalOpen}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL MAESTRO FLOTANTE INTERNACIONAL (CHAR CORE) ──────────────── */}
      {isModalOpen && activeClip && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3, 3, 10, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: c.surface, border: `1px solid ${GOLD}60`, borderRadius: 20, width: '100%', maxWidth: 1200, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column' }}>
            
            {/* Cabecera del Modal */}
            <div style={{ padding: '20px 30px', borderBottom: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: c.s2 }}>
              <div>
                <span style={{ fontSize: 11, color: GOLD, fontWeight: 900, letterSpacing: 1.5 }}>AUDITORÍA DE CONTENIDO Y DIRECCIÓN DE ARTE</span>
                <h2 style={{ fontSize: 20, fontWeight: 900, margin: '4px 0 0', color: c.text }}>{activeClip.titulo}</h2>
              </div>
              <button onClick={() => { setIsModalOpen(false); setActiveClip(null); }} style={{ background: '#f8717120', color: '#f87171', border: 'none', width: 36, height: 36, borderRadius: '50%', fontWeight: 900, cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>

            {/* Cuerpo de Datos de Agencia */}
            <div style={{ padding: 30, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 30 }}>
              
              {/* Lado Izquierdo: Textos y Datos de Groq */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <span style={{ fontSize: 10, color: c.text3, fontWeight: 800, letterSpacing: 1, display: 'block', marginBottom: 6 }}>🪝 GANCHO VIRAL DETECTADO</span>
                  <div style={{ background: `${GOLD}10`, padding: 12, borderRadius: 8, border: `1px solid ${GOLD}30`, color: GOLD, fontWeight: 800, fontSize: 14 }}>
                    "{activeClip.gancho || activeClip.hook_viral_options?.[0]}"
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 10, color: c.text3, fontWeight: 800, letterSpacing: 1, display: 'block', marginBottom: 6 }}>📝 COPY CAPTION PROFESIONAL ESTRATÉGICO</span>
                  <div style={{ position: 'relative' }}>
                    <textarea readOnly value={activeClip.copy_caption || activeClip.copy_caption_professional} style={{ width: '100%', background: c.s2, border: `1px solid ${c.border}`, borderRadius: 8, color: c.text, padding: '12px', fontSize: 13, height: 200, fontFamily: 'inherit', lineHeight: 1.5, resize: 'none' }} />
                    <button onClick={() => { navigator.clipboard.writeText(activeClip.copy_caption || activeClip.copy_caption_professional); alert('🎯 Copy copiado'); }} style={{ position: 'absolute', bottom: 12, right: 12, background: GOLD, color: '#000', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
                      📋 Copiar Texto
                    </button>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 10, color: c.text3, fontWeight: 800, letterSpacing: 1, display: 'block', marginBottom: 6 }}>🎯 LOGÍSTICA DE RELEVANCIA Y DIRECCIÓN DE ARTE</span>
                  <div style={{ fontSize: 13, color: c.text, background: c.s2, padding: 16, borderRadius: 8, border: `1px solid ${c.border}`, whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                    {activeClip.por_que_viral || activeClip.justificacion_estrategica}
                  </div>
                </div>
              </div>

              {/* Lado Derecho: Tiempos, Subtítulos y Checklist para Adrián */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, borderLeft: `1px solid ${c.border}`, paddingLeft: 24 }}>
                <div style={{ background: c.s2, padding: 14, borderRadius: 8, border: `1px solid ${c.border}` }}>
                  <span style={{ fontSize: 10, color: c.text3, fontWeight: 800, display: 'block', marginBottom: 4 }}>📊 MÉTRICAS DEL CLIP</span>
                  <div style={{ fontSize: 13, color: c.text2 }}>Plataforma Sugerida: <strong>{activeClip.red_recomendada}</strong></div>
                  <div style={{ fontSize: 13, color: c.text2, marginTop: 4 }}>Segmento original: <strong>{activeClip.timestamp_inicio} a {activeClip.timestamp_fin}</strong></div>
                  <div style={{ fontSize: 13, color: c.text2, marginTop: 4 }}>Duración exacta: <strong>{activeClip.duracion_seg} segundos</strong></div>
                </div>

                <div>
                  <span style={{ fontSize: 10, color: c.text3, fontWeight: 800, letterSpacing: 1, display: 'block', marginBottom: 6 }}>💬 SUBTÍTULOS CRUCIALES DEL BLOQUE</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                    {activeClip.subtitulos?.map((sub: string, sIdx: number) => (
                      <div key={sIdx} style={{ fontSize: 12, color: c.text2, background: c.s2, padding: '8px 12px', borderRadius: 6, borderLeft: `3px solid ${GOLD}` }}>
                        {sub}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: `${GOLD}05`, padding: 16, borderRadius: 10, border: `1px dashed ${GOLD}40` }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: GOLD, display: 'block', marginBottom: 6 }}>🎨 FORMATO DE REPLICACIÓN (STANDARDS CHAR)</span>
                  <ul style={{ margin: 0, paddingLeft: 14, fontSize: 12, color: c.text2, display: 'flex', flexDirection: 'column', gap: 6, lineHeight: 1.4 }}>
                    <li>Aislá el rostro en primer plano y aplicá máscara de enfoque en los ojos.</li>
                    <li>Incliná el bloque de texto entre 3° y 5° con tipografía Sans-serif gruesa.</li>
                    <li>Utilizá sombras duras e iluminación trasera de neón para generar separación de fondo.</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
