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

 const prompt = `Eres el Director de Arte Senior y Estratega B2B de la agencia CHAR Core, especialista en Marketing de Contenidos High Ticket y posicionamiento de autoridad mundial. Tu objetivo es analizar la transcripción de un video largo y extraer los fragmentos con mayor potencial viral y estratégico.

Instrucciones imperativas para cada campo del JSON:
- numero: [Número de clip]
- titulo: [Título corto, magnético y corporativo del clip (max 8 palabras)].
- gancho_viral_options: [Genera exactamente 3 opciones de ganchos de alto impacto. Opción 1: Disrupción o quiebre de patrón. Opción 2: Basado en un dato o dolor B2B. Opción 3: Llamado directo a la autoridad].
- copy_caption_professional: [Escribe un copy estructurado profesionalmente. Usa el framework PAS (Problema, Agitación, Solución) o AIDA. Separa los párrafos con espacios limpios, usa viñetas elegantly, añade emojis corporativos sutiles y finaliza SIEMPRE con una Llamada a la Acción (CTA) de alto valor para agendar una sesión estratégica. Al final incluye 3 hashtags estratégicos].
- justificacion_estrategica: [Explica de forma analítica por qué este fragmento posiciona al cliente como un líder indiscutible en su nicho y por qué atrae a prospectos que pagan tickets altos].
- timestamp_inicio: [MM:SS o HH:MM:SS exacto del video original]
- timestamp_fin: [MM:SS o HH:MM:SS exacto del video original]
- duracion_seg: [Duración exacta en segundos]
- red_recomendada: [LinkedIn, Instagram Reels o TikTok según el tono]
- subtitulos: [Lista de las frases principales que componen el bloque]
- score_viral: [Número del 1 al 100 basado en el potencial de retención y click]
- portada_prompt_ia: [Genera el prompt exacto en inglés que describe la composición perfecta para una portada profesional que refleje la autoridad del clip (sin texto encima). Especifica iluminación, expresión facial y desenfoque. Ej: Minimalist high-end corporate studio setting, sharp lighting, cinematic deep blue background with gold accents, professional camera blur depth of field, 8k --ar 9:16].
- portada_texto_impacto: [Escribe el título superpuesto de alto impacto (2-4 palabras máximo) que Adrián debe tipear grande en Canva o Photoshop. Ej: EL ERROR DE LOS $450K].

REGLA DE ORO: No generes respuestas genéricas, ni chistes. El tono debe ser persuasivo, sofisticado y enfocado en el Retorno de Inversión (ROI) y la autoridad de marca.

TIPO DE CONTENIDO: ${cfg.tipo || 'Podcast'}
FORMATO DESTINO: ${cfg.formato || '9:16'}
IDIOMA DE SALIDA: ${cfg.idioma || 'Español'}
${cfg.traducir ? `TRADUCIR SUBTÍTULOS A: ${cfg.idiomaDestino}` : ''}

TRANSCRIPCIÓN DEL VIDEO:
${transcript.slice(0, 7000)}

Debes responder EXCLUSIVAMENTE con un objeto JSON válido, siguiendo esta estructura exacta en cada clip:
{
  "clips": [
    {
      "numero": 1,
      "titulo": "Título de autoridad",
      "gancho_viral_options": ["G1", "G2", "G3"],
      "timestamp_inicio": "00:00",
      "timestamp_fin": "00:00",
      "duracion_seg": 0,
      "portada_prompt_ia": "Midjourney/DALL-E prompt...",
      "portada_texto_impacto": "TEXTO CANVA",
      "red_recomendada": "LinkedIn",
      "copy_caption_professional": "Caption premium...",
      "justificacion_estrategica": "Explicación CHAR...",
      "subtitulos": ["Línea 1", "Línea 2"]${cfg.traducir ? `,\n      "subtitulos_traducidos": ["Line 1", "Line 2"]` : ''},
      "score_viral": 92
    }
  ],
  "resumen": "Análisis general estratégico en 2 oraciones."
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
