import { NextRequest, NextResponse } from 'next/server'

const GROQ = 'https://api.groq.com/openai/v1'
const KEY  = () => process.env.GROQ_API_KEY!

// ── Extraer transcript de YouTube ─────────────────────────────────────────
async function transcriptYouTube(url: string): Promise<string> {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (!match) throw new Error('URL de YouTube inválida')
  const videoId = match[1]

  const page = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { 'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8' }
  })
  const html = await page.text()

  const capMatch = html.match(/"captionTracks":(\[.*?\])/)
  if (!capMatch) throw new Error('Este video no tiene subtítulos automáticos. Probá con un archivo de audio.')

  const tracks = JSON.parse(capMatch[1])
  const track  = tracks.find((t: any) => t.languageCode?.startsWith('es')) || tracks[0]
  if (!track?.baseUrl) throw new Error('No se encontró una pista de subtítulos válida')

  const xml  = await (await fetch(track.baseUrl)).text()
  const text = xml
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim()

  if (text.length < 100) throw new Error('Transcripción muy corta. Verificá que el video tenga audio en español.')
  return text
}

// ── Transcribir audio con Groq Whisper ────────────────────────────────────
async function transcriptAudio(base64: string, mime: string): Promise<string> {
  const buf  = Buffer.from(base64, 'base64')
  const blob = new Blob([buf], { type: mime })
  const form = new FormData()
  form.append('file', blob, 'audio.mp3')
  form.append('model', 'whisper-large-v3')
  form.append('language', 'es')
  form.append('response_format', 'text')

  const res = await fetch(`${GROQ}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY()}` },
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || 'Error al transcribir el audio con Groq Whisper')
  }
  return await res.text()
}

// ── Analizar clips virales con LLaMA ─────────────────────────────────────
async function detectClips(transcript: string, cfg: {
  cantidad: number; tipo: string; formato: string; idioma: string
}): Promise<any[]> {
  const prompt = `Sos un experto mundial en marketing viral y contenido para redes sociales.
Analizá esta transcripción y detectá los ${cfg.cantidad} mejores momentos virales.

TIPO DE CONTENIDO: ${cfg.tipo}
FORMATO DESTINO: ${cfg.formato}
IDIOMA ORIGINAL: ${cfg.idioma}

TRANSCRIPCIÓN (primeros 4000 caracteres):
${transcript.slice(0, 4000)}

Respondé SOLO con JSON válido, sin texto extra:
{
  "clips": [
    {
      "numero": 1,
      "titulo": "Título gancho corto y poderoso",
      "gancho": "Primera línea que engancha en los primeros 2 segundos",
      "timestamp_inicio": "00:00",
      "timestamp_fin": "00:45",
      "duracion_seg": 45,
      "por_que_viral": "Razón concreta de por qué este momento funciona en redes",
      "red_recomendada": "Instagram Reels",
      "copy_caption": "Caption sugerido listo para publicar con hashtags",
      "subtitulos": ["Línea de subtítulo 1", "Línea 2", "Línea 3", "Línea 4"],
      "score_viral": 94
    }
  ],
  "resumen": "Análisis general del contenido en 2 oraciones"
}`

  const res = await fetch(`${GROQ}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || 'Error al analizar con Groq LLaMA')
  }

  const data    = await res.json()
  const content = JSON.parse(data.choices[0].message.content)
  return { clips: content.clips || [], resumen: content.resumen || '' }
}

// ── HANDLER ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tipo_input, youtube_url, audio_base64, audio_mime, config } = body

    if (!KEY()) return NextResponse.json({ error: 'GROQ_API_KEY no configurada en Vercel' }, { status: 500 })

    // 1. Obtener transcripción
    let transcript = ''
    if (tipo_input === 'youtube') {
      if (!youtube_url) return NextResponse.json({ error: 'URL de YouTube requerida' }, { status: 400 })
      transcript = await transcriptYouTube(youtube_url)
    } else if (tipo_input === 'audio') {
      if (!audio_base64) return NextResponse.json({ error: 'Archivo de audio requerido' }, { status: 400 })
      transcript = await transcriptAudio(audio_base64, audio_mime || 'audio/mpeg')
    } else {
      return NextResponse.json({ error: 'tipo_input debe ser "youtube" o "audio"' }, { status: 400 })
    }

    // 2. Detectar clips virales
    const resultado = await detectClips(transcript, {
      cantidad: config?.cantidad || 3,
      tipo:     config?.tipo     || 'Podcast',
      formato:  config?.formato  || '9:16 Vertical',
      idioma:   config?.idioma   || 'Español',
    })

    return NextResponse.json({
      ok: true,
      transcript_preview: transcript.slice(0, 300) + '...',
      clips: resultado.clips,
      resumen: resultado.resumen,
      palabras: transcript.split(' ').length,
    })

  } catch (err: any) {
    console.error('[video-editor]', err)
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}
