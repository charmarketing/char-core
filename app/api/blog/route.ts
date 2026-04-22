import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    
    if(!apiKey){
      return NextResponse.json({ 
        error: 'GEMINI_API_KEY no configurada',
        noticias: NOTICIAS_FALLBACK 
      })
    }

    const prompt = `Generá exactamente 5 noticias de marketing digital actuales y relevantes.
Respondé ÚNICAMENTE con un array JSON válido, sin markdown, sin texto extra, sin bloques de código.
Ejemplo exacto del formato requerido:
[{"titulo":"titulo aqui","resumen":"resumen aqui en una o dos oraciones","fuente":"nombre del medio","categoria":"Instagram"},{"titulo":"...","resumen":"...","fuente":"...","categoria":"..."}]
Categorías válidas: Instagram, Google Ads, TikTok, LinkedIn, SEO, IA Marketing, Meta Ads, YouTube
Las noticias deben ser útiles para agencias de marketing de Latinoamérica.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

    if(!response.ok){
      const err = await response.text()
      console.error('Gemini error:', err)
      return NextResponse.json({ noticias: NOTICIAS_FALLBACK })
    }

    const data = await response.json()
    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    let noticias = []
    try {
      const limpio = texto.replace(/```json/g,'').replace(/```/g,'').trim()
      const jsonMatch = limpio.match(/$$[\s\S]*$$/)
      if(jsonMatch) noticias = JSON.parse(jsonMatch[0])
    } catch(e) {
      console.error('Parse error:', e)
      noticias = NOTICIAS_FALLBACK
    }

    if(!noticias.length) noticias = NOTICIAS_FALLBACK

    return NextResponse.json({ 
      noticias, 
      generado: new Date().toISOString(),
      fuente: 'gemini'
    })

  } catch (error: any) {
    console.error('Blog IA error:', error)
    return NextResponse.json({ 
      noticias: NOTICIAS_FALLBACK,
      error: error.message 
    })
  }
}

const NOTICIAS_FALLBACK = [
  {
    titulo: 'Instagram prioriza Reels con más del 80% de retención en 2026',
    resumen: 'Las cuentas que logran alta retención en los primeros 3 segundos tienen 3x más alcance orgánico según datos internos de Meta.',
    fuente: 'Social Media Today',
    categoria: 'Instagram'
  },
  {
    titulo: 'Google Ads lanza IA predictiva para optimización automática de pujas',
    resumen: 'La nueva función ajusta pujas en tiempo real. Los early adopters reportan un 40% de mejora en ROAS en las primeras semanas.',
    fuente: 'Search Engine Journal',
    categoria: 'Google Ads'
  },
  {
    titulo: 'TikTok supera a YouTube en tiempo de visualización en Latinoamérica',
    resumen: 'El promedio de sesión en TikTok alcanzó los 52 minutos en Argentina. Las marcas que migraron contenido tienen un CTR 2.3x superior.',
    fuente: 'Marketing Dive',
    categoria: 'TikTok'
  },
  {
    titulo: 'LinkedIn: el video corto crece 120% en publicaciones B2B',
    resumen: 'Videos de 60 a 90 segundos tienen un alcance 5x mayor que los posts de texto según LinkedIn Insights.',
    fuente: 'LinkedIn Insights',
    categoria: 'LinkedIn'
  },
  {
    titulo: 'La IA generativa reduce un 60% el tiempo de producción de contenido',
    resumen: 'Agencias que integran IA en su flujo de trabajo producen el doble de contenido con el mismo equipo.',
    fuente: 'HubSpot Research',
    categoria: 'IA Marketing'
  },
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { titulo, contenido, resumen, imagen_url, video_url, tags, autor } = body

    if(!titulo || !contenido){
      return NextResponse.json({ error: 'Título y contenido son requeridos' }, { status: 400 })
    }

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
        resumen: resumen || '',
        imagen_url: imagen_url || null,
        video_url: video_url || null,
        tags: tags || [],
        autor: autor || 'Adri',
        tipo: 'char',
        publicado: true
      })
      .select()
      .single()

    if(error) throw error

    return NextResponse.json({ post: data })

  } catch (error: any) {
    console.error('POST blog error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
