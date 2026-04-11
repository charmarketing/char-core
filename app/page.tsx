'use client'
import { useState } from 'react'

const clientes = [
  { id: 1, nombre: 'Cliente Alfa', red: 'Instagram', horas: 2 },
  { id: 2, nombre: 'Cliente Beta', red: 'YouTube', horas: 50 },
  { id: 3, nombre: 'Cliente Gamma', red: 'LinkedIn', horas: 20 },
]

const roles = ['CEO', 'SEM', 'CM', 'SEO']

function getEstado(horas: number) {
  if (horas < 24) return { color: '#4ade80', label: 'ACTIVO', pct: 90 }
  if (horas < 48) return { color: '#facc15', label: 'ATENCIÓN', pct: 50 }
  return { color: '#f87171', label: 'URGENTE', pct: 15 }
}

const IconGrid = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
const IconUsers = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconCal = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IconFolder = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
const IconBell = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
const IconCpu = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
const IconPlus = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconTrend = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
const IconTask = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
const IconWarn = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const IconFilm = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
const IconBolt = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>

export default function Dashboard() {
  const [rolActivo, setRolActivo] = useState('CEO')

  const nav = [
    { icon: <IconGrid />, label: 'Dashboard' },
    { icon: <IconUsers />, label: 'Clientes' },
    { icon: <IconCal />, label: 'Calendario' },
    { icon: <IconFolder />, label: 'Archivos' },
    { icon: <IconBell />, label: 'Alertas' },
    { icon: <IconCpu />, label: 'Cerebro IA' },
  ]

  const metrics = [
    { label: 'Clientes Activos', val: '3', icon: <IconTrend />, color: '#c9a96e', note: '+1 este mes' },
    { label: 'Tareas Pendientes', val: '7', icon: <IconTask />, color: '#60a5fa', note: '2 vencen hoy' },
    { label: 'Alertas Críticas', val: '1', icon: <IconWarn />, color: '#f87171', note: 'Requiere acción' },
    { label: 'Clips Generados', val: '—', icon: <IconFilm />, color: '#a78bfa', note: 'Próximo módulo' },
  ]

  const s = (active: boolean) => ({
    display: 'flex' as const, alignItems: 'center' as const, gap: '10px',
    padding: '9px 14px', borderRadius: '8px', cursor: 'pointer',
    color: active ? '#c9a96e' : '#44445e',
    background: active ? '#161628' : 'transparent',
    fontWeight: active ? 600 : 400,
    fontSize: '13px', border: 'none', width: '100%',
    textAlign: 'left' as const, marginBottom: '2px',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', color: '#e2e2ee', display: 'flex', fontFamily: "'Segoe UI','SF Pro Display',system-ui,sans-serif", fontSize: '14px' }}>

      {/* SIDEBAR */}
      <aside style={{ width: '232px', background: '#0c0c1a', borderRight: '1px solid #14142a', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '28px 20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg,#c9a96e,#7a5010)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconBolt />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '1.5px', color: '#fff' }}>CHAR CORE</div>
              <div style={{ fontSize: '8px', color: '#2e2e48', letterSpacing: '2px', marginTop: '1px' }}>SISTEMA OPERATIVO</div>
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: '#14142a', margin: '0 20px 20px' }} />

        <nav style={{ padding: '0 10px', flex: 1 }}>
          <div style={{ fontSize: '9px', color: '#28284a', letterSpacing: '2px', marginBottom: '8px', paddingLeft: '14px', fontWeight: 600 }}>NAVEGACIÓN</div>
          {nav.map((item, i) => (
            <button key={i} style={s(i === 0)}>{item.icon}{item.label}</button>
          ))}

          <div style={{ height: '1px', background: '#14142a', margin: '20px 4px 16px' }} />

          <div style={{ fontSize: '9px', color: '#28284a', letterSpacing: '2px', marginBottom: '8px', paddingLeft: '14px', fontWeight: 600 }}>ROL ACTIVO</div>
          {roles.map(rol => (
            <button key={rol} onClick={() => setRolActivo(rol)} style={{
              ...s(rolActivo === rol),
              paddingLeft: '14px',
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: rolActivo === rol ? '#c9a96e' : '#24244a', flexShrink: 0 }} />
              {rol}
            </button>
          ))}
        </nav>

        <div style={{ padding: '18px 20px', borderTop: '1px solid #14142a', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', background: '#161628', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9a96e', fontWeight: 700, fontSize: '11px', border: '1px solid #2a2a4a' }}>G</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#8888aa' }}>Gabriel</div>
            <div style={{ fontSize: '10px', color: '#2e2e48' }}>Administrador</div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: '44px 52px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '44px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#2e2e4a', letterSpacing: '3px', fontWeight: 700, marginBottom: '8px' }}>PANEL {rolActivo}</div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>Vista General</h1>
            <p style={{ color: '#2e2e4a', fontSize: '12px', margin: '8px 0 0', letterSpacing: '0.5px' }}>
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button style={{ background: '#c9a96e', border: 'none', borderRadius: '8px', color: '#07070f', padding: '10px 20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px' }}>
            <IconPlus /> Nuevo Cliente
          </button>
        </div>

        {/* Métricas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '44px' }}>
          {metrics.map((m, i) => (
            <div key={i} style={{ background: '#0c0c1a', border: '1px solid #14142a', borderRadius: '12px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '56px', height: '56px', background: m.color + '0a', borderRadius: '0 12px 0 56px' }} />
              <div style={{ color: m.color, marginBottom: '16px' }}>{m.icon}</div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: '6px' }}>{m.val}</div>
              <div style={{ fontSize: '12px', color: '#44445e', marginBottom: '4px', fontWeight: 500 }}>{m.label}</div>
              <div style={{ fontSize: '10px', color: m.color, fontWeight: 600 }}>{m.note}</div>
            </div>
          ))}
        </div>

        {/* Clientes */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '9px', color: '#2e2e4a', letterSpacing: '3px', fontWeight: 700, marginBottom: '4px' }}>GESTIÓN</div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#fff' }}>Clientes Activos</h2>
            </div>
            <span style={{ fontSize: '11px', color: '#2e2e4a', letterSpacing: '1px' }}>3 / 10 slots</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            {clientes.map(c => {
              const est = getEstado(c.horas)
              return (
                <div key={c.id} style={{ background: '#0c0c1a', border: '1px solid #14142a', borderRadius: '12px', padding: '24px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', background: '#161628', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9a96e', fontWeight: 800, fontSize: '13px', border: '1px solid #1e1e38', letterSpacing: '0.5px' }}>
                        {c.nombre.charAt(8)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#fff' }}>{c.nombre}</div>
                        <div style={{ fontSize: '11px', color: '#44445e', marginTop: '2px' }}>{c.red}</div>
                      </div>
                    </div>
                    <div style={{ padding: '3px 9px', borderRadius: '20px', background: est.color + '12', border: `1px solid ${est.color}35`, fontSize: '9px', color: est.color, fontWeight: 700, letterSpacing: '1px' }}>
                      {est.label}
                    </div>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#2e2e4a' }}>Última actividad</span>
                      <span style={{ fontSize: '11px', color: est.color, fontWeight: 600 }}>{c.horas}h atrás</span>
                    </div>
                    <div style={{ height: '2px', background: '#14142a', borderRadius: '2px' }}>
                      <div style={{ height: '100%', width: `${est.pct}%`, background: est.color, borderRadius: '2px' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Ver', 'Editar', 'Alertas'].map(btn => (
                      <button key={btn} style={{ flex: 1, background: '#14142a', border: '1px solid #1c1c34', borderRadius: '6px', color: '#44445e', padding: '6px 0', fontSize: '10px', cursor: 'pointer', fontWeight: 500, letterSpacing: '0.5px' }}>{btn}</button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Panel rol */}
        <div style={{ background: '#0c0c1a', border: '1px solid #14142a', borderRadius: '12px', padding: '32px' }}>
          <div style={{ fontSize: '9px', color: '#2e2e4a', letterSpacing: '3px', fontWeight: 700, marginBottom: '6px' }}>ÁREA ACTIVA</div>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', margin: '0 0 28px' }}>Panel {rolActivo}</h2>
          <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #1c1c34', borderRadius: '8px', color: '#24244a', fontSize: '11px', letterSpacing: '2px', fontWeight: 600 }}>
            CONTENIDO DEL PANEL {rolActivo} — PRÓXIMO MÓDULO
          </div>
        </div>

      </main>
    </div>
  )
}
