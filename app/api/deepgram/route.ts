import { NextRequest, NextResponse } from 'next/server'

const KEY = () => process.env.DEEPGRAM_API_KEY!

export async function POST(req: NextRequest) {
  try {

    if (!KEY()) {
      return NextResponse.json(
        { error: 'DEEPGRAM_API_KEY no configurada' },
        { status: 500 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Archivo no enviado' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const deepgramRes = await fetch(
      'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&language=es',
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${KEY()}`,
          'Content-Type': file.type || 'audio/mpeg'
        },
        body: buffer
      }
    )

    if (!deepgramRes.ok) {
      const err = await deepgramRes.text()
      throw new Error(err)
    }

    const data = await deepgramRes.json()

    const transcript =
      data.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''

    const duration = data.metadata?.duration || 0

    return NextResponse.json({
      ok: true,
      transcript,
      duration
    })

  } catch (err: any) {
    console.error('[deepgram]', err)

    return NextResponse.json(
      { error: err.message || 'Error interno' },
      { status: 500 }
    )
  }
}
