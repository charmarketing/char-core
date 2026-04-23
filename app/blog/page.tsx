'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const GOLD='#ffcd38',BLUE='#4f8fff',PURPLE='#a78bfa',GREEN='#3dd68c',RED='#f87171'
const BASE_USUARIOS = 50

export default function BlogPublico(){
  const [posts,setPosts]=useState<any[]>([])
  const [cargando,setCargando]=useState(true)
  const [usuarios,setUsuarios]=useState(BASE_USUARIOS)
  const [postAbierto,setPostAbierto]=useState<string|null>(null)
  const [filtro,setFiltro]=useState('todos')
  const [scroll,setScroll]=useState(0)
  const [reacciones,setReacciones]=useState<Record<string,number>>({})
  const [misLikes,setMisLikes]=useState<Record<string,boolean>>({})
  const [comentarios,setComentarios]=useState<Record<string,any[]>>({})
  const [nuevoComentario,setNuevoComentario]=useState<Record<string,{nombre:string,contenido:string}>>({})
  const [enviandoComentario,setEnviandoComentario]=useState<Record<string,boolean>>({})
  const [lightbox,setLightbox]=useState<string|null>(null)
  const [avataresVisibles,setAvataresVisibles]=useState([0,1,2,3])

  const AVATARES=[
    {inicial:'M',color:'#4f8fff'},{inicial:'S',color:'#3dd68c'},
    {inicial:'R',color:'#a78bfa'},{inicial:'L',color:'#f59e0b'},
    {inicial:'C',color:'#ffcd38'},{inicial:'P',color:'#f87171'},
    {inicial:'A',color:'#4f8fff'},{inicial:'D',color:'#3dd68c'},
    {inicial:'F',color:'#a78bfa'},{inicial:'J',color:'#f59e0b'},
    {inicial:'V',color:'#f87171'},{inicial:'N',color:'#ffcd38'},
  ]

  useEffect(()=>{
    cargarPosts()
    iniciarContador()
    const handleScroll=()=>setScroll(window.scrollY)
    window.addEventListener('scroll',handleScroll)
    return()=>window.removeEventListener('scroll',handleScroll)
  },[])

  const cargarPosts=async()=>{
    const {data}=await supabase.from('blog_posts')
      .select('*').eq('publicado',true)
      .order('created_at',{ascending:false})
    if(data){
      setPosts(data)
      const r:Record<string,number>={}
      const ml:Record<string,boolean>={}
      const likesGuardados=JSON.parse(localStorage.getItem('char_likes')||'{}')
      data.forEach((p:any)=>{
        r[p.id]=p.likes||0
        ml[p.id]=!!likesGuardados[p.id]
      })
      setReacciones(r)
      setMisLikes(ml)
    }
    setCargando(false)
  }

  const cargarComentarios=async(postId:string)=>{
    if(comentarios[postId]) return
    const {data}=await supabase.from('blog_comentarios')
      .select('*').eq('post_id',postId).eq('aprobado',true)
      .order('created_at',{ascending:true})
    if(data) setComentarios(prev=>({...prev,[postId]:data}))
  }

  const iniciarContador=()=>{
    const guardado=localStorage.getItem('char_blog_usuarios')
    const base=guardado?parseInt(guardado):BASE_USUARIOS
    setUsuarios(base+1)
    localStorage.setItem('char_blog_usuarios',(base+1).toString())
    const intervalo=setInterval(()=>{
      setUsuarios(prev=>prev+Math.floor(Math.random()*2))
      setAvataresVisibles(prev=>{
        const siguiente=[...prev]
        siguiente[Math.floor(Math.random()*4)]=Math.floor(Math.random()*AVATARES.length)
        return siguiente
      })
    },5000)
    return()=>clearInterval(intervalo)
  }

  const darLike=async(postId:string)=>{
    if(misLikes[postId]) return
    const nuevoLikes=(reacciones[postId]||0)+1
    setReacciones(prev=>({...prev,[postId]:nuevoLikes}))
    setMisLikes(prev=>({...prev,[postId]:true}))
    const likesGuardados=JSON.parse(localStorage.getItem('char_likes')||'{}')
    likesGuardados[postId]=true
    localStorage.setItem('char_likes',JSON.stringify(likesGuardados))
    await supabase.from('blog_posts').update({likes:nuevoLikes}).eq('id',postId)
  }

  const enviarComentario=async(postId:string)=>{
    const c=nuevoComentario[postId]
    if(!c?.nombre?.trim()||!c?.contenido?.trim()) return
    setEnviandoComentario(prev=>({...prev,[postId]:true}))
    const {data}=await supabase.from('blog_comentarios')
      .insert({post_id:postId,nombre:c.nombre,contenido:c.contenido})
      .select().single()
    if(data){
      setComentarios(prev=>({...prev,[postId]:[...(prev[postId]||[]),data]}))
      setNuevoComentario(prev=>({...prev,[postId]:{nombre:'',contenido:''}}))
    }
    setEnviandoComentario(prev=>({...prev,[postId]:false}))
  }

  const abrirPost=(postId:string)=>{
    if(postAbierto===postId){
      setPostAbierto(null)
    } else {
      setPostAbierto(postId)
      cargarComentarios(postId)
    }
  }

  const compartirURL=encodeURIComponent('https://project-gpu0d.vercel.app/blog')
  const todosLosTags=Array.from(new Set(posts.flatMap((p:any)=>p.tags||[])))
  const postsFiltrados=filtro==='todos'?posts:posts.filter((p:any)=>p.tags?.includes(filtro))
  const tiempoLectura=(texto:string)=>Math.max(1,Math.ceil(texto.split(' ').length/200))

  const inputSt:React.CSSProperties={
    background:'#111124',color:'#f0f0ff',border:'1px solid #16163a',
    borderRadius:'8px',padding:'10px 14px',fontFamily:'Rajdhani,sans-serif',
    fontSize:'14px',outline:'none',width:'100%',boxSizing:'border-box'
  }

  if(cargando) return(
    <div style={{minHeight:'100vh',background:'#05050f',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <img src="/fonts/logo-char.png" alt="CHAR" style={{width:'48px',height:'48px',objectFit:'contain',marginBottom:'12px'}}/>
        <div style={{color:GOLD,fontSize:'16px',letterSpacing:'2px'}}>CARGANDO...</div>
      </div>
    </div>
  )

  return(
    <div style={{minHeight:'100vh',background:'#05050f',fontFamily:'Rajdhani,sans-serif',color:'#f0f0ff'}}>

      {/* LIGHTBOX */}
      {lightbox&&(
        <div onClick={()=>setLightbox(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.95)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',padding:'20px'}}>
          <img src={lightbox} alt="imagen" style={{maxWidth:'100%',maxHeight:'100vh',objectFit:'contain',borderRadius:'8px'}}/>
          <div style={{position:'absolute',top:'20px',right:'20px',color:'#fff',fontSize:'24px',cursor:'pointer',background:'rgba(255,255,255,0.1)',borderRadius:'50%',width:'40px',height:'40px',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</div>
        </div>
      )}

      {/* BARRA PROGRESO */}
      <div style={{position:'fixed',top:0,left:0,height:'3px',background:`linear-gradient(90deg,${GOLD},${BLUE})`,width:`${Math.min(100,(scroll/Math.max(1,(document.body.scrollHeight-window.innerHeight)))*100)}%`,zIndex:999,transition:'width 0.1s'}}/>

      {/* HEADER */}
      <div style={{borderBottom:'1px solid #16163a',padding:'0 24px',position:'sticky',top:0,background:'rgba(5,5,15,0.95)',zIndex:100,backdropFilter:'blur(20px)'}}>
        <div style={{maxWidth:'1000px',margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',gap:'12px',flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <img src="/fonts/logo-char.png" alt="CHAR" style={{width:'38px',height:'38px',objectFit:'contain'}}/>
            <div>
              <div style={{fontSize:'20px',fontWeight:800,color:'#f0f0ff',letterSpacing:'1px'}}>CHAR BLOG</div>
              <div style={{fontSize:'9px',color:'#4a4a6a',letterSpacing:'3px'}}>MARKETING · ESTRATEGIA · IA</div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
            <div style={{background:'#0b0b18',border:'1px solid #16163a',borderRadius:'12px',padding:'8px 16px',display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{display:'flex',alignItems:'center'}}>
                {avataresVisibles.map((idx,i)=>(
                  <div key={`${idx}-${i}`} style={{width:'26px',height:'26px',borderRadius:'50%',background:`linear-gradient(135deg,${AVATARES[idx%AVATARES.length].color},${AVATARES[idx%AVATARES.length].color}88)`,border:'2px solid #0b0b18',marginLeft:i===0?'0':'-8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:800,color:'#fff',transition:'all 0.5s',zIndex:4-i,position:'relative'}}>
                    {AVATARES[idx%AVATARES.length].inicial}
                  </div>
                ))}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <div style={{width:'6px',height:'6px',borderRadius:'50%',background:GREEN,boxShadow:`0 0 8px ${GREEN}`,animation:'pulse 2s infinite'}}/>
                <div style={{fontSize:'16px',fontWeight:800,color:'#f0f0ff'}}>{usuarios.toLocaleString('es-AR')}</div>
              </div>
              <div style={{fontSize:'9px',color:'#4a4a6a',letterSpacing:'1px'}}>EN LA COMUNIDAD</div>
            </div>
            <a href="https://project-gpu0d.vercel.app" style={{padding:'8px 16px',borderRadius:'10px',background:`linear-gradient(135deg,${GOLD},#cc8800)`,color:'#050510',fontSize:'12px',fontWeight:800,textDecoration:'none'}}>
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
          <h1 style={{fontSize:'clamp(36px,6vw,64px)',fontWeight:800,margin:'0 0 20px',lineHeight:'1.1'}}>
            Estrategia de marketing<br/><span style={{color:GOLD}}>sin filtros.</span>
          </h1>
          <p style={{fontSize:'17px',color:'#6060a0',lineHeight:'1.7',margin:'0 0 32px'}}>
            Ideas, herramientas y tendencias para agencias que quieren resultados reales.
          </p>
          <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'#0b0b18',border:`1px solid ${GREEN}30`,borderRadius:'20px',padding:'10px 20px'}}>
              <div style={{display:'flex',alignItems:'center'}}>
                {avataresVisibles.map((idx,i)=>(
                  <div key={`hero-${idx}-${i}`} style={{width:'28px',height:'28px',borderRadius:'50%',background:`linear-gradient(135deg,${AVATARES[idx%AVATARES.length].color},${AVATARES[idx%AVATARES.length].color}88)`,border:'2px solid #0b0b18',marginLeft:i===0?'0':'-10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:800,color:'#fff',transition:'all 0.5s',zIndex:4-i,position:'relative'}}>
                    {AVATARES[idx%AVATARES.length].inicial}
                  </div>
                ))}
              </div>
              <div style={{width:'6px',height:'6px',borderRadius:'50%',background:GREEN,boxShadow:`0 0 8px ${GREEN}`}}/>
              <span style={{fontSize:'13px',color:'#9090b8'}}><strong style={{color:'#f0f0ff'}}>{usuarios.toLocaleString('es-AR')} personas</strong> ya leen este blog</span>
            </div>
            <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'#0b0b18',border:`1px solid ${BLUE}30`,borderRadius:'20px',padding:'10px 20px'}}>
              <span style={{fontSize:'13px',color:'#9090b8'}}><strong style={{color:'#f0f0ff'}}>{posts.length}</strong> artículos publicados</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      {todosLosTags.length>0&&(
        <div style={{padding:'20px 24px',borderBottom:'1px solid #16163a',background:'#05050f',position:'sticky',top:'66px',zIndex:90,backdropFilter:'blur(10px)'}}>
          <div style={{maxWidth:'1000px',margin:'0 auto',display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center'}}>
            <span style={{fontSize:'11px',color:'#4a4a6a',letterSpacing:'2px',marginRight:'4px'}}>FILTRAR:</span>
            {['todos',...todosLosTags].map(tag=>(
              <button key={tag} onClick={()=>setFiltro(tag)} style={{padding:'5px 14px',borderRadius:'20px',cursor:'pointer',fontSize:'12px',fontWeight:700,fontFamily:'Rajdhani,sans-serif',transition:'all 0.15s',background:filtro===tag?`linear-gradient(135deg,${GOLD},#cc8800)`:GOLD+'12',color:filtro===tag?'#050510':GOLD,border:filtro===tag?'none':`1px solid ${GOLD}30`}}>
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* POSTS */}
      <div style={{maxWidth:'1000px',margin:'0 auto',padding:'48px 24px'}}>
        {postsFiltrados.length===0&&(
          <div style={{textAlign:'center',padding:'80px 20px'}}>
            <div style={{fontSize:'48px',marginBottom:'16px'}}>✏️</div>
            <div style={{fontSize:'18px',color:'#6060a0'}}>Próximamente contenido de CHAR.</div>
          </div>
        )}

        <div style={{display:'grid',gap:'32px'}}>
          {postsFiltrados.map((post:any)=>(
            <article key={post.id} style={{background:'#0b0b18',border:`1px solid ${postAbierto===post.id?GOLD+'55':'#16163a'}`,borderRadius:'20px',overflow:'hidden',transition:'all 0.2s',boxShadow:postAbierto===post.id?`0 8px 40px ${GOLD}15`:'none'}}>

              {/* IMAGEN PRINCIPAL — clickeable para lightbox */}
              {post.imagen_url&&(
                <div style={{position:'relative',overflow:'hidden',cursor:'zoom-in'}} onClick={()=>setLightbox(post.imagen_url)}>
                  <img src={post.imagen_url} alt={post.titulo} style={{width:'100%',maxHeight:'500px',objectFit:'cover',display:'block',transition:'transform 0.3s'}}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 70%,#0b0b18 100%)'}}/>
                  <div style={{position:'absolute',bottom:'12px',right:'12px',background:'rgba(0,0,0,0.6)',borderRadius:'8px',padding:'4px 10px',fontSize:'11px',color:'#fff',backdropFilter:'blur(4px)'}}>
                    🔍 Ver imagen completa
                  </div>
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
                <h2 onClick={()=>abrirPost(post.id)} style={{fontSize:'clamp(20px,3vw,28px)',fontWeight:800,color:'#f0f0ff',margin:'0 0 12px',lineHeight:'1.2',cursor:'pointer'}}>
                  {post.titulo}
                </h2>

                {post.resumen&&<p style={{fontSize:'15px',color:GOLD,margin:'0 0 16px',fontStyle:'italic',lineHeight:'1.6'}}>{post.resumen}</p>}

                {/* CONTENIDO */}
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

                {/* FOOTER POST */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'16px',borderTop:'1px solid #16163a',flexWrap:'wrap',gap:'12px'}}>

                  {/* LIKES */}
                  <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                    <button onClick={()=>darLike(post.id)} style={{display:'flex',alignItems:'center',gap:'6px',padding:'6px 14px',borderRadius:'20px',cursor:misLikes[post.id]?'default':'pointer',fontSize:'13px',fontFamily:'Rajdhani,sans-serif',fontWeight:700,background:misLikes[post.id]?RED+'25':'#111124',color:misLikes[post.id]?RED:'#6060a0',border:misLikes[post.id]?`1px solid ${RED}60`:'1px solid #1e1e3a',transition:'all 0.15s'}}>
                      {misLikes[post.id]?'❤️':'🤍'} {reacciones[post.id]||0}
                    </button>
                    {postAbierto===post.id&&(
                      <span style={{fontSize:'12px',color:'#4a4a6a'}}>{(comentarios[post.id]||[]).length} comentarios</span>
                    )}
                  </div>

                  {/* ACCIONES */}
                  <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                    <button onClick={()=>abrirPost(post.id)} style={{padding:'7px 16px',borderRadius:'10px',cursor:'pointer',fontSize:'12px',fontFamily:'Rajdhani,sans-serif',fontWeight:700,background:postAbierto===post.id?'#1e1e3a':GOLD+'20',color:postAbierto===post.id?'#9090b8':GOLD,border:`1px solid ${postAbierto===post.id?'#1e1e3a':GOLD+'55'}`}}>
                      {postAbierto===post.id?'Cerrar ↑':'Leer completo →'}
                    </button>

                    {/* COMPARTIR */}
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${compartirURL}`} target="_blank"
                      style={{padding:'7px 12px',borderRadius:'10px',background:BLUE+'20',color:BLUE,border:`1px solid ${BLUE}55`,fontSize:'12px',fontWeight:700,textDecoration:'none',fontFamily:'Rajdhani,sans-serif'}}>
                      LinkedIn
                    </a>
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.titulo)}&url=${compartirURL}`} target="_blank"
                      style={{padding:'7px 12px',borderRadius:'10px',background:PURPLE+'20',color:PURPLE,border:`1px solid ${PURPLE}55`,fontSize:'12px',fontWeight:700,textDecoration:'none',fontFamily:'Rajdhani,sans-serif'}}>
                      X
                    </a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${compartirURL}`} target="_blank"
                      style={{padding:'7px 12px',borderRadius:'10px',background:'#1877f220',color:'#1877f2',border:'1px solid #1877f255',fontSize:'12px',fontWeight:700,textDecoration:'none',fontFamily:'Rajdhani,sans-serif'}}>
                      Facebook
                    </a>
                    <button onClick={()=>{navigator.clipboard.writeText('https://project-gpu0d.vercel.app/blog');alert('Link copiado — pegalo en Instagram ✅')}}
                      style={{padding:'7px 12px',borderRadius:'10px',background:'#e104764 0',color:'#e1047d',border:'1px solid #e1047d55',fontSize:'12px',fontWeight:700,cursor:'pointer',fontFamily:'Rajdhani,sans-serif',background:'#e1047d20' as any}}>
                      Instagram
                    </button>
                  </div>
                </div>

                {/* COMENTARIOS */}
                {postAbierto===post.id&&(
                  <div style={{marginTop:'28px',paddingTop:'24px',borderTop:'1px solid #16163a'}}>
                    <div style={{fontSize:'14px',fontWeight:700,color:'#f0f0ff',marginBottom:'16px',letterSpacing:'0.5px'}}>
                      💬 Comentarios ({(comentarios[post.id]||[]).length})
                    </div>

                    {/* LISTA COMENTARIOS */}
                    {(comentarios[post.id]||[]).length===0&&(
                      <div style={{fontSize:'13px',color:'#4a4a6a',marginBottom:'20px',padding:'16px',background:'#111124',borderRadius:'10px',textAlign:'center'}}>
                        Sé el primero en comentar este post.
                      </div>
                    )}
                    <div style={{display:'grid',gap:'12px',marginBottom:'20px'}}>
                      {(comentarios[post.id]||[]).map((cm:any)=>(
                        <div key={cm.id} style={{background:'#111124',border:'1px solid #1e1e3a',borderRadius:'12px',padding:'14px 16px'}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                              <div style={{width:'28px',height:'28px',borderRadius:'50%',background:`linear-gradient(135deg,${GOLD},#cc8800)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:800,color:'#050510'}}>
                                {cm.nombre.charAt(0).toUpperCase()}
                              </div>
                              <span style={{fontSize:'13px',fontWeight:700,color:'#f0f0ff'}}>{cm.nombre}</span>
                            </div>
                            <span style={{fontSize:'11px',color:'#4a4a6a'}}>{new Date(cm.created_at).toLocaleDateString('es-AR')}</span>
                          </div>
                          <p style={{fontSize:'13px',color:'#9090b8',lineHeight:'1.7',margin:0}}>{cm.contenido}</p>
                        </div>
                      ))}
                    </div>

                    {/* FORMULARIO COMENTARIO */}
                    <div style={{background:'#111124',border:'1px solid #1e1e3a',borderRadius:'12px',padding:'16px'}}>
                      <div style={{fontSize:'12px',color:'#6060a0',marginBottom:'12px',fontWeight:700,letterSpacing:'1px'}}>DEJÁ TU COMENTARIO</div>
                      <div style={{display:'grid',gap:'10px'}}>
                        <input
                          value={nuevoComentario[post.id]?.nombre||''}
                          onChange={e=>setNuevoComentario(prev=>({...prev,[post.id]:{...prev[post.id],nombre:e.target.value,contenido:prev[post.id]?.contenido||''}}))}
                          placeholder="Tu nombre"
                          style={inputSt}
                        />
                        <textarea
                          value={nuevoComentario[post.id]?.contenido||''}
                          onChange={e=>setNuevoComentario(prev=>({...prev,[post.id]:{...prev[post.id],contenido:e.target.value,nombre:prev[post.id]?.nombre||''}}))}
                          placeholder="Escribí tu comentario..."
                          style={{...inputSt,height:'80px',resize:'none'}}
                        />
                        <button
                          onClick={()=>enviarComentario(post.id)}
                          disabled={enviandoComentario[post.id]||!nuevoComentario[post.id]?.nombre?.trim()||!nuevoComentario[post.id]?.contenido?.trim()}
                          style={{padding:'10px 20px',borderRadius:'10px',background:`linear-gradient(135deg,${GOLD},#cc8800)`,color:'#050510',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:800,fontFamily:'Rajdhani,sans-serif',opacity:enviandoComentario[post.id]?0.6:1}}>
                          {enviandoComentario[post.id]?'Enviando...':'Publicar comentario'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div style={{marginTop:'60px',background:'linear-gradient(135deg,#0d0d1f,#111124)',border:`1px solid ${GOLD}30`,borderRadius:'20px',padding:'48px 32px',textAlign:'center'}}>
          <div style={{fontSize:'11px',color:GOLD,letterSpacing:'3px',marginBottom:'12px',fontWeight:700}}>COMUNIDAD CHAR</div>
          <h3 style={{fontSize:'clamp(24px,4vw,36px)',fontWeight:800,color:'#f0f0ff',margin:'0 0 12px'}}>¿Querés usar CHAR CORE?</h3>
          <p style={{fontSize:'15px',color:'#6060a0',margin:'0 0 28px',lineHeight:'1.7'}}>La app de gestión para agencias de marketing más avanzada del mundo.</p>
          <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
            <a href="https://project-gpu0d.vercel.app" style={{padding:'12px 28px',borderRadius:'12px',background:`linear-gradient(135deg,${GOLD},#cc8800)`,color:'#050510',fontSize:'14px',fontWeight:800,textDecoration:'none',boxShadow:`0 4px 20px ${GOLD}40`}}>
              Ver CHAR CORE →
            </a>
            <a href={`https://wa.me/+54?text=${encodeURIComponent('Hola CHAR! Vi el blog y me interesa saber más sobre CHAR CORE.')}`} target="_blank"
              style={{padding:'12px 28px',borderRadius:'12px',background:GREEN+'20',color:GREEN,border:`1px solid ${GREEN}55`,fontSize:'14px',fontWeight:800,textDecoration:'none'}}>
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
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(1.2)}}
        article:hover{border-color:${GOLD}30!important;transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,0.3)!important;}
      `}</style>

    </div>
  )
}
