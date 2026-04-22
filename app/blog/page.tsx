'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const GOLD='#c9a96e',BLUE='#4f8fff',PURPLE='#a78bfa'
const BASE_USUARIOS = 50

export default function BlogPublico(){
  const [posts,setPosts]=useState<any[]>([])
  const [cargando,setCargando]=useState(true)
  const [usuarios,setUsuarios]=useState(BASE_USUARIOS)
  const [postAbierto,setPostAbierto]=useState<any>(null)

  useEffect(()=>{
    cargarPosts()
    iniciarContador()
  },[])

  const cargarPosts=async()=>{
    const {data}=await supabase.from('blog_posts')
      .select('*').eq('publicado',true)
      .order('created_at',{ascending:false})
    if(data) setPosts(data)
    setCargando(false)
  }

  const iniciarContador=()=>{
    const guardado=localStorage.getItem('char_blog_usuarios')
    const base=guardado?parseInt(guardado):BASE_USUARIOS
    setUsuarios(base)
    const nuevo=base+1
    localStorage.setItem('char_blog_usuarios',nuevo.toString())
    setUsuarios(nuevo)
    const intervalo=setInterval(()=>{
      setUsuarios(prev=>{
        const siguiente=prev+Math.floor(Math.random()*2)
        return siguiente
      })
    },8000)
    return ()=>clearInterval(intervalo)
  }

  if(cargando) return(
    <div style={{minHeight:'100vh',background:'#05050f',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:GOLD,fontSize:'18px',fontFamily:'Rajdhani,sans-serif'}}>Cargando...</div>
    </div>
  )

  return(
    <div style={{minHeight:'100vh',background:'#05050f',fontFamily:'Rajdhani,sans-serif',color:'#f0f0ff'}}>

      {/* HEADER */}
      <div style={{borderBottom:'1px solid #16163a',padding:'0 24px',position:'sticky',top:0,background:'#05050f',zIndex:100,backdropFilter:'blur(10px)'}}>
        <div style={{maxWidth:'900px',margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 0',gap:'12px',flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{width:'36px',height:'36px',background:`linear-gradient(135deg,${GOLD},#8b6010)`,borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>⚡</div>
            <div>
              <div style={{fontSize:'18px',fontWeight:800,color:'#f0f0ff',letterSpacing:'1px'}}>CHAR BLOG</div>
              <div style={{fontSize:'10px',color:'#4a4a6a',letterSpacing:'2px'}}>MARKETING · ESTRATEGIA · IA</div>
            </div>
          </div>
          {/* CONTADOR COMUNIDAD */}
          <div style={{background:'#0b0b18',border:'1px solid #16163a',borderRadius:'12px',padding:'8px 16px',display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#3dd68c',boxShadow:'0 0 8px #3dd68c',flexShrink:0,animation:'pulse 2s infinite'}}/>
            <div>
              <div style={{fontSize:'16px',fontWeight:800,color:'#f0f0ff'}}>{usuarios.toLocaleString('es-AR')}</div>
              <div style={{fontSize:'9px',color:'#4a4a6a',letterSpacing:'1px'}}>EN LA COMUNIDAD</div>
            </div>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div style={{borderBottom:'1px solid #16163a',padding:'60px 24px',textAlign:'center',background:'linear-gradient(180deg,#0b0b18 0%,#05050f 100%)'}}>
        <div style={{maxWidth:'700px',margin:'0 auto'}}>
          <div style={{fontSize:'11px',color:GOLD,letterSpacing:'4px',marginBottom:'16px',fontWeight:700}}>AGENCIA CHAR · ARGENTINA</div>
          <h1 style={{fontSize:'clamp(32px,5vw,52px)',fontWeight:800,margin:'0 0 16px',lineHeight:'1.2',color:'#f0f0ff'}}>
            Estrategia de marketing<br/>
            <span style={{color:GOLD}}>sin filtros.</span>
          </h1>
          <p style={{fontSize:'16px',color:'#6060a0',lineHeight:'1.7',margin:'0 0 28px'}}>
            Ideas, herramientas y tendencias para agencias que quieren resultados reales.
          </p>
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'#0b0b18',border:`1px solid ${GOLD}35`,borderRadius:'20px',padding:'10px 20px'}}>
            <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#3dd68c',boxShadow:'0 0 6px #3dd68c'}}/>
            <span style={{fontSize:'13px',color:'#9090b8'}}>
              <strong style={{color:'#f0f0ff'}}>{usuarios.toLocaleString('es-AR')} personas</strong> ya leen este blog
            </span>
          </div>
        </div>
      </div>

      {/* POSTS */}
      <div style={{maxWidth:'900px',margin:'0 auto',padding:'48px 24px'}}>

        {posts.length===0&&(
          <div style={{textAlign:'center',padding:'80px 20px'}}>
            <div style={{fontSize:'48px',marginBottom:'16px'}}>✏️</div>
            <div style={{fontSize:'18px',color:'#6060a0'}}>Próximamente. El equipo CHAR está preparando contenido.</div>
          </div>
        )}

        <div style={{display:'grid',gap:'28px'}}>
          {posts.map((post:any)=>(
            <article key={post.id} onClick={()=>setPostAbierto(postAbierto?.id===post.id?null:post)}
              style={{background:'#0b0b18',border:'1px solid #16163a',borderRadius:'16px',overflow:'hidden',cursor:'pointer',transition:'border-color 0.2s,transform 0.2s',transform:postAbierto?.id===post.id?'none':'translateY(0)'}}>
              {post.imagen_url&&(
                <img src={post.imagen_url} alt={post.titulo} style={{width:'100%',maxHeight:'400px',objectFit:'cover',display:'block'}}/>
              )}
              <div style={{padding:'28px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'12px',marginBottom:'12px',flexWrap:'wrap'}}>
                  <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                    <span style={{padding:'3px 10px',borderRadius:'20px',background:GOLD+'18',border:`1px solid ${GOLD}45`,fontSize:'10px',color:GOLD,fontWeight:700,letterSpacing:'1px'}}>CHAR</span>
                    {post.tags?.map((tag:string,i:number)=>(
                      <span key={i} style={{padding:'3px 10px',borderRadius:'20px',background:PURPLE+'18',border:`1px solid ${PURPLE}45`,fontSize:'10px',color:PURPLE,fontWeight:700}}>#{tag}</span>
                    ))}
                  </div>
                  <div style={{fontSize:'11px',color:'#4a4a6a'}}>{new Date(post.created_at).toLocaleDateString('es-AR',{day:'numeric',month:'long',year:'numeric'})}</div>
                </div>
                <h2 style={{fontSize:'22px',fontWeight:800,color:'#f0f0ff',margin:'0 0 12px',lineHeight:'1.3'}}>{post.titulo}</h2>
                {post.resumen&&<p style={{fontSize:'14px',color:GOLD,margin:'0 0 16px',fontStyle:'italic',lineHeight:'1.6'}}>{post.resumen}</p>}

                {postAbierto?.id===post.id?(
                  <div>
                    <p style={{fontSize:'14px',color:'#9090b8',lineHeight:'1.9',whiteSpace:'pre-wrap',margin:'0 0 20px'}}>{post.contenido}</p>
                    {post.video_url&&(
                      <a href={post.video_url} target="_blank" style={{display:'inline-flex',alignItems:'center',gap:'6px',color:BLUE,fontSize:'13px',textDecoration:'none',marginBottom:'20px'}}>▶ Ver video</a>
                    )}
                    <div style={{display:'flex',gap:'8px',paddingTop:'16px',borderTop:'1px solid #16163a',flexWrap:'wrap'}}>
                      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://project-gpu0d.vercel.app/blog')}`} target="_blank"
                        onClick={e=>e.stopPropagation()}
                        style={{padding:'6px 14px',borderRadius:'8px',background:BLUE+'20',color:BLUE,border:`1px solid ${BLUE}55`,fontSize:'12px',fontWeight:700,textDecoration:'none'}}>
                        Compartir en LinkedIn
                      </a>
                      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.titulo)}&url=${encodeURIComponent('https://project-gpu0d.vercel.app/blog')}`} target="_blank"
                        onClick={e=>e.stopPropagation()}
                        style={{padding:'6px 14px',borderRadius:'8px',background:PURPLE+'20',color:PURPLE,border:`1px solid ${PURPLE}55`,fontSize:'12px',fontWeight:700,textDecoration:'none'}}>
                        Compartir en X
                      </a>
                    </div>
                  </div>
                ):(
                  <div style={{fontSize:'13px',color:'#6060a0',display:'flex',alignItems:'center',gap:'6px',marginTop:'8px'}}>
                    Leer más <span style={{color:GOLD}}>→</span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{borderTop:'1px solid #16163a',padding:'32px 24px',textAlign:'center'}}>
        <div style={{fontSize:'13px',color:'#4a4a6a',marginBottom:'8px'}}>
          <span style={{color:GOLD,fontWeight:700}}>CHAR</span> · Agencia de Marketing Digital · Argentina
        </div>
        <div style={{fontSize:'11px',color:'#2a2a4a',letterSpacing:'1px'}}>
          {usuarios.toLocaleString('es-AR')} personas en la comunidad
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%,100%{opacity:1}
          50%{opacity:0.5}
        }
      `}</style>

    </div>
  )
}
