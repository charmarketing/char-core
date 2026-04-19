'use client'
import { useState, useCallback, useEffect } from 'react'
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

function Campo({label,value,onChange,placeholder='',type='text',colors}:any){
  return(
    <div>
      <label style={{fontSize:'10px',color:colors.muted,letterSpacing:'2px',fontWeight:700}}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%',marginTop:'5px',padding:'9px 12px',background:colors.s2,
        border:`1px solid ${colors.border}`,borderRadius:'8px',color:colors.text,fontSize:'13px',
        outline:'none',boxSizing:'border-box' as any,fontFamily:'Rajdhani,sans-serif'}}/>
    </div>
  )
}

function MsgBox({msg}:any){
  if(!msg) return null
  const ok=msg.includes('✅')
  return(
    <div style={{padding:'10px 14px',borderRadius:'8px',fontSize:'12px',textAlign:'center',
      background:ok?'#3dd68c20':'#f8717120',
      border:`1px solid ${ok?GREEN:RED}`,
      color:ok?GREEN:RED}}>
      {msg}
    </div>
  )
}

function CardBox({children,c,style}:any){
  return(
    <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'14px',...style}}>
      {children}
    </div>
  )
}

function BtnBox({onClick,children,outline,loading,c,small}:any){
  return(
    <button onClick={onClick} disabled={loading}
      style={{padding:small?'6px 12px':'10px 20px',
      background:outline?'transparent':`linear-gradient(135deg,${GOLD},#7a5010)`,
      border:`1px solid ${outline?c.border:GOLD}`,
      borderRadius:'8px',color:outline?c.text2:'#fff',
      fontSize:small?'11px':'13px',fontWeight:700,cursor:'pointer',
      letterSpacing:'0.5px',fontFamily:'Rajdhani,sans-serif',
      opacity:loading?0.7:1,transition:'all 0.15s'}}>
      {children}
    </button>
  )
}

function TogglePermiso({label,value,onChange,c}:any){
  return(
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',
      padding:'10px 0',borderBottom:`1px solid ${c.border}`}}>
      <span style={{fontSize:'13px',color:c.text2}}>{label}</span>
      <div onClick={()=>onChange(!value)}
        style={{width:'44px',height:'24px',borderRadius:'12px',cursor:'pointer',
        background:value?GREEN:c.s2,border:`1px solid ${value?GREEN:c.border}`,
        position:'relative',transition:'all 0.2s'}}>
        <div style={{position:'absolute',top:'3px',left:value?'22px':'3px',
          width:'18px',height:'18px',borderRadius:'50%',
          background:value?'#fff':c.text3,transition:'all 0.2s'}}/>
      </div>
    </div>
  )
}

export default function VPerfil({t,usuario,onLogout}:{t:Theme,usuario:string,onLogout:()=>void}){
  const c=th(t)
  const [rolUsuario,setRolUsuario]=useState<string>('miembro')
  const [passNueva,setPassNueva]=useState('')
  const [passConfirm,setPassConfirm]=useState('')
  const [emailInvite,setEmailInvite]=useState('')
  const [nombreInvite,setNombreInvite]=useState('')
  const [msgPass,setMsgPass]=useState('')
  const [msgInvite,setMsgInvite]=useState('')
  const [loadingPass,setLoadingPass]=useState(false)
  const [loadingInvite,setLoadingInvite]=useState(false)
  const [showPass,setShowPass]=useState(false)
  const [equipo,setEquipo]=useState<any[]>([])
  const [miembroEditando,setMiembroEditando]=useState<any>(null)
  const [permisos,setPermisos]=useState<any>({})

  useEffect(()=>{
    async function cargarDatos(){
      const {data:sessionData}=await supabase.auth.getSession()
      const email=sessionData?.session?.user?.email
      if(!email) return
      const {data}=await supabase.from('user_roles').select('*').eq('email',email).single()
      if(data) setRolUsuario(data.rol)
      const {data:equipoData}=await supabase.from('user_roles').select('*').eq('rol','miembro')
      if(equipoData) setEquipo(equipoData)
    }
    cargarDatos()
  },[])

  const cambiarPassword=useCallback(async()=>{
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
  },[passNueva,passConfirm])

  const invitarMiembro=useCallback(async()=>{
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
  },[emailInvite,nombreInvite])

  const abrirPermisos=(miembro:any)=>{
    setMiembroEditando(miembro)
    setPermisos({
      puede_agregar_clientes: miembro.puede_agregar_clientes||false,
      puede_editar_clientes: miembro.puede_editar_clientes||false,
      puede_eliminar_clientes: miembro.puede_eliminar_clientes||false,
      puede_invitar: miembro.puede_invitar||false,
    })
  }

  const guardarPermisos=async()=>{
    if(!miembroEditando) return
    await supabase.from('user_roles').update(permisos).eq('id',miembroEditando.id)
    setEquipo(prev=>prev.map(m=>m.id===miembroEditando.id?{...m,...permisos}:m))
    setMiembroEditando(null)
  }

  return(
    <div style={{display:'grid',gap:'24px',maxWidth:'600px'}}>

      <div>
        <div style={{fontSize:'10px',color:c.muted,letterSpacing:'2.5px',fontWeight:700,marginBottom:'6px'}}>CONFIGURACIÓN</div>
        <h1 style={{fontSize:'28px',fontWeight:800,margin:0,color:c.text}}>Mi Perfil</h1>
      </div>

      {/* INFO USUARIO */}
      <CardBox c={c} style={{padding:'24px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <div style={{width:'56px',height:'56px',background:GOLD+'20',borderRadius:'50%',
            border:`2px solid ${GOLD}55`,display:'flex',alignItems:'center',
            justifyContent:'center',color:GOLD,fontWeight:800,fontSize:'22px',
            boxShadow:`0 0 20px ${GOLD}20`}}>
            {usuario?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{fontWeight:800,fontSize:'18px',color:c.text}}>{usuario}</div>
            <div style={{fontSize:'12px',color:c.text3,marginTop:'2px'}}>
              Agencia CHAR — <span style={{color:rolUsuario==='admin'?GOLD:GREEN,fontWeight:700,textTransform:'uppercase'}}>{rolUsuario}</span>
            </div>
          </div>
        </div>
      </CardBox>

      {/* CAMBIAR CONTRASEÑA */}
      <CardBox c={c} style={{padding:'24px'}}>
        <div style={{fontSize:'10px',color:GOLD,letterSpacing:'2px',fontWeight:700,marginBottom:'16px'}}>CAMBIAR CONTRASEÑA</div>
        <div style={{display:'grid',gap:'12px'}}>
          <Campo label='NUEVA CONTRASEÑA' value={passNueva} onChange={setPassNueva} placeholder='Mínimo 6 caracteres' type={showPass?'text':'password'} colors={c}/>
          <Campo label='CONFIRMAR CONTRASEÑA' value={passConfirm} onChange={setPassConfirm} placeholder='Repetí la contraseña' type={showPass?'text':'password'} colors={c}/>
          <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer'}}>
            <input type="checkbox" checked={showPass} onChange={e=>setShowPass(e.target.checked)}/>
            <span style={{fontSize:'12px',color:c.text3}}>Mostrar contraseñas</span>
          </label>
          <MsgBox msg={msgPass}/>
          <BtnBox onClick={cambiarPassword} loading={loadingPass} c={c}>
            {loadingPass?'Guardando...':'Actualizar Contraseña'}
          </BtnBox>
        </div>
      </CardBox>

      {/* GESTIÓN DE EQUIPO — SOLO ADMINS */}
      {rolUsuario==='admin'&&(
        <>
          {/* INVITAR MIEMBRO */}
          <CardBox c={c} style={{padding:'24px'}}>
            <div style={{fontSize:'10px',color:GOLD,letterSpacing:'2px',fontWeight:700,marginBottom:'8px'}}>INVITAR NUEVO MIEMBRO</div>
            <div style={{fontSize:'12px',color:c.text3,marginBottom:'16px',lineHeight:'1.6'}}>
              Invitá a un nuevo integrante. Recibirá un email para crear su contraseña.
            </div>
            <div style={{display:'grid',gap:'12px'}}>
              <Campo label='NOMBRE DEL MIEMBRO' value={nombreInvite} onChange={setNombreInvite} placeholder='Ej: Carlos' colors={c}/>
              <Campo label='EMAIL' value={emailInvite} onChange={setEmailInvite} placeholder='Ej: carlos@agenciachar.com' type='email' colors={c}/>
              <MsgBox msg={msgInvite}/>
              <BtnBox onClick={invitarMiembro} loading={loadingInvite} c={c}>
                {loadingInvite?'Enviando...':'Enviar Invitación'}
              </BtnBox>
            </div>
          </CardBox>

          {/* GESTIÓN DE PERMISOS */}
          {equipo.length>0&&(
            <CardBox c={c} style={{padding:'24px'}}>
              <div style={{fontSize:'10px',color:GOLD,letterSpacing:'2px',fontWeight:700,marginBottom:'16px'}}>GESTIÓN DE EQUIPO</div>
              <div style={{display:'grid',gap:'10px'}}>
                {equipo.map(m=>(
                  <div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                    padding:'12px 16px',background:c.s2,borderRadius:'10px',border:`1px solid ${c.border}`}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:'14px',color:c.text}}>{m.nombre}</div>
                      <div style={{fontSize:'11px',color:c.text3}}>{m.email}</div>
                    </div>
                    <BtnBox small onClick={()=>abrirPermisos(m)} c={c}>
                      Permisos
                    </BtnBox>
                  </div>
                ))}
              </div>
            </CardBox>
          )}
        </>
      )}

      {/* MODAL PERMISOS */}
      {miembroEditando&&(
        <div style={{position:'fixed',inset:0,background:'#00000095',zIndex:200,
          display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div style={{background:c.surface,border:`1px solid ${c.border}`,borderRadius:'16px',
            width:'100%',maxWidth:'420px',padding:'28px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <div>
                <div style={{fontSize:'10px',color:c.muted,letterSpacing:'2px',fontWeight:700}}>PERMISOS</div>
                <h3 style={{margin:'4px 0 0',color:c.text,fontSize:'18px',fontWeight:800}}>{miembroEditando.nombre}</h3>
              </div>
              <button onClick={()=>setMiembroEditando(null)}
                style={{background:c.s2,border:`1px solid ${c.border}`,borderRadius:'8px',
                padding:'8px',cursor:'pointer',color:c.text3}}>✕</button>
            </div>
            <div style={{marginBottom:'20px'}}>
              <TogglePermiso label="Agregar clientes" value={permisos.puede_agregar_clientes} onChange={(v:boolean)=>setPermisos((p:any)=>({...p,puede_agregar_clientes:v}))} c={c}/>
              <TogglePermiso label="Editar clientes" value={permisos.puede_editar_clientes} onChange={(v:boolean)=>setPermisos((p:any)=>({...p,puede_editar_clientes:v}))} c={c}/>
              <TogglePermiso label="Eliminar clientes" value={permisos.puede_eliminar_clientes} onChange={(v:boolean)=>setPermisos((p:any)=>({...p,puede_eliminar_clientes:v}))} c={c}/>
              <TogglePermiso label="Invitar miembros" value={permisos.puede_invitar} onChange={(v:boolean)=>setPermisos((p:any)=>({...p,puede_invitar:v}))} c={c}/>
            </div>
            <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
              <BtnBox outline onClick={()=>setMiembroEditando(null)} c={c}>Cancelar</BtnBox>
              <BtnBox onClick={guardarPermisos} c={c}>Guardar Permisos</BtnBox>
            </div>
          </div>
        </div>
      )}

      {/* CERRAR SESIÓN */}
      <CardBox c={c} style={{padding:'24px'}}>
        <div style={{fontSize:'10px',color:GOLD,letterSpacing:'2px',fontWeight:700,marginBottom:'8px'}}>SESIÓN ACTIVA</div>
        <div style={{fontSize:'12px',color:c.text3,marginBottom:'16px'}}>
          Cerrá tu sesión actual de CHAR CORE de forma segura.
        </div>
        <BtnBox outline onClick={onLogout} c={c}>Cerrar Sesión</BtnBox>
      </CardBox>

    </div>
  )
}
