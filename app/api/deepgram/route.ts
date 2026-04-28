import { NextRequest, NextResponse } from 'next/server'

const DEEPGRAM_URL = 'https://api.deepgram.com/v1/listen'
const KEY = () => process.env.DEEPGRAM_API_KEY!

// ── YouTube: extraer subtítulos automáticos ────────────────────────────────
async function transcriptYouTube(url: string): Promise<{ transcript: string; palabras: number }> {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (!match) throw new Error('URL de YouTube inválida. Formato: https://www.youtube.com/watch?v=...')

  const videoId = match[1]
  const page = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { 'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8', 'User-Agent': 'Mozilla/5.0' }
  })
  if (!page.ok) throw new Error('No se pudo acceder al video de YouTube')

  const html = await page.text()
  const capMatch = html.match(/"captionTracks":(\[.*?\])/)
  if (!capMatch) throw new Error('Este video no tiene subtítulos automáticos. Probá subiendo el archivo de audio directamente.')

  const tracks = JSON.parse(capMatch[1])
  const track = tracks.find((t: any) => t.languageCode?.startsWith('es')) || tracks[0]
  if (!track?.baseUrl) throw new Error('No se encontró pista de subtítulos válida')

  const xml = await (await fetch(track.baseUrl)).text()
  const transcript = xml
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ').trim()

  if (transcript.length < 100) throw new Error('La transcripción del video es muy corta o está vacía.')
  return { transcript, palabras: transcript.split(' ').length }
}

// ── Deepgram: transcribir desde URL pública ────────────────────────────────
async function transcriptDeepgramURL(fileUrl: string, idioma: string): Promise<{ transcript: string; palabras: number }> {
  if (!KEY()) throw new Error('DEEPGRAM_API_KEY no configurada en Vercel → Settings → Environment Variables')

  const langMap: Record<string, string> = {
    'Español': 'es', 'Inglés': 'en', 'Portugués': 'pt', 'Francés': 'fr',
    'Alemán': 'de', 'Italiano': 'it', 'Japonés': 'ja', 'Chino': 'zh',
  }
  const lang = langMap[idioma] || 'es'

  const params = new URLSearchParams({
    model: 'nova-2',
    language: lang,
    smart_format: 'true',
    punctuate: 'true',
    paragraphs: 'true',
    utterances: 'false',
  })

  const res = await fetch(`${DEEPGRAM_URL}?${params}`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${KEY()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: fileUrl }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    if (res.status === 401) throw new Error('API Key de Deepgram inválida. Verificá en Vercel → Environment Variables → DEEPGRAM_API_KEY')
    throw new Error(err?.err_msg || `Error Deepgram: ${res.status}`)
  }

  const data = await res.json()
  const transcript = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
  if (!transcript) throw new Error('Deepgram no pudo transcribir el audio. Verificá que el archivo tenga audio claro.')

  return { transcript, palabras: transcript.split(' ').length }
}

// ── Deepgram: transcribir desde base64 (archivos pequeños <10MB) ───────────
async function transcriptDeepgramBase64(base64: string, mime: string, idioma: string): Promise<{ transcript: string; palabras: number }> {
  if (!KEY()) throw new Error('DEEPGRAM_API_KEY no configurada en Vercel')

  const langMap: Record<string, string> = {
    'Español': 'es', 'Inglés': 'en', 'Portugués': 'pt', 'Francés': 'fr',
    'Alemán': 'de', 'Italiano': 'it',
  }
  const lang = langMap[idioma] || 'es'

  const buffer = Buffer.from(base64, 'base64')

  const params = new URLSearchParams({
    model: 'nova-2',
    language: lang,
    smart_format: 'true',
    punctuate: 'true',
  })

  const res = await fetch(`${DEEPGRAM_URL}?${params}`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${KEY()}`,
      'Content-Type': mime || 'audio/mpeg',
    },
    body: buffer,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.err_msg || `Error Deepgram: ${res.status}`)
  }

  const data = await res.json()
  const transcript = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
  if (!transcript) throw new Error('No se pudo transcribir. Verificá que el archivo tenga audio claro.')

  return { transcript, palabras: transcript.split(' ').length }
}

// ── HANDLER ────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url, tipo_input, idioma = 'Español', audio_base64, audio_mime } = body

    let resultado: { transcript: string; palabras: number }

    if (tipo_input === 'youtube') {
      resultado = await transcriptYouTube(url)
    } else if (audio_base64) {
      // Archivo pequeño enviado como base64
      resultado = await transcriptDeepgramBase64(audio_base64, audio_mime || 'audio/mpeg', idioma)
    } else if (url && url.startsWith('http')) {
      // URL pública (Cloudflare R2, Supabase Storage, etc.)
      resultado = await transcriptDeepgramURL(url, idioma)
    } else {
      throw new Error('Parámetros inválidos. Enviá url, youtube_url o audio_base64.')
    }

    return NextResponse.json({ ok: true, ...resultado })

  } catch (err: any) {
    console.error('[deepgram]', err.message)
    return NextResponse.json({ error: err.message || 'Error al transcribir' }, { status: 500 })
  }
}
