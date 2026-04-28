import { NextRequest, NextResponse } from 'next/server'

const GROQ = 'https://api.groq.com/openai/v1/chat/completions'
const KEY  = () => process.env.GROQ_API_KEY!

// ── YouTube: obtener transcripción ────────────────────────────────────────
async function ytTranscript(url: string): Promise<string> {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (!match) throw new Error('URL de YouTube inválida')
  const id = match[1]
  const html = await (await fetch(`https://www.youtube.com/watch?v=${id}`, {
    headers: { 'Accept-Language': 'es-AR,es;q=0.9', 'User-Agent': 'Mozilla/5.0' }
  })).text()
  const m = html.match(/"captionTracks":(\[.*?\])/)
  if (!m) throw new Error('El video no tiene subtítulos automáticos. Subí el archivo de audio directamente.')
  const tracks = JSON.parse(m[1])
  const track = tracks.find((t: any) => t.languageCode?.startsWith('es')) || tracks[0]
  if (!track?.baseUrl) throw new Error('No se encontró pista de subtítulos')
  const xml = await (await fetch(track.baseUrl)).text()
  return xml.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim()
}

// ── Análisis viral con Groq LLaMA ─────────────────────────────────────────
async function analizarClips(transcript: string, cfg: {
  cantidad: number; tipo: string; formato: string; idioma: string; traducir: boolean; idiomaDestino: string
}) {
  if (!KEY()) throw new Error('GROQ_API_KEY no configurada en Vercel → Settings → Environment Variables')

  const prompt = `Sos un experto mundial en marketing viral y contenido para redes sociales.
Analizá esta transcripción y detectá los ${cfg.cantidad} mejores momentos virales para redes sociales.

TIPO DE CONTENIDO: ${cfg.tipo}
FORMATO DESTINO: ${cfg.formato}
IDIOMA: ${cfg.idioma}
${cfg.traducir ? `TRADUCIR SUBTÍTULOS A: ${cfg.idiomaDestino}` : ''}

TRANSCRIPCIÓN:
${transcript.slice(0, 6000)}

Respondé SOLO con JSON válido, sin texto adicional, sin markdown:
{
  "clips": [
    {
      "numero": 1,
      "titulo": "Título gancho corto y poderoso (max 8 palabras)",
      "gancho": "Primera línea que engancha en los primeros 3 segundos",
      "timestamp_inicio": "00:01:30",
      "timestamp_fin": "00:02:15",
      "duracion_seg": 45,
      "por_que_viral": "Razón específica de por qué este momento genera engagement",
      "red_recomendada": "Instagram Reels",
      "copy_caption": "Caption completo con emojis y hashtags listo para publicar",
      "subtitulos": ["Línea 1 del subtítulo", "Línea 2", "Línea 3", "Línea 4", "Línea 5"]${cfg.traducir ? `,\n      "subtitulos_traducidos": ["Line 1 in ${cfg.idiomaDestino}", "Line 2", "Line 3"]` : ''},
      "score_viral": 92
    }
  ],
  "resumen": "Análisis general del contenido en 2-3 oraciones con recomendaciones estratégicas"
}`

  const res = await fetch(GROQ, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    if (res.status === 401) throw new Error('GROQ_API_KEY inválida. Verificá en Vercel → Environment Variables')
    if (res.status === 429) throw new Error('Límite de Groq alcanzado. Esperá unos minutos e intentá de nuevo.')
    throw new Error(err?.error?.message || `Error Groq: ${res.status}`)
  }

  const data = await res.json()
  const content = JSON.parse(data.choices[0].message.content)
  return { clips: content.clips || [], resumen: content.resumen || '' }
}

// ── HANDLER ────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      tipo_input,
      youtube_url,
      transcript: transcriptDirecto,
      config = {}
    } = body

    const cfg = {
      cantidad:       config.cantidad       || 3,
      tipo:           config.tipo           || 'Podcast',
      formato:        config.formato        || '9:16 Vertical',
      idioma:         config.idioma         || 'Español',
      traducir:       config.traducir       || false,
      idiomaDestino:  config.idiomaDestino  || 'Inglés',
    }

    let transcript = ''

    // Caso 1: ya viene la transcripción (desde /api/deepgram)
    if (tipo_input === 'transcript' && transcriptDirecto) {
      transcript = transcriptDirecto
    }
    // Caso 2: YouTube directo (fallback sin Deepgram)
    else if (tipo_input === 'youtube' && youtube_url) {
      transcript = await ytTranscript(youtube_url)
    }
    else {
      throw new Error('Parámetros inválidos. Enviá transcript o youtube_url.')
    }

    if (transcript.length < 50) throw new Error('La transcripción es muy corta para analizar.')

    // Analizar clips virales
    const resultado = await analizarClips(transcript, cfg)

    return NextResponse.json({
      ok: true,
      clips: resultado.clips,
      resumen: resultado.resumen,
      palabras: transcript.split(' ').length,
      transcript_preview: transcript.slice(0, 200) + '...',
    })

  } catch (err: any) {
    console.error('[video-editor]', err.message)
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}
