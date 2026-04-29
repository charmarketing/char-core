import { NextResponse } from 'next/server'

const DEEPGRAM = 'https://api.deepgram.com/v1/listen'
const KEY = () => process.env.DEEPGRAM_API_KEY!

const LANG_MAP: Record<string, string> = {
  'Español': 'es', 'Inglés': 'en', 'Portugués': 'pt',
  'Francés': 'fr', 'Alemán': 'de', 'Italiano': 'it',
  'Japonés': 'ja', 'Chino': 'zh', 'Árabe': 'ar',
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { url: audioUrl, tipo_input, idioma = 'Español' } = body

    if (!KEY()) {
      return NextResponse.json(
        { error: 'DEEPGRAM_API_KEY no configurada en Vercel → Settings → Environment Variables' },
        { status: 500 }
      )
    }

    // ── YouTube: extraer subtítulos automáticos (sin Deepgram) ─────────────
    if (tipo_input === 'youtube') {
      if (!audioUrl) return NextResponse.json({ error: 'URL de YouTube requerida' }, { status: 400 })

      const match = audioUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
      if (!match) return NextResponse.json({ error: 'URL de YouTube inválida' }, { status: 400 })

      const html = await (await fetch(`https://www.youtube.com/watch?v=${match[1]}`, {
        headers: { 'Accept-Language': 'es-AR,es;q=0.9', 'User-Agent': 'Mozilla/5.0' }
      })).text()

      const m = html.match(/"captionTracks":(\[.*?\])/)
      if (!m) {
        return NextResponse.json(
          { error: 'Este video no tiene subtítulos automáticos. Subí el archivo de audio directamente.' },
          { status: 400 }
        )
      }

      const tracks = JSON.parse(m[1])
      const track = tracks.find((t: any) => t.languageCode?.startsWith('es')) || tracks[0]
      if (!track?.baseUrl) return NextResponse.json({ error: 'Sin pista de subtítulos válida' }, { status: 400 })

      const xml = await (await fetch(track.baseUrl)).text()
      const transcript = xml
        .replace(/<[^>]*>/g, ' ')
        .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ').trim()

      return NextResponse.json({
        ok: true,
        transcript,
        palabras: transcript.split(' ').length
      })
    }

    // ── Archivo: transcribir con Deepgram usando URL de R2 ─────────────────
    if (!audioUrl) return NextResponse.json({ error: 'URL del archivo requerida' }, { status: 400 })

    const lang = LANG_MAP[idioma] || 'es'
    const params = new URLSearchParams({
      model: 'nova-2',
      language: lang,
      smart_format: 'true',
      punctuate: 'true',
    })

    const res = await fetch(`${DEEPGRAM}?${params}`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${KEY()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: audioUrl }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      if (res.status === 401) {
        return NextResponse.json(
          { error: 'DEEPGRAM_API_KEY inválida. Verificá en Vercel → Environment Variables' },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { error: err?.err_msg || `Error Deepgram: ${res.status}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    const transcript = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''

    if (!transcript) {
      return NextResponse.json(
        { error: 'No se pudo transcribir. Verificá que el archivo tenga audio claro.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      ok: true,
      transcript,
      palabras: transcript.split(' ').length,
    })

  } catch (err: any) {
    console.error('[transcribe]', err.message)
    return NextResponse.json(
      { error: err.message || 'Error interno al transcribir' },
      { status: 500 }
    )
  }
}
