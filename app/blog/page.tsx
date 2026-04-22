'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const GOLD='#c9a96e',BLUE='#4f8fff',PURPLE='#a78bfa',GREEN='#3dd68c',RED='#f87171'
const BASE_USUARIOS = 50

export default function BlogPublico(){
  const [posts,setPosts]=useState<any[]>([])
  const [cargando,setCargando]=useState(true)
  const [usuarios,setUsuarios]=useState(BASE_USUARIOS)
  const [postAbierto,setPostAbierto]=useState<any>(null)
  const [filtro,setFiltro]=useState('todos')
  const [scroll,setScroll]=useState(0)
  const [reacciones,setReacciones]=useState<Record<string,Record<string,number>>>({})
  const [misReacciones,setMisReacciones]=useState<Record<string,string>>({})

  useEffect(()=>{
    cargarPosts()
    iniciarContador()
    window.addEventListener('scroll',()=>setScroll(window.scrollY))
    return()=>window.removeEventListener('scroll',()=>{})
  },[])

  const cargarPosts=async()=>{
    const {data}=await supabase.from('blog_posts')
      .select('*').eq('publicado',true)
      .order('created_at',{ascending:false})
    if(data){
      setPosts(data)
      const r:Record<string,Record<string,number>>={}
      data.forEach((p:any)=>{
        r[p.id]={'🔥':Math.floor(Math.random()*20)+5,'❤️':Math.floor(Math.random()*15)+3,'🧠':Math.floor(Math.random()*10)+2}
      })
      setReacciones(r)
    }
    setCargando(false)
  }

  const iniciarContador=()=>{
    const guardado=localStorage.getItem('char_blog_usuarios')
    const base=guardado?parseInt(guardado):BASE_USUARIOS
    setUsuarios(base)
    localStorage.setItem('char_blog_usuarios',(base+1).toString())
    setUsuarios(base+1)
    const intervalo=setInterval(()=>{
      setUsuarios(prev=>prev+Math.floor(Math.random()*2))
    },8000)
    return()=>clearInterval(intervalo)
  }

  const reaccionar=(postId:string,emoji:string)=>{
    if(misReacciones[postId]===emoji) return
    setReacciones(prev=>({
      ...prev,
      [postId]:{...prev[postId],[emoji]:(prev[postId]?.[emoji]||0)+1}
    }))
    setMisReacciones(prev=>({...prev,[postId]:emoji}))
  }

  const todosLosTags=Array.from(new Set(posts.flatMap((p:any)=>p.tags||[])))
  const postsFiltrados=filtro==='todos'?posts:posts.filter((p:any)=>p.tags?.includes(filtro))

  const tiempoLectura=(texto:string)=>Math.max(1,Math.ceil(texto.split(' ').length/200))

  if(cargando) return(
    <div style={{minHeight:'100vh',background:'#05050f',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'32px',marginBottom:'12px'}}>⚡</div>
        <div style={{color:GOLD,fontSize:'16px',letterSpacing:'2px'}}>CARGANDO...</div>
      </div>
    </div>
  )

  return(
    <div style={{minHeight:'100vh',background:'#05050f',fontFamily:'Rajdhani,sans-serif',color:'#f0f0ff'}}>

      {/* BARRA PROGRESO SCROLL */}
      <div style={{position:'fixed',top:0,left:0,height:'3px',background:`linear-gradient(90deg,${GOLD},${BLUE})`,width:`${Math.min(100,(scroll/((document.body.scrollHeight||1000)-window.innerHeight))*100)}%`,zIndex:999,transition:'width 0.1s'}}/>

      {/* HEADER */}
      <div style={{borderBottom:'1px solid #16163a',padding:'0 24px',position:'sticky',top:0,background:'rgba(5,5,15,0.95)',zIndex:100,backdropFilter:'blur(20px)'}}>
        <div style={{maxWidth:'1000px',margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',gap:'12px',flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{width:'38px',height:'38px',background:`linear-gradient(135deg,${GOLD},#8b6010)`,borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',boxShadow:`0 4px 16px ${GOLD}40`}}>⚡</div>
            <div>
              <div style={{fontSize:'20px',fontWeight:800,color:'#f0f0ff',letterSpacing:'1px'}}>CHAR BLOG</div>
              <div style={{fontSize:'9px',color:'#4a4a6a',letterSpacing:'3px'}}>MARKETING · ESTRATEGIA · IA</div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
            <div style={{background:'#0b0b18',border:'1px solid #16163a',borderRadius:'12px',padding:'8px 16px',display:'flex',alignItems:'center',gap:'8px'}}>
              <div style={{width:'8px',height:'8px',borderRadius:'50%',background:GREEN,boxShadow:`0 0 10px ${GREEN}`,animation:'pulse 2s infinite',flexShrink:0}}/>
              <div>
                <div style={{fontSize:'18px',fontWeight:800,color:'#f0f0ff',lineHeight:1}}>{usuarios.toLocaleString('es-AR')}</div>
                <div style={{fontSize:'9px',color:'#4a4a6a',letterSpacing:'1px'}}>EN LA COMUNIDAD</div>
              </div>
            </div>
            <a href="https://project-gpu0d.vercel.app" style={{padding:'8px 16px',borderRadius:'10px',background:`linear-gradient(135deg,${GOLD},#8b6010)`,color:'#050510',fontSize:'12px',fontWeight:800,textDecoration:'none',letterSpacing:'0.5px'}}>
              USAR CHAR CORE →
            </a>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div style={{padding:'80px 24px 60px',textAlign:'center',background:'linear-gradient(180deg,#0d0d1f 0%,#05050f 100%)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'20%',left:'10%',width:'300px',height:'300px',background:`radial-gradient(circle,${GOLD}08 0%,transparent 70%)`,borderRadius:'50%',pointerEvents:'none'}}/>
        <div style={{position:'absolute',top:'30%',right:'10%',width:'400px',height:'400px',background:`radial-gradient(circle,${BLUE}06 0%,transparent 70%)`,borderRadius:'50%',pointerEvents:'none'}}/>
        <div style={{maxWidth:'750px',margin:'0 auto',position:'relative',zIndex:1}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:`${GOLD}12`,border:`1px solid ${GOLD}30`,borderRadius:'20px',padding:'6px 16px',marginBottom:'24px'}}>
            <div style={{width:'6px',height:'6px',borderRadius:'50%',background:GOLD}}/>
            <span style={{fontSize:'11px',color:GOLD,fontWeight:700,letterSpacing:'2px'}}>AGENCIA CHAR · ARGENTINA</span>
          </div>
          <h1 style={{fontSize:'clamp(36px,6vw,64px)',fontWeight:800,margin:'0 0 20px',lineHeight:'1.1',color:'#f0f0ff'}}>
            Estrategia de marketing<br/>
            <span style={{color:GOLD}}>sin filtros.</span>
          </h1>
          <p style={{fontSize:'17px',color:'#6060a0',lineHeight:'1.7',margin:'0 0 32px',maxWidth:'550px',marginLeft:'auto',marginRight:'auto'}}>
            Ideas, herramientas y tendencias para agencias que quieren resultados reales. Sin humo.
          </p>
          <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'#0b0b18',border:`1px solid ${GREEN}30`,borderRadius:'20px',padding:'10px 20px'}}>
              <div style={{width:'6px',height:'6px',borderRadius:'50%',background:GREEN,boxShadow:`0 0 8px ${GREEN}`}}/>
              <span style={{fontSize:'13px',color:'#9090b8'}}>
                <strong style={{color:'#f0f0ff'}}>{usuarios.toLocaleString('es-AR')} personas</strong> ya leen este blog
              </span>
            </div>
            <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'#0b0b18',border:`1px solid ${BLUE}30`,borderRadius:'20px',padding:'10px 20px'}}>
              <span style={{fontSize:'13px',color:'#9090b8'}}>
                <strong style={{color:'#f0f0ff'}}>{posts.length}</strong> artículos publicados
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTROS POR TAG */}
      {todosLosTags.length>0&&(
        <div style={{padding:'20px 24px',borderBottom:'1px solid #16163a',background:'#05050f',position:'sticky',top:'66px',zIndex:90,backdropFilter:'blur(10px)'}}>
          <div style={{maxWidth:'1000px',margin:'0 auto',display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center'}}>
            <span style={{fontSize:'11px',color:'#4a4a6a',letterSpacing:'2px',marginRight:'4px'}}>FILTRAR:</span>
            {['todos',...todosLosTags].map(tag=>(
              <button key={tag} onClick={()=>setFiltro(tag)} style={{
                padding:'5px 14px',borderRadius:'20px',cursor:'pointer',fontSize:'12px',fontWeight:700,
                fontFamily:'Rajdhani,sans-serif',transition:'all 0.15s',letterSpacing:'0.5px',
                background:filtro===tag?`linear-gradient(135deg,${GOLD},#8b6010)`:GOLD+'12',
                color:filtro===tag?'#050510':GOLD,
                border:filtro===tag?'none':`1px solid ${GOLD}30`,
              }}>#{tag}</button>
            ))}
          </div>
        </div>
      )}

      {/* POSTS */}
      <div style={{maxWidth:'1000px',margin:'0 auto',padding:'48px 24px'}}>

        {postsFiltrados.length===0&&(
          <div style={{textAlign:'center',padding:'80px 20px'}}>
            <div style={{fontSize:'48px',marginBottom:'16px'}}>✏️</div>
            <div style={{fontSize:'18px',color:'#6060a0'}}>
              {filtro==='todos'?'Próximamente. El equipo CHAR está preparando contenido.':`No hay posts con el tag #${filtro}.`}
            </div>
            {filtro!=='todos'&&(
              <button onClick={()=>setFiltro('todos')} style={{marginTop:'16px',padding:'8px 20px',borderRadius:'10px',background:GOLD+'20',color:GOLD,border:`1px solid ${GOLD}55`,cursor:'pointer',fontSize:'13px',fontFamily:'Rajdhani,sans-serif',fontWeight:700}}>
                Ver todos
              </button>
            )}
          </div>
        )}

        <div style={{display:'grid',gap:'32px'}}>
          {postsFiltrados.map((post:any,idx:number)=>(
            <article key={post.id} style={{background:'#0b0b18',border:`1px solid ${postAbierto===post.id?GOLD+'55':'#16163a'}`,borderRadius:'20px',overflow:'hidden',transition:'all 0.2s',boxShadow:postAbierto===post.id?`0 8px 40px ${GOLD}15`:'none'}}>

              {post.imagen_url&&(
                <div style={{position:'relative',overflow:'hidden',maxHeight:'420px'}}>
                  <img src={post.imagen_url} alt={post.titulo} style={{width:'100%',maxHeight:'420px',objectFit:'cover',display:'block',transition:'transform 0.3s'}}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 60%,#0b0b18 100%)'}}/>
                </div>
              )}

              <div style={{padding:'28px 32px'}}>

                {/* META */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',flexWrap:'wrap',gap:'8px'}}>
                  <div style={{display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center'}}>
                    <span style={{padding:'4px 12px',borderRadius:'20px',background:GOLD+'18',border:`1px solid ${GOLD}45`,fontSize:'10px',color:GOLD,fontWeight:700,letterSpacing:'1px'}}>CHAR</span>
                    {post.tags?.slice(0,3).map((tag:string,i:number)=>(
                      <span key={i} onClick={()=>setFiltro(tag)} style={{padding:'4px 10px',borderRadius:'20px',background:PURPLE+'18',border:`1px solid ${PURPLE}45`,fontSize:'10px',color:PURPLE,fontWeight:700,cursor:'pointer'}}>#{tag}</span>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
                    <span style={{fontSize:'11px',color:'#4a4a6a'}}>{tiempoLectura(post.contenido)} min de lectura</span>
                    <span style={{fontSize:'11px',color:'#4a4a6a'}}>{new Date(post.created_at).toLocaleDateString('es-AR',{day:'numeric',month:'long'})}</span>
                  </div>
                </div>

                {/* TITULO */}
                <h2 style={{fontSize:'clamp(20px,3vw,28px)',fontWeight:800,color:'#f0f0ff',margin:'0 0 12px',lineHeight:'1.2',cursor:'pointer'}} onClick={()=>setPostAbierto(postAbierto===post.id?null:post.id)}>
                  {post.titulo}
                </h2>

                {post.resumen&&(
                  <p style={{fontSize:'15px',color:GOLD,margin:'0 0 16px',fontStyle:'italic',lineHeight:'1.6'}}>{post.resumen}</p>
                )}

                {/* PREVIEW O CONTENIDO COMPLETO */}
                {postAbierto===post.id?(
                  <div>
                    <p style={{fontSize:'14px',color:'#9090b8',lineHeight:'2',whiteSpace:'pre-wrap',margin:'0 0 24px'}}>{post.contenido}</p>
                    {post.video_url&&(
                      <a href={post.video_url} target="_blank" style={{display:'inline-flex',alignItems:'center',gap:'8px',color:BLUE,fontSize:'13px',textDecoration:'none',marginBottom:'24px',padding:'8px 16px',background:BLUE+'15',border:`1px solid ${BLUE}35`,borderRadius:'8px'}}>
                        ▶ Ver video
                      </a>
                    )}
                  </div>
                ):(
                  <p style={{fontSize:'14px',color:'#6060a0',lineHeight:'1.8',margin:'0 0 16px',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                    {post.contenido}
                  </p>
                )}

                {/* FOOTER DEL POST */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'16px',borderTop:'1px solid #16163a',flexWrap:'wrap',gap:'12px'}}>

                  {/* REACCIONES */}
                  <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                    {['🔥','❤️','🧠'].map(emoji=>(
                      <button key={emoji} onClick={()=>reaccionar(post.id,emoji)} style={{
                        display:'flex',alignItems:'center',gap:'4px',
                        padding:'5px 12px',borderRadius:'20px',cursor:'pointer',
                        fontSize:'13px',fontFamily:'Rajdhani,sans-serif',fontWeight:700,
                        background:misReacciones[post.id]===emoji?GOLD+'25':'#111124',
                        border:misReacciones[post.id]===emoji?`1px solid ${GOLD}60`:'1px solid #1e1e3a',
                        color:misReacciones[post.id]===emoji?GOLD:'#6060a0',
                        transition:'all 0.15s'
                      }}>
                        {emoji} <span>{reacciones[post.id]?.[emoji]||0}</span>
                      </button>
                    ))}
                  </div>

                  {/* ACCIONES */}
                  <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                    <button onClick={()=>setPostAbierto(postAbierto===post.id?null:post.id)} style={{
                      padding:'7px 16px',borderRadius:'10px',cursor:'pointer',fontSize:'12px',
                      fontFamily:'Rajdhani,sans-serif',fontWeight:700,transition:'all 0.15s',
                      background:postAbierto===post.id?'#1e1e3a':GOLD+'20',
                      color:postAbierto===post.id?'#9090b8':GOLD,
                      border:`1px solid ${postAbierto===post.id?'#1e1e3a':GOLD+'55'}`,
                    }}>
                      {postAbierto===post.id?'Cerrar ↑':'Leer completo →'}
                    </button>
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://project-gpu0d.vercel.app/blog')}`} target="_blank"
                      style={{padding:'7px 14px',borderRadius:'10px',background:BLUE+'20',color:BLUE,border:`1px solid ${BLUE}55`,fontSize:'12px',fontWeight:700,textDecoration:'none',fontFamily:'Rajdhani,sans-serif'}}>
                      LinkedIn
                    </a>
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.titulo)}&url=${encodeURIComponent('https://project-gpu0d.vercel.app/blog')}`} target="_blank"
                      style={{padding:'7px 14px',borderRadius:'10px',background:PURPLE+'20',color:PURPLE,border:`1px solid ${PURPLE}55`,fontSize:'12px',fontWeight:700,textDecoration:'none',fontFamily:'Rajdhani,sans-serif'}}>
                      X
                    </a>
                  </div>
                </div>

              </div>
            </article>
          ))}
        </div>

        {/* CTA NEWSLETTER */}
        <div style={{marginTop:'60px',background:'linear-gradient(135deg,#0d0d1f,#111124)',border:`1px solid ${GOLD}30`,borderRadius:'20px',padding:'48px 32px',textAlign:'center'}}>
          <div style={{fontSize:'11px',color:GOLD,letterSpacing:'3px',marginBottom:'12px',fontWeight:700}}>COMUNIDAD CHAR</div>
          <h3 style={{fontSize:'clamp(24px,4vw,36px)',fontWeight:800,color:'#f0f0ff',margin:'0 0 12px'}}>¿Querés usar CHAR CORE?</h3>
          <p style={{fontSize:'15px',color:'#6060a0',margin:'0 0 28px',lineHeight:'1.7'}}>
            La app de gestión para agencias de marketing más avanzada del mundo.<br/>Actualmente en desarrollo. Próximamente disponible.
          </p>
          <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
            <a href="https://project-gpu0d.vercel.app" style={{padding:'12px 28px',borderRadius:'12px',background:`linear-gradient(135deg,${GOLD},#8b6010)`,color:'#050510',fontSize:'14px',fontWeight:800,textDecoration:'none',letterSpacing:'0.5px',boxShadow:`0 4px 20px ${GOLD}40`}}>
              Ver CHAR CORE →
            </a>
            <a href={`https://wa.me/+54?text=${encodeURIComponent('Hola CHAR! Vi el blog y me interesa saber más sobre CHAR CORE.')}`} target="_blank"
              style={{padding:'12px 28px',borderRadius:'12px',background:GREEN+'20',color:GREEN,border:`1px solid ${GREEN}55`,fontSize:'14px',fontWeight:800,textDecoration:'none',letterSpacing:'0.5px'}}>
              Contactar por WhatsApp
            </a>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div style={{borderTop:'1px solid #16163a',padding:'32px 24px',textAlign:'center',background:'#030308'}}>
        <div style={{fontSize:'14px',color:'#4a4a6a',marginBottom:'8px'}}>
          <span style={{color:GOLD,fontWeight:800}}>CHAR</span> · Agencia de Marketing Digital · Argentina · 2026
        </div>
        <div style={{fontSize:'11px',color:'#2a2a4a',letterSpacing:'1px'}}>
          {usuarios.toLocaleString('es-AR')} personas en la comunidad · Powered by CHAR CORE
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:0.6;transform:scale(1.2)}
        }
        article:hover {
          border-color: ${GOLD}30 !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
        }
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');
      `}</style>

    </div>
  )
}
