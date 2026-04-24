import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!post) return { title: 'CHAR BLOG' }

  return {
    title: `${post.titulo} — CHAR BLOG`,
    description: post.resumen || post.contenido.slice(0, 160),
    openGraph: {
      title: post.titulo,
      description: post.resumen || post.contenido.slice(0, 160),
      url: `https://project-gpu0d.vercel.app/blog/${post.id}`,
      siteName: 'CHAR BLOG',
      images: post.imagen_url ? [
        {
          url: post.imagen_url,
          width: 1200,
          height: 630,
          alt: post.titulo,
        }
      ] : [
        {
          url: 'https://project-gpu0d.vercel.app/fonts/logo-char.png',
          width: 400,
          height: 400,
          alt: 'CHAR BLOG',
        }
      ],
      locale: 'es_AR',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.titulo,
      description: post.resumen || post.contenido.slice(0, 160),
      images: post.imagen_url ? [post.imagen_url] : [],
    },
  }
}

export default async function PostIndividual({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', params.id)
    .eq('publicado', true)
    .single()

  if (!post) notFound()

  const GOLD = '#ffcd38'
  const PURPLE = '#a78bfa'
  const BLUE = '#4f8fff'
  const GREEN = '#3dd68c'

  const tiempoLectura = Math.max(1, Math.ceil(post.contenido.split(' ').length / 200))

  return (
    <div style={{ minHeight: '100vh', background: '#05050f', fontFamily: 'Rajdhani,sans-serif', color: '#f0f0ff' }}>

      {/* HEADER */}
      <div style={{ borderBottom: '1px solid #16163a', padding: '0 24px', background: 'rgba(5,5,15,0.95)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', gap: '12px', flexWrap: 'wrap' }}>
          <a href="/blog" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <img src="/fonts/logo-char.png" alt="CHAR" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#f0f0ff', letterSpacing: '1px' }}>CHAR BLOG</div>
              <div style={{ fontSize: '9px', color: '#4a4a6a', letterSpacing: '3px' }}>← VOLVER AL BLOG</div>
            </div>
          </a>
          <a href="https://project-gpu0d.vercel.app" style={{ padding: '8px 16px', borderRadius: '10px', background: `linear-gradient(135deg,${GOLD},#cc8800)`, color: '#050510', fontSize: '12px', fontWeight: 800, textDecoration: 'none' }}>
            USAR CHAR CORE →
          </a>
        </div>
      </div>

      {/* POST */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>

        {/* IMAGEN */}
        {post.imagen_url && (
          <img src={post.imagen_url} alt={post.titulo} style={{ width: '100%', borderRadius: '16px', marginBottom: '32px', maxHeight: '500px', objectFit: 'cover', display: 'block' }} />
        )}

        {/* META */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ padding: '4px 12px', borderRadius: '20px', background: GOLD + '18', border: `1px solid ${GOLD}45`, fontSize: '10px', color: GOLD, fontWeight: 700, letterSpacing: '1px' }}>CHAR</span>
          {post.tags?.map((tag: string, i: number) => (
            <span key={i} style={{ padding: '4px 10px', borderRadius: '20px', background: PURPLE + '18', border: `1px solid ${PURPLE}45`, fontSize: '10px', color: PURPLE, fontWeight: 700 }}>#{tag}</span>
          ))}
          <span style={{ fontSize: '11px', color: '#4a4a6a', marginLeft: 'auto' }}>{tiempoLectura} min de lectura · {new Date(post.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>

        {/* TITULO */}
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, color: '#f0f0ff', margin: '0 0 16px', lineHeight: '1.2' }}>
          {post.titulo}
        </h1>

        {post.resumen && (
          <p style={{ fontSize: '18px', color: GOLD, margin: '0 0 32px', fontStyle: 'italic', lineHeight: '1.6' }}>{post.resumen}</p>
        )}

        {/* CONTENIDO */}
        <div style={{ fontSize: '16px', color: '#9090b8', lineHeight: '2', whiteSpace: 'pre-wrap', marginBottom: '40px' }}>
          {post.contenido}
        </div>

        {post.video_url && (
          <a href={post.video_url} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: BLUE, fontSize: '14px', textDecoration: 'none', marginBottom: '40px', padding: '10px 20px', background: BLUE + '15', border: `1px solid ${BLUE}35`, borderRadius: '10px' }}>
            ▶ Ver video
          </a>
        )}

        {/* COMPARTIR */}
        <div style={{ borderTop: '1px solid #16163a', paddingTop: '28px', marginBottom: '40px' }}>
          <div style={{ fontSize: '11px', color: '#4a4a6a', letterSpacing: '2px', marginBottom: '14px', fontWeight: 700 }}>COMPARTIR ESTE POST</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://project-gpu0d.vercel.app/blog/${post.id}`)}`} target="_blank"
              style={{ padding: '10px 20px', borderRadius: '10px', background: BLUE + '20', color: BLUE, border: `1px solid ${BLUE}55`, fontSize: '13px', fontWeight: 700, textDecoration: 'none', fontFamily: 'Rajdhani,sans-serif' }}>
              LinkedIn
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.titulo)}&url=${encodeURIComponent(`https://project-gpu0d.vercel.app/blog/${post.id}`)}`} target="_blank"
              style={{ padding: '10px 20px', borderRadius: '10px', background: PURPLE + '20', color: PURPLE, border: `1px solid ${PURPLE}55`, fontSize: '13px', fontWeight: 700, textDecoration: 'none', fontFamily: 'Rajdhani,sans-serif' }}>
              X/Twitter
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://project-gpu0d.vercel.app/blog/${post.id}`)}`} target="_blank"
              style={{ padding: '10px 20px', borderRadius: '10px', background: '#1877f220', color: '#1877f2', border: '1px solid #1877f255', fontSize: '13px', fontWeight: 700, textDecoration: 'none', fontFamily: 'Rajdhani,sans-serif' }}>
              Facebook
            </a>
            <a href={`https://wa.me/?text=${encodeURIComponent(`${post.titulo} — ${post.resumen||''} \nhttps://project-gpu0d.vercel.app/blog/${post.id}`)}`} target="_blank"
              style={{ padding: '10px 20px', borderRadius: '10px', background: GREEN + '20', color: GREEN, border: `1px solid ${GREEN}55`, fontSize: '13px', fontWeight: 700, textDecoration: 'none', fontFamily: 'Rajdhani,sans-serif' }}>
              WhatsApp
            </a>
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg,#0d0d1f,#111124)', border: `1px solid ${GOLD}30`, borderRadius: '20px', padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: GOLD, letterSpacing: '3px', marginBottom: '12px', fontWeight: 700 }}>AGENCIA CHAR</div>
          <h3 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, color: '#f0f0ff', margin: '0 0 12px' }}>¿Querés trabajar con nosotros?</h3>
          <p style={{ fontSize: '14px', color: '#6060a0', margin: '0 0 24px', lineHeight: '1.7' }}>Somos la agencia detrás de CHAR CORE. Estrategia, contenido y resultados reales.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://project-gpu0d.vercel.app" style={{ padding: '12px 28px', borderRadius: '12px', background: `linear-gradient(135deg,${GOLD},#cc8800)`, color: '#050510', fontSize: '14px', fontWeight: 800, textDecoration: 'none' }}>
              Ver CHAR CORE →
            </a>
            <a href={`https://wa.me/+54?text=${encodeURIComponent('Hola CHAR! Vi el blog y me interesa trabajar con ustedes.')}`} target="_blank"
              style={{ padding: '12px 28px', borderRadius: '12px', background: GREEN + '20', color: GREEN, border: `1px solid ${GREEN}55`, fontSize: '14px', fontWeight: 800, textDecoration: 'none' }}>
              WhatsApp
            </a>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid #16163a', padding: '24px', textAlign: 'center', background: '#030308' }}>
        <div style={{ fontSize: '13px', color: '#4a4a6a' }}>
          <span style={{ color: GOLD, fontWeight: 800 }}>CHAR</span> · Agencia de Marketing Digital · Argentina · 2026
        </div>
      </div>

    </div>
  )
}
