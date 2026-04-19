'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const GOLD='#c9a96e'
const GREEN='#3dd68c'
const RED='#f87171'

type Theme='dark'|'light'
const D={bg:'#05050f',surface:'#0b0b18',s2:'#111124',border:'#16163a',text:'#f0f0ff',text2:'#9090b8',text3:'#4a4a6a',muted:'#2a2a4a'}
const L={bg:'#eef0f8',surface:'#ffffff',s2:'#f4f6ff',border:'#dde0f0',text:'#0d0d20',text2:'#2a2a4a',text3:'#606088',muted:'#9090aa'}
const th=(t:Theme)=>t==='dark'?D:L

export default function VPerfil({t,usuario,onLogout}:{t:Theme,usuario:string,onLogout:()=>void}){
  const c=th(t)
  const [passNueva,setPassNueva]=useState('')
  const [passConfirm,setPassConfirm]=useState('')
  const [emailInvite,setEmailInvite]=useState('')
  const [nombreInvite,setNombreInvite]=useState('')
  const [msgPass,setMsgPass]=useState('')
  const [msgInvite,setMsgInvite]=useState('')
  const [loadingPass,setLoadingPass]=useState(false)
  const [loadingInvite,setLoadingInvite]=useState(false)
  const [showPass,setShowPass]=useState(false)

  const cambiarPassword=async()=>{
    if(!passNueva||!passConfirm){setMsgPass('❌ Completá todos los campos');return}
    if(passNueva!==passConfirm){setMsgPass('❌ Las contraseñas no coinciden');return}
    if(passNueva.length<6){setMsgPass('❌ Mínimo 6 caracteres');return}
    setLoadingPass(true)
    const {error}=await supabase.auth.updateUser({password:passNueva})
    if(error){setMsgPass('❌ Error: '+error.message);setLoadingPass(false);return}
    setMsgPass('✅ Contraseña actualizada correctamente')
    setPassNueva('')
    setPassConfirm('')
    setLoadingPass(false)
  }

  const invitarMiembro=async()=>{
    if(!emailInvite){setMsgInvite('❌ Ingresá un email');return}
    setLoadingInvite(true)
    try{
      const res=await fetch('/api/invite',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email:emailInvite,nombre:nombreInvite})
      })
      const json=await res.json()
      if(!res.ok) throw new Error(json.error||'Error al invitar')
      setMsgInvite('✅ Invitación enviada a '+emailInvite)
      setEmailInvite('')
      setNombreInvite('')
    }catch(e:any){
      setMsgInvite('❌ '+e.message)
    }
    setLoadingInvite(false)
  }

  const inp=(label:string,val:string,set:(v:string)=>void,placeholder='',type='text')=>(
    <div>
      <label style={{fontSize:'10px',color:c.muted,letterSpacing:'2px',fontWeight:700}}>{label}</label>
      <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={placeholder}
        style={{width:'100%',marginTop:'5px',padding:'9px 12px',background:c.s2,
        border:`1px solid ${c.border}`,borderRadius:'8px',color:c.text,fontSize:'13px',
        outline:'none',boxSizing:'border-box' as any,fontFamily:'Rajdhani,sans-serif'}}/>
    </div>
  )

  const Card=({children,style}:any)=>(
    <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'14px',...style}}>
      {children}
    </div>
  )

  const Btn=({onClick,children,outline,loading}:any)=>(
    <button onClick={onClick} disabled={loading}
      style={{padding:'10px 20px',background:outline?'transparent':`linear-gradient(135deg,${GOLD},#7a5010)`,
      border:`1px solid ${outline?c.border:GOLD}`,borderRadius:'8px',color:outline?c.text2:'#fff',
      fontSize:'13px',fontWeight:700,cursor:'pointer',letterSpacing:'0.5px',
      fontFamily:'Rajdhani,sans-serif',opacity:loading?0.7:1,transition:'all 0.15s'}}>
      {children}
    </button>
  )

  const Msg=({msg}:any)=>msg?(
    <div style={{padding:'10px 14px',borderRadius:'8px',fontSize:'12px',textAlign:'center',
      background:msg.includes('✅')?'#3dd68c20':'#f8717120',
      border:`1px solid ${msg.includes('✅')?GREEN:RED}`,
      color:msg.includes('✅')?GREEN:RED}}>
      {msg}
    </div>
  ):null

  return(
    <div style={{display:'grid',gap:'24px',maxWidth:'600px',animation:'fadeIn 0.3s ease'}}>

      {/* HEADER */}
      <div>
        <div style={{fontSize:'10px',color:c.muted,letterSpacing:'2.5px',fontWeight:700,marginBottom:'6px'}}>CONFIGURACIÓN</div>
        <h1 style={{fontSize:'28px',fontWeight:800,margin:0,color:c.text}}>Mi Perfil</h1>
      </div>

      {/* INFO USUARIO */}
      <Card style={{padding:'24px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <div style={{width:'56px',height:'56px',background:GOLD+'20',borderRadius:'50%',
            border:`2px solid ${GOLD}55`,display:'flex',alignItems:'center',
            justifyContent:'center',color:GOLD,fontWeight:800,fontSize:'22px',
            boxShadow:`0 0 20px ${GOLD}20`}}>
            {usuario?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{fontWeight:800,fontSize:'18px',color:c.text}}>{usuario}</div>
            <div style={{fontSize:'12px',color:c.text3,marginTop:'2px'}}>Agencia CHAR — Miembro del equipo</div>
          </div>
        </div>
      </Card>

      {/* CAMBIAR CONTRASEÑA */}
      <Card style={{padding:'24px'}}>
        <div style={{fontSize:'10px',color:GOLD,letterSpacing:'2px',fontWeight:700,marginBottom:'16px'}}>CAMBIAR CONTRASEÑA</div>
        <div style={{display:'grid',gap:'12px'}}>
          {inp('NUEVA CONTRASEÑA',passNueva,setPassNueva,'Mínimo 6 caracteres',showPass?'text':'password')}
          {inp('CONFIRMAR CONTRASEÑA',passConfirm,setPassConfirm,'Repetí la contraseña',showPass?'text':'password')}
          <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer'}}>
            <input type="checkbox" checked={showPass} onChange={e=>setShowPass(e.target.checked)}/>
            <span style={{fontSize:'12px',color:c.text3}}>Mostrar contraseñas</span>
          </label>
          <Msg msg={msgPass}/>
          <Btn onClick={cambiarPassword} loading={loadingPass}>
            {loadingPass?'Guardando...':'Actualizar Contraseña'}
          </Btn>
        </div>
      </Card>

      {/* INVITAR MIEMBRO */}
      <Card style={{padding:'24px'}}>
        <div style={{fontSize:'10px',color:GOLD,letterSpacing:'2px',fontWeight:700,marginBottom:'8px'}}>INVITAR NUEVO MIEMBRO</div>
        <div style={{fontSize:'12px',color:c.text3,marginBottom:'16px',lineHeight:'1.6'}}>
          Invitá a un nuevo integrante del equipo. Recibirá un email para crear su contraseña y acceder a CHAR CORE.
        </div>
        <div style={{display:'grid',gap:'12px'}}>
          {inp('NOMBRE DEL MIEMBRO',nombreInvite,setNombreInvite,'Ej: Carlos')}
          {inp('EMAIL',emailInvite,setEmailInvite,'Ej: carlos@agenciachar.com','email')}
          <Msg msg={msgInvite}/>
          <Btn onClick={invitarMiembro} loading={loadingInvite}>
            {loadingInvite?'Enviando...':'Enviar Invitación'}
          </Btn>
        </div>
      </Card>

      {/* CERRAR SESIÓN */}
      <Card style={{padding:'24px'}}>
        <div style={{fontSize:'10px',color:GOLD,letterSpacing:'2px',fontWeight:700,marginBottom:'8px'}}>SESIÓN ACTIVA</div>
        <div style={{fontSize:'12px',color:c.text3,marginBottom:'16px'}}>
          Cerrá tu sesión actual de CHAR CORE de forma segura.
        </div>
        <Btn outline onClick={onLogout}>Cerrar Sesión</Btn>
      </Card>

    </div>
  )
}
