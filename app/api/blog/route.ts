import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const prompt = `Generá 5 noticias reales y relevantes de marketing digital para hoy.
Formato JSON estricto, sin texto extra, solo el array:
[
  {
    "titulo": "título de la noticia",
    "resumen": "resumen de 2 líneas máximo",
    "fuente": "nombre del medio",
    "categoria": "una de: Instagram, Google Ads, TikTok, LinkedIn, SEO, IA Marketing"
  }
]
Las noticias deben ser actuales, útiles para agencias de marketing argentinas.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          }
        })
      }
    )

    const data = await response.json()
    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
    
    const jsonMatch = texto.match(/$$[\s\S]*$$/)
    const noticias = jsonMatch ? JSON.parse(jsonMatch[0]) : []

    return NextResponse.json({ noticias, generado: new Date().toISOString() })

  } catch (error: any) {
    console.error('Blog IA error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { titulo, contenido, resumen, imagen_url, video_url, tags, autor } = await req.json()

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        titulo,
        contenido,
        resumen,
        imagen_url,
        video_url,
        tags,
        autor: autor || 'Adri',
        tipo: 'char',
        publicado: true
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ post: data })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
