'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const GOLD='#c9a96e'

export default function ResetPassword(){
  const [password,setPassword]=useState('')
  const [confirm,setConfirm]=useState('')
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)
  const [listo,setListo]=useState(false)
  const [showPass,setShowPass]=useState(false)
  const [showConfirm,setShowConfirm]=useState(false)
  const [sesionLista,setSesionLista]=useState(false)

  useEffect(()=>{
    const hashParams=new URLSearchParams(window.location.hash.substring(1))
    const accessToken=hashParams.get('access_token')
    const refreshToken=hashParams.get('refresh_token')
    if(accessToken&&refreshToken){
      supabase.auth.setSession({access_token:accessToken,refresh_token:refreshToken})
        .then(()=>setSesionLista(true))
    } else {
      supabase.auth.getSession().then(({data})=>{
        if(data.session) setSesionLista(true)
        else setError('Link inválido o expirado. Solicitá uno nuevo.')
      })
    }
  },[])

  const cambiar=async()=>{
    if(!password||!confirm){setError('Completá todos los campos');return}
    if(password!==confirm){setError('Las contraseñas no coinciden');return}
    if(password.length<6){setError('Mínimo 6 caracteres');return}
    setLoading(true)
    setError('')
    const {error:err}=await supabase.auth.updateUser({password})
    if(err){setError('Error: '+err.message);setLoading(false);return}
    setListo(true)
    setLoading(false)
    setTimeout(()=>window.location.href='/',3000)
  }

  const inputStyle:any={
    width:'100%',padding:'10px 44px 10px 14px',
    background:'#111124',border:'1px solid #16163a',
    borderRadius:'8px',color:'#f0f0ff',fontSize:'14px',
    outline:'none',boxSizing:'border-box',
    fontFamily:'Rajdhani,sans-serif'
  }

  const eyeBtn:any={
    position:'absolute',right:'10px',top:'50%',
    transform:'translateY(-50%)',background:'none',
    border:'none',cursor:'pointer',color:'#4a4a6a',
    fontSize:'14px',fontWeight:700,fontFamily:'Rajdhani,sans-serif'
  }

  return(
    <div style={{
      minHeight:'100vh',background:'#05050f',
      display:'flex',alignItems:'center',justifyContent:'center',
      flexDirection:'column',fontFamily:'Rajdhani,sans-serif',
      padding:'20px',boxSizing:'border-box'
    }}>
      <div style={{textAlign:'center',marginBottom:'28px'}}>
        <div style={{fontWeight:800,fontSize:'22px',letterSpacing:'3px',color:'#f0f0ff'}}>CHAR CORE</div>
        <div style={{fontSize:'11px',color:'#4a4a6a',letterSpacing:'2.5px',marginTop:'4px'}}>SISTEMA OPERATIVO</div>
      </div>

      <div style={{
        background:'#0b0b18',border:'1px solid #16163a',
        borderRadius:'16px',padding:'32px 28px',
        width:'100%',maxWidth:'380px',boxSizing:'border-box'
      }}>
        {listo?(
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <div style={{fontSize:'40px',marginBottom:'16px'}}>✅</div>
            <div style={{fontSize:'16px',color:'#3dd68c',fontWeight:700,marginBottom:'8px'}}>Contraseña actualizada</div>
            <div style={{fontSize:'13px',color:'#9090b8'}}>Redirigiendo al inicio en 3 segundos...</div>
          </div>
        ):(
          <>
            <div style={{fontSize:'13px',color:'#9090b8',fontWeight:600,letterSpacing:'1px',marginBottom:'24px',textAlign:'center'}}>
              NUEVA CONTRASEÑA
            </div>

            {error&&(
              <div style={{background:'#f8717120',border:'1px solid #f87171',borderRadius:'8px',padding:'10px 14px',fontSize:'12px',color:'#f87171',textAlign:'center',marginBottom:'16px'}}>
                {error}
              </div>
            )}

            {sesionLista&&(
              <div style={{display:'grid',gap:'14px'}}>
                <div>
                  <label style={{fontSize:'10px',color:'#4a4a6a',letterSpacing:'2px',fontWeight:700}}>NUEVA CONTRASEÑA</label>
                  <div style={{position:'relative',marginTop:'6px'}}>
                    <input type={showPass?'text':'password'} value={password}
                      onChange={e=>setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      style={inputStyle}/>
                    <button onClick={()=>setShowPass(!showPass)} style={eyeBtn}>
                      {showPass?'●●':'●'}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{fontSize:'10px',color:'#4a4a6a',letterSpacing:'2px',fontWeight:700}}>CONFIRMAR CONTRASEÑA</label>
                  <div style={{position:'relative',marginTop:'6px'}}>
                    <input type={showConfirm?'text':'password'} value={confirm}
                      onChange={e=>setConfirm(e.target.value)}
                      onKeyDown={e=>e.key==='Enter'&&cambiar()}
                      placeholder="Repetí la contraseña"
                      style={inputStyle}/>
                    <button onClick={()=>setShowConfirm(!showConfirm)} style={eyeBtn}>
                      {showConfirm?'●●':'●'}
                    </button>
                  </div>
                </div>

                <button onClick={cambiar} disabled={loading} style={{
                  width:'100%',padding:'12px',
                  background:`linear-gradient(135deg,${GOLD},#7a5010)`,
                  border:'none',borderRadius:'8px',color:'#fff',
                  fontSize:'14px',fontWeight:700,cursor:'pointer',
                  letterSpacing:'1px',fontFamily:'Rajdhani,sans-serif',
                  opacity:loading?0.7:1,marginTop:'4px'
                }}>
                  {loading?'GUARDANDO...':'CAMBIAR CONTRASEÑA'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{fontSize:'11px',color:'#2a2a4a',marginTop:'24px',letterSpacing:'1px'}}>
        CHAR CORE © 2026 — AGENCIA CHAR
      </div>
    </div>
  )
}
