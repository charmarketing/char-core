import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`

function getSupabase(){
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function llamarGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY
  if(!apiKey) throw new Error('Sin API key')
  
  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 }
    })
  })
  
  if(!response.ok){
    const err = await response.text()
    throw new Error(err)
  }
  
  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export async function GET() {
  try {
    const supabase = getSupabase()
    const hoy = new Date().toISOString().split('T')[0]
    
    const { data: existentes } = await supabase
      .from('noticias_ia')
      .select('*')
      .eq('fecha', hoy)
      .order('created_at', { ascending: true })
    
    if(existentes && existentes.length >= 5){
      return NextResponse.json({ 
        noticias: existentes, 
        fuente: 'cache',
        fecha: hoy
      })
    }

    const prompt = `Generá exactamente 5 noticias de marketing digital actuales y relevantes para hoy.
Respondé ÚNICAMENTE con un array JSON válido, sin markdown, sin texto extra.
Formato exacto:
[{"titulo":"titulo aqui","resumen":"resumen en dos oraciones máximo","fuente":"nombre del medio","categoria":"Instagram"}]
Categorías válidas: Instagram, Google Ads, TikTok, LinkedIn, SEO, IA Marketing, Meta Ads, YouTube
Noticias útiles para agencias de marketing de Latinoamérica.`

    let noticias = []
    try {
      const texto = await llamarGemini(prompt)
      const limpio = texto.replace(/```json/g,'').replace(/```/g,'').trim()
      const jsonMatch = limpio.match(/$$[\s\S]*$$/)
      if(jsonMatch) noticias = JSON.parse(jsonMatch[0])
    } catch(e) {
      noticias = NOTICIAS_FALLBACK
    }

    if(!noticias.length) noticias = NOTICIAS_FALLBACK

    await supabase.from('noticias_ia').delete().eq('fecha', hoy)
    
    const { data: guardadas } = await supabase
      .from('noticias_ia')
      .insert(noticias.map((n:any) => ({ ...n, fecha: hoy })))
      .select()

    return NextResponse.json({ 
      noticias: guardadas || noticias, 
      fuente: 'gemini',
      fecha: hoy
    })

  } catch (error: any) {
    console.error('GET blog error:', error)
    return NextResponse.json({ noticias: NOTICIAS_FALLBACK })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { titulo, contenido, resumen, imagen_url, video_url, tags, autor } = body

    if(!titulo || !contenido){
      return NextResponse.json({ error: 'Título y contenido requeridos' }, { status: 400 })
    }

    const supabase = getSupabase()

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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { noticia } = body

    if(!noticia?.titulo){
      return NextResponse.json({ analisis: 'Noticia no recibida.' })
    }

    if(noticia.id && noticia.analisis){
      return NextResponse.json({ analisis: noticia.analisis })
    }

    const supabase = getSupabase()

    if(noticia.id){
      const { data: existente } = await supabase
        .from('noticias_ia')
        .select('analisis')
        .eq('id', noticia.id)
        .single()
      
      if(existente?.analisis){
        return NextResponse.json({ analisis: existente.analisis })
      }
    }

    const prompt = `Sos el Cerebro IA de CHAR, agencia de marketing digital argentina de élite.

Desarrollá esta noticia en profundidad:
Título: ${noticia.titulo}
Resumen: ${noticia.resumen}
Fuente: ${noticia.fuente}
Categoría: ${noticia.categoria}

Escribí un análisis completo con este formato exacto, sin asteriscos ni markdown:

QUE PASO
Explicá la noticia en detalle en 2 o 3 oraciones.

POR QUE IMPORTA PARA TU AGENCIA
Explicá el impacto real en agencias latinoamericanas.

DATOS CLAVE
- Dato concreto 1 con número
- Dato concreto 2 con número
- Dato concreto 3 con número

QUE HACER ESTA SEMANA
- Acción concreta 1
- Acción concreta 2
- Acción concreta 3

PERSPECTIVA CHAR
Un párrafo con la visión de CHAR sobre esta tendencia.

Respondé en español argentino, directo y accionable.`

    const analisis = await llamarGemini(prompt)

    if(noticia.id && analisis){
      await supabase
        .from('noticias_ia')
        .update({ analisis })
        .eq('id', noticia.id)
    }

    return NextResponse.json({ analisis: analisis || 'No se pudo generar el análisis.' })

  } catch (error: any) {
    console.error('PUT error:', error)
    return NextResponse.json({ 
      analisis: 'Gemini no está disponible en este momento. Intentá en unos segundos.' 
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
    resumen: 'La nueva función ajusta pujas en tiempo real. Los early adopters reportan un 40% de mejora en ROAS.',
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
    resumen: 'Videos de 60 a 90 segundos tienen un alcance 5x mayor que los posts de texto.',
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
