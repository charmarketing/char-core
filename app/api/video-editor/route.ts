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

  const prompt = `Sos un experto mundial en marketing viral y contenido para redes sociales (TikTok, Reels, Shorts).
Analizá esta transcripción y detectá los ${cfg.cantidad} mejores momentos con mayor potencial de retención y gancho viral.

TIPO DE CONTENIDO: ${cfg.tipo}
FORMATO DESTINO: ${cfg.formato}
IDIOMA DE SALIDA: ${cfg.idioma}
${cfg.traducir ? `TRADUCIR SUBTÍTULOS A: ${cfg.idiomaDestino}` : ''}

TRANSCRIPCIÓN DEL VIDEO:
${transcript.slice(0, 7000)}

Debes responder EXCLUSIVAMENTE con un objeto JSON válido, siguiendo esta estructura exacta:
{
  "clips": [
    {
      "numero": 1,
      "titulo": "Título gancho corto y poderoso (max 8 palabras)",
      "gancho": "Primera línea que engancha en los primeros 3 segundos",
      "timestamp_inicio": "00:01:30",
      "timestamp_fin": "00:02:15",
      "duracion_seg": 45,
      "por_que_viral": "Razón específica de por qué genera engagement",
      "red_recomendada": "Instagram Reels",
      "copy_caption": "Caption completo con emojis y hashtags listo para publicar",
      "subtitulos": ["Línea 1 del subtítulo", "Línea 2", "Línea 3"]${cfg.traducir ? `,\n      "subtitulos_traducidos": ["Line 1 in ${cfg.idiomaDestino}", "Line 2"]` : ''},
      "score_viral": 92
    }
  ],
  "resumen": "Análisis estratégico general en 2 oraciones."
}`

  // Usamos el modelo estable actual con specdec para máxima velocidad y evitar timeouts
  const res = await fetch(GROQ, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3, // Temperatura baja para evitar alucinaciones en los timestamps
      max_tokens: 3000,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    if (res.status === 401) throw new Error('GROQ_API_KEY inválida en Vercel.')
    if (res.status === 429) throw new Error('Límite de Groq alcanzado momentáneamente. Reintenta en un minuto.')
    throw new Error(err?.error?.message || `Error Groq API: ${res.status}`)
  }

  const data = await res.json()
  const contentString = data.choices?.[0]?.message?.content
  if (!contentString) throw new Error("La IA devolvió una estructura vacía")
  
  const content = JSON.parse(contentString)
  return { clips: content.clips || [], resumen: content.resumen || '' }
}

// ── HANDLER PRINCIPAL ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Tolerancia de datos: Mapeamos de forma flexible lo que envíe el Frontend
    const transcriptDirecto = body.transcript
    const youtube_url = body.url || body.youtube_url
    const config = body.config || {}

    const cfg = {
      cantidad:       Number(config.cantidad)       || 3,
      tipo:           config.tipo           || 'Podcast',
      formato:        config.formato        || '9:16 Vertical',
      idioma:         config.idioma         || 'Español',
      traducir:       config.traducir       || false,
      idiomaDestino:  config.idiomaDestino  || 'Inglés',
    }

    let transcript = ''

    // Detectamos inteligentemente el flujo de entrada basado en los datos reales
    if (transcriptDirecto && transcriptDirecto.trim() !== '') {
      transcript = transcriptDirecto
    } else if (youtube_url && youtube_url.trim() !== '') {
      transcript = await ytTranscript(youtube_url)
    } else {
      return NextResponse.json({ error: 'Faltan datos. Se requiere un transcript o una URL de YouTube válida.' }, { status: 400 })
    }

    if (transcript.length < 20) {
      return NextResponse.json({ error: 'La transcripción estructurada es demasiado corta para procesar.' }, { status: 400 })
    }

    // Ejecución del análisis avanzado
    const resultado = await analizarClips(transcript, cfg)

    return NextResponse.json({
      ok: true,
      clips: resultado.clips,
      resumen: resultado.resumen,
      palabras: transcript.split(' ').length,
      transcript_preview: transcript.slice(0, 200) + '...',
    })

  } catch (err: any) {
    console.error('[video-editor-error]:', err.message)
    return NextResponse.json({ error: err.message || 'Error interno en el procesador' }, { status: 500 })
  }
}
