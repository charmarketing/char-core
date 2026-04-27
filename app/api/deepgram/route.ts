import { NextRequest, NextResponse } from 'next/server'

const KEY = () => process.env.DEEPGRAM_API_KEY!

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL del archivo requerida' }, { status: 400 })
    if (!KEY()) return NextResponse.json({ error: 'DEEPGRAM_API_KEY no configurada' }, { status: 500 })

    const res = await fetch(
      'https://api.deepgram.com/v1/listen?model=nova-2&language=es&smart_format=true&punctuate=true&utterances=true',
      {
        method: 'POST',
        headers: { 'Authorization': `Token ${KEY()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      }
    )
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.err_msg || 'Error al transcribir con Deepgram')
    }
    const data = await res.json()
    const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
    const duration = data.metadata?.duration || 0
    return NextResponse.json({ ok: true, transcript, duration })
  } catch (err: any) {
    console.error('[deepgram]', err)
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}
