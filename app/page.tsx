'use client'
import { useState } from 'react'

// ─────────────────────────────────────────────
// DATOS BASE (luego vendrán de Supabase)
// ─────────────────────────────────────────────
const CLIENTES = [
  { id: 1, nombre: 'Cliente Alfa', red: 'Instagram', horas: 2, tareas: 3, campañas: 1, color: '#c9a96e' },
  { id: 2, nombre: 'Cliente Beta', red: 'YouTube', horas: 50, tareas: 5, campañas: 0, color: '#60a5fa' },
  { id: 3, nombre: 'Cliente Gamma', red: 'LinkedIn', horas: 20, tareas: 2, campañas: 1, color: '#a78bfa' },
]

const TAREAS_URGENTES = [
  { id: 1, texto: 'Crear calendario de contenido Mayo — Alfa', rol: 'CM', prioridad: 'alta' },
  { id: 2, texto: 'Configurar primera campaña Google Ads', rol: 'SEM', prioridad: 'alta' },
  { id: 3, texto: 'Revisar propuesta para Cliente Beta', rol: 'CEO', prioridad: 'alta' },
  { id: 4, texto: 'Auditoría SEO inicial — Cliente Alfa', rol: 'SEO', prioridad: 'media' },
  { id: 5, texto: 'Grabar CHAR Session para Cliente Beta', rol: 'CM', prioridad: 'media' },
]

const ALERTAS = [
  { id: 1, tipo: 'urgente', texto: 'Cliente Beta sin actividad hace 50hs', cliente: 'Cliente Beta', tiempo: 'hace 2h' },
  { id: 2, tipo: 'info', texto: 'Calendario de Mayo sin planificar — Alfa', cliente: 'Cliente Alfa', tiempo: 'hace 5h' },
  { id: 3, tipo: 'info', texto: 'Campaña SEM de Gamma sin iniciar', cliente: 'Cliente Gamma', tiempo: 'hace 1d' },
]

const NOTICIAS = [
  { titulo: 'Instagram actualiza el algoritmo de Reels: más peso al tiempo de visualización', fuente: 'Social Media Today', tiempo: 'hace 3h' },
  { titulo: 'Google Ads lanza nuevas métricas de conversión con IA predictiva', fuente: 'Search Engine Journal', tiempo: 'hace 5h' },
  { titulo: 'LinkedIn supera 1B de usuarios: oportunidades para marcas B2B en 2026', fuente: 'Marketing Dive', tiempo: 'hace 8h' },
]

const RESUMEN_ROLES = [
  { rol: 'CEO', tareas: 5, pendientes: 4, color: '#c9a96e' },
  { rol: 'CM', tareas: 7, pendientes: 6, color: '#4ade80' },
  { rol: 'SEM', tareas: 5, pendientes: 5, color: '#60a5fa' },
  { rol: 'SEO', tareas: 5, pendientes: 5, color: '#a78bfa' },
]

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function saludo() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function estadoCliente(horas: number) {
  if (horas < 24) return { color: '#4ade80', label: 'ACTIVO', pct: 90 }
  if (horas < 48) return { color: '#facc15', label: 'ATENCIÓN', pct: 50 }
  return { color: '#f87171', label: 'URGENTE', pct: 15 }
}

const rolColor: Record<string, string> = {
  CEO: '#c9a96e', CM: '#4ade80', SEM: '#60a5fa', SEO: '#a78bfa'
}

// ─────────────────────────────────────────────
// ICONOS
// ─────────────────────────────────────────────
const Ico = {
  grid:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  users:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  cal:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  folder:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  bell:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  cpu:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  bolt:    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  warn:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  info:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  news:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/></svg>,
  trend:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  check:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  plus:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  task:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  chart:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  target:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  film:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>,
  search:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  dollar:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  pen:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  link:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  eye:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  upload:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
}

// ─────────────────────────────────────────────
// UI ATOMS
// ─────────────────────────────────────────────
const C = '#07070f'
const C2 = '#0c0c1a'
const C3 = '#14142a'
const C4 = '#1c1c34'
const GOLD = '#c9a96e'

const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: C2, border: `1px solid ${C3}`, borderRadius: '12px', padding: '22px', ...style }}>
    {children}
  </div>
)

const EyeBrow = ({ text }: { text: string }) => (
  <div style={{ fontSize: '9px', color: '#2a2a4a', letterSpacing: '3px', fontWeight: 700, marginBottom: '4px' }}>{text}</div>
)

const SectionHead = ({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '18px' }}>
    <div><EyeBrow text={eyebrow} /><h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#fff' }}>{title}</h2></div>
    {action}
  </div>
)

const Tag = ({ label, color }: { label: string; color: string }) => (
  <span style={{ padding: '2px 9px', borderRadius: '20px', background: color + '15', border: `1px solid ${color}35`, fontSize: '9px', color, fontWeight: 700, letterSpacing: '1px' }}>
    {label}
  </span>
)

const Divider = () => <div style={{ height: '1px', background: C3, margin: '0 0 16px' }} />

const Btn = ({ children, onClick, variant = 'ghost' }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'outline' }) => {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: GOLD, color: C, border: 'none', fontWeight: 700 },
    ghost:   { background: C4, color: '#6666aa', border: `1px solid ${C4}`, fontWeight: 500 },
    outline: { background: 'transparent', color: GOLD, border: `1px solid ${GOLD}40`, fontWeight: 600 },
  }
  return (
    <button onClick={onClick} style={{ ...styles[variant], padding: '7px 16px', borderRadius: '7px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.3px' }}>
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────
// VISTA: DASHBOARD
// ─────────────────────────────────────────────
function VistaDashboard({ irA }: { irA: (vista: string) => void }) {
  const fecha = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ display: 'grid', gap: '28px' }}>

      {/* Briefing matutino */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <EyeBrow text="CENTRO DE COMANDO" />
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px', color: '#fff', letterSpacing: '-0.5px' }}>
            {saludo()}, Gabriel
          </h1>
          <p style={{ color: '#3a3a5a', fontSize: '12px', margin: 0, letterSpacing: '0.5px', textTransform: 'capitalize' }}>{fecha}</p>
        </div>
        <Btn variant="primary" onClick={() => irA('clientes')}>{Ico.plus} Nuevo Cliente</Btn>
      </div>

      {/* Semáforo de clientes */}
      <div>
        <SectionHead eyebrow="ESTADO EN TIEMPO REAL" title="Semáforo de Clientes" action={<span style={{ fontSize: '11px', color: '#2a2a4a' }}>3 / 10 slots</span>} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
          {CLIENTES.map(c => {
            const est = estadoCliente(c.horas)
            return (
              <Card key={c.id} style={{ padding: '18px', cursor: 'pointer', borderTop: `2px solid ${est.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', background: C4, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, fontWeight: 800, fontSize: '12px', border: `1px solid ${C4}` }}>
                      {c.nombre.charAt(8)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#e0e0ee' }}>{c.nombre}</div>
                      <div style={{ fontSize: '10px', color: '#3a3a5a' }}>{c.red}</div>
                    </div>
                  </div>
                  <Tag label={est.label} color={est.color} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', color: '#2a2a4a' }}>Actividad</span>
                  <span style={{ fontSize: '10px', color: est.color, fontWeight: 600 }}>{c.horas}h atrás</span>
                </div>
                <div style={{ height: '2px', background: C3, borderRadius: '2px' }}>
                  <div style={{ height: '100%', width: `${est.pct}%`, background: est.color, borderRadius: '2px' }} />
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                  <span style={{ fontSize: '10px', color: '#44445e' }}>{c.tareas} tareas</span>
                  <span style={{ fontSize: '10px', color: '#2a2a4a' }}>·</span>
                  <span style={{ fontSize: '10px', color: '#44445e' }}>{c.campañas} campañas</span>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Fila: tareas urgentes + alertas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Top tareas urgentes */}
        <Card>
          <SectionHead eyebrow="HOY" title="Tareas Prioritarias" action={<Btn onClick={() => irA('ceo')}>Ver todas</Btn>} />
          <Divider />
          {TAREAS_URGENTES.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: `1px solid ${C3}` }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.prioridad === 'alta' ? '#f87171' : '#facc15', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#8888aa', flex: 1, lineHeight: '1.4' }}>{t.texto}</span>
              <Tag label={t.rol} color={rolColor[t.rol]} />
            </div>
          ))}
        </Card>

        {/* Alertas activas */}
        <Card>
          <SectionHead eyebrow="NOTIFICACIONES" title="Alertas Activas" />
          <Divider />
          {ALERTAS.map(a => (
            <div key={a.id} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: `1px solid ${C3}` }}>
              <div style={{ color: a.tipo === 'urgente' ? '#f87171' : '#facc15', marginTop: '1px', flexShrink: 0 }}>
                {a.tipo === 'urgente' ? Ico.warn : Ico.info}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#8888aa', lineHeight: '1.4' }}>{a.texto}</div>
                <div style={{ fontSize: '10px', color: '#2a2a4a', marginTop: '4px' }}>{a.tiempo}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Estado por rol */}
      <div>
        <SectionHead eyebrow="EQUIPO" title="Estado por Área" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
          {RESUMEN_ROLES.map(r => (
            <Card key={r.rol} style={{ padding: '18px', cursor: 'pointer' }} >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: r.color, letterSpacing: '1px' }}>{r.rol}</span>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.pendientes > 0 ? '#f87171' : '#4ade80' }} />
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: '6px' }}>{r.pendientes}</div>
              <div style={{ fontSize: '10px', color: '#2a2a4a' }}>tareas pendientes</div>
              <div style={{ height: '2px', background: C3, borderRadius: '2px', marginTop: '12px' }}>
                <div style={{ height: '100%', width: `${((r.tareas - r.pendientes) / r.tareas) * 100}%`, background: r.color, borderRadius: '2px' }} />
              </div>
              <div style={{ fontSize: '10px', color: '#2a2a4a', marginTop: '6px' }}>{r.tareas - r.pendientes} / {r.tareas} completadas</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Daily Blog */}
      <div>
        <SectionHead eyebrow="INTELIGENCIA DE MERCADO" title="Marketing Daily" action={<Tag label="AUTO-ACTUALIZA CON IA" color={GOLD} />} />
        <div style={{ display: 'grid', gap: '10px' }}>
          {NOTICIAS.map((n, i) => (
            <Card key={i} style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ color: GOLD, marginTop: '1px', flexShrink: 0 }}>{Ico.news}</div>
                <div>
                  <div style={{ fontSize: '13px', color: '#ccccdd', fontWeight: 500, lineHeight: '1.4' }}>{n.titulo}</div>
                  <div style={{ fontSize: '10px', color: '#2a2a4a', marginTop: '4px' }}>{n.fuente} · {n.tiempo}</div>
                </div>
              </div>
              <div style={{ color: '#2a2a4a', flexShrink: 0, marginLeft: '16px' }}>{Ico.link}</div>
            </Card>
          ))}
        </div>
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────
// VISTA: CLIENTES
// ─────────────────────────────────────────────
function VistaClientes() {
  const [seleccionado, setSeleccionado] = useState<number | null>(null)
  return (
    <div style={{ display: 'grid', gap: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div><EyeBrow text="GESTIÓN" /><h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, color: '#fff' }}>Clientes</h1></div>
        <Btn variant="primary">{Ico.plus} Nuevo Cliente</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
        {CLIENTES.map(c => {
          const est = estadoCliente(c.horas)
          const activo = seleccionado === c.id
          return (
            <Card key={c.id} style={{ cursor: 'pointer', borderColor: activo ? GOLD + '60' : C3 }} >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: C4, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, fontWeight: 800, fontSize: '14px' }}>
                    {c.nombre.charAt(8)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{c.nombre}</div>
                    <div style={{ fontSize: '11px', color: '#3a3a5a', marginTop: '2px' }}>{c.red}</div>
                  </div>
                </div>
                <Tag label={est.label} color={est.color} />
              </div>
              <Divider />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                {[
                  { label: 'Tareas activas', val: String(c.tareas) },
                  { label: 'Campañas', val: String(c.campañas) },
                  { label: 'Última actividad', val: `${c.horas}h` },
                  { label: 'Red principal', val: c.red },
                ].map((d, i) => (
                  <div key={i} style={{ background: C3, borderRadius: '8px', padding: '10px 12px' }}>
                    <div style={{ fontSize: '9px', color: '#2a2a4a', letterSpacing: '1px', marginBottom: '4px' }}>{d.label.toUpperCase()}</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#ccc' }}>{d.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Btn>{Ico.eye} Ver</Btn>
                <Btn>{Ico.pen} Editar</Btn>
                <Btn>{Ico.bell} Alertas</Btn>
              </div>
            </Card>
          )
        })}
        {/* Slot vacío */}
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', cursor: 'pointer', border: `1px dashed ${C4}` }}>
          <div style={{ color: C4, marginBottom: '10px' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
          <div style={{ fontSize: '12px', color: '#2a2a4a', fontWeight: 500 }}>Agregar cliente</div>
        </Card>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// VISTA: PANELES DE ROL
// ─────────────────────────────────────────────
function VistaCEO() {
  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div><EyeBrow text="DIRECCIÓN EJECUTIVA" /><h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, color: '#fff' }}>Panel CEO</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Card>
          <EyeBrow text="KPIs GLOBALES" /><Divider />
          {[['Clientes activos','3 / 10'],['Ingresos estimados','—'],['Tareas completadas','12 / 22'],['Clips generados','0'],['Alertas críticas','1']].map(([l,v],i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:`1px solid ${C3}`}}>
              <span style={{fontSize:'12px',color:'#44445e'}}>{l}</span>
              <span style={{fontSize:'13px',fontWeight:700,color:GOLD}}>{v}</span>
            </div>
          ))}
        </Card>
        <Card>
          <EyeBrow text="EQUIPO" /><Divider />
          {[{n:'Gabriel',r:'Dev / Ops'},{n:'Adri',r:'Gestor de Proyectos'}].map((m,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${C3}`}}>
              <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                <div style={{width:'28px',height:'28px',background:C4,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:GOLD,fontWeight:700,fontSize:'11px'}}>{m.n[0]}</div>
                <div><div style={{fontSize:'12px',color:'#ccc',fontWeight:600}}>{m.n}</div><div style={{fontSize:'10px',color:'#2a2a4a'}}>{m.r}</div></div>
              </div>
              <Tag label="ACTIVO" color="#4ade80" />
            </div>
          ))}
        </Card>
      </div>
      <Card>
        <EyeBrow text="TAREAS EJECUTIVAS" /><Divider />
        {[{t:'Revisar propuesta para Cliente Beta',p:'alta'},{t:'Definir estrategia Q2 con Adri',p:'media'},{t:'Configurar módulo de facturación',p:'normal'},{t:'Revisar métricas semanales',p:'done'},{t:'Actualizar filosofía CHAR en Cerebro IA',p:'normal'}].map((item,i)=>{
          const pc = item.p==='alta'?'#f87171':item.p==='media'?'#facc15':'#2a2a4a'
          return (
            <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 0',borderBottom:`1px solid ${C3}`}}>
              <div style={{width:'16px',height:'16px',borderRadius:'4px',border:`1px solid ${item.p==='done'?'#4ade80':C4}`,background:item.p==='done'?'#4ade8015':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {item.p==='done'&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <span style={{fontSize:'12px',color:item.p==='done'?'#2a2a4a':'#8888aa',textDecoration:item.p==='done'?'line-through':'none',flex:1}}>{item.t}</span>
              {item.p!=='done'&&item.p!=='normal'&&<Tag label={item.p.toUpperCase()} color={pc}/>}
            </div>
          )
        })}
      </Card>
    </div>
  )
}

function VistaSEM() {
  return (
    <div style={{display:'grid',gap:'24px'}}>
      <div><EyeBrow text="SEARCH ENGINE MARKETING" /><h1 style={{fontSize:'26px',fontWeight:800,margin:0,color:'#fff'}}>Panel SEM</h1></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <Card>
          <EyeBrow text="CAMPAÑAS ACTIVAS" /><Divider />
          {[{n:'Google Ads — Alfa',e:'ACTIVA',c:'#4ade80',p:'$0/mes'},{n:'Meta Ads — Beta',e:'PAUSADA',c:'#facc15',p:'$0/mes'},{n:'Google Ads — Gamma',e:'SIN INICIAR',c:'#44445e',p:'—'}].map((c,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${C3}`}}>
              <div><div style={{fontSize:'12px',color:'#ccc',fontWeight:500}}>{c.n}</div><div style={{fontSize:'10px',color:'#2a2a4a',marginTop:'2px'}}>Presupuesto: {c.p}</div></div>
              <Tag label={c.e} color={c.c}/>
            </div>
          ))}
        </Card>
        <Card>
          <EyeBrow text="MÉTRICAS SEM" /><Divider />
          {[['Impresiones totales','—'],['Clics totales','—'],['CTR promedio','—'],['Costo por clic','—'],['Conversiones','—'],['ROAS promedio','—']].map(([l,v],i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:`1px solid ${C3}`}}>
              <span style={{fontSize:'12px',color:'#44445e'}}>{l}</span>
              <span style={{fontSize:'13px',fontWeight:700,color:'#60a5fa'}}>{v}</span>
            </div>
          ))}
        </Card>
      </div>
      <Card>
        <EyeBrow text="TAREAS SEM" /><Divider />
        {['Configurar primera campaña Google Ads','Definir keywords para Cliente Alfa','Conectar Google Analytics a la app','Investigar competencia en SEM — Gamma','Revisar landing pages de clientes'].map((t,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 0',borderBottom:`1px solid ${C3}`}}>
            <div style={{width:'16px',height:'16px',borderRadius:'4px',border:`1px solid ${C4}`,flexShrink:0}}/>
            <span style={{fontSize:'12px',color:'#8888aa'}}>{t}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}

function VistaCM() {
  return (
    <div style={{display:'grid',gap:'24px'}}>
      <div><EyeBrow text="COMMUNITY MANAGEMENT" /><h1 style={{fontSize:'26px',fontWeight:800,margin:0,color:'#fff'}}>Panel CM</h1></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <Card>
          <EyeBrow text="CONTENIDO ESTA SEMANA" /><Divider />
          {[{c:'Cliente Alfa',r:'Instagram',p:'3 posts',e:'PLANIFICADO',col:'#facc15'},{c:'Cliente Beta',r:'YouTube',p:'1 video',e:'PENDIENTE',col:'#f87171'},{c:'Cliente Gamma',r:'LinkedIn',p:'2 artículos',e:'PUBLICADO',col:'#4ade80'}].map((item,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${C3}`}}>
              <div><div style={{fontSize:'12px',color:'#ccc',fontWeight:500}}>{item.c}</div><div style={{fontSize:'10px',color:'#2a2a4a',marginTop:'2px'}}>{item.r} · {item.p}</div></div>
              <Tag label={item.e} color={item.col}/>
            </div>
          ))}
        </Card>
        <Card>
          <EyeBrow text="MÉTRICAS CM" /><Divider />
          {[['Posts publicados','2'],['Alcance promedio','—'],['Engagement rate','—'],['Seguidores ganados','—'],['Stories programadas','0'],['Comentarios respondidos','—']].map(([l,v],i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:`1px solid ${C3}`}}>
              <span style={{fontSize:'12px',color:'#44445e'}}>{l}</span>
              <span style={{fontSize:'13px',fontWeight:700,color:'#4ade80'}}>{v}</span>
            </div>
          ))}
        </Card>
      </div>
      <Card>
        <EyeBrow text="TAREAS CM" /><Divider />
        {[{t:'Crear calendario de contenido Mayo — Alfa',p:'alta'},{t:'Grabar CHAR Session para Cliente Beta',p:'alta'},{t:'Responder comentarios — Gamma LinkedIn',p:'media'},{t:'Diseñar 3 stories template para Alfa',p:'normal'},{t:'Revisar estética de feed — Cliente Gamma',p:'done'}].map((item,i)=>{
          const pc=item.p==='alta'?'#f87171':item.p==='media'?'#facc15':'#2a2a4a'
          return(
            <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 0',borderBottom:`1px solid ${C3}`}}>
              <div style={{width:'16px',height:'16px',borderRadius:'4px',border:`1px solid ${item.p==='done'?'#4ade80':C4}`,background:item.p==='done'?'#4ade8015':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {item.p==='done'&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <span style={{fontSize:'12px',color:item.p==='done'?'#2a2a4a':'#8888aa',textDecoration:item.p==='done'?'line-through':'none',flex:1}}>{item.t}</span>
              {item.p!=='done'&&item.p!=='normal'&&<Tag label={item.p.toUpperCase()} color={pc}/>}
            </div>
          )
        })}
      </Card>
    </div>
  )
}

function VistaSEO() {
  return (
    <div style={{display:'grid',gap:'24px'}}>
      <div><EyeBrow text="SEARCH ENGINE OPTIMIZATION" /><h1 style={{fontSize:'26px',fontWeight:800,margin:0,color:'#fff'}}>Panel SEO</h1></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <Card>
          <EyeBrow text="POSICIONAMIENTO" /><Divider />
          {CLIENTES.map((c,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${C3}`}}>
              <div><div style={{fontSize:'12px',color:'#ccc',fontWeight:500}}>{c.nombre}</div><div style={{fontSize:'10px',color:'#2a2a4a',marginTop:'2px'}}>Keyword principal: Sin asignar</div></div>
              <span style={{fontSize:'13px',fontWeight:700,color:'#44445e'}}>—</span>
            </div>
          ))}
        </Card>
        <Card>
          <EyeBrow text="MÉTRICAS SEO" /><Divider />
          {[['Domain Authority','—'],['Backlinks totales','—'],['Keywords top 10','—'],['Tráfico orgánico','—'],['Páginas indexadas','—'],['Velocidad promedio','—']].map(([l,v],i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:`1px solid ${C3}`}}>
              <span style={{fontSize:'12px',color:'#44445e'}}>{l}</span>
              <span style={{fontSize:'13px',fontWeight:700,color:'#a78bfa'}}>{v}</span>
            </div>
          ))}
        </Card>
      </div>
      <Card>
        <EyeBrow text="TAREAS SEO" /><Divider />
        {['Auditoría SEO inicial — Cliente Alfa','Investigación de keywords — Gamma','Optimizar meta descriptions — Beta','Instalar Google Search Console en clientes','Generar reporte mensual de posicionamiento'].map((t,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 0',borderBottom:`1px solid ${C3}`}}>
            <div style={{width:'16px',height:'16px',borderRadius:'4px',border:`1px solid ${C4}`,flexShrink:0}}/>
            <span style={{fontSize:'12px',color:'#8888aa'}}>{t}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────
// VISTAS: PLACEHOLDER PARA MÓDULOS FUTUROS
// ─────────────────────────────────────────────
function VistaPlaceholder({ titulo, descripcion }: { titulo: string; descripcion: string }) {
  return (
    <div style={{display:'grid',gap:'24px'}}>
      <div><h1 style={{fontSize:'26px',fontWeight:800,margin:0,color:'#fff'}}>{titulo}</h1></div>
      <Card style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'300px',border:`1px dashed ${C4}`}}>
        <div style={{fontSize:'11px',color:'#2a2a4a',letterSpacing:'2px',fontWeight:600,textAlign:'center'}}>{descripcion}</div>
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────
// APP PRINCIPAL
// ─────────────────────────────────────────────
const VISTAS: Record<string, { label: string; icon: React.ReactNode; grupo: string }> = {
  dashboard: { label: 'Dashboard', icon: Ico.grid, grupo: 'nav' },
  clientes:  { label: 'Clientes',  icon: Ico.users, grupo: 'nav' },
  calendario:{ label: 'Calendario',icon: Ico.cal, grupo: 'nav' },
  archivos:  { label: 'Archivos',  icon: Ico.folder, grupo: 'nav' },
  alertas:   { label: 'Alertas',   icon: Ico.bell, grupo: 'nav' },
  ia:        { label: 'Cerebro IA',icon: Ico.cpu, grupo: 'nav' },
  ceo:       { label: 'CEO',  icon: Ico.chart,  grupo: 'rol' },
  cm:        { label: 'CM',   icon: Ico.pen,    grupo: 'rol' },
  sem:       { label: 'SEM',  icon: Ico.target, grupo: 'rol' },
  seo:       { label: 'SEO',  icon: Ico.search, grupo: 'rol' },
}

export default function App() {
  const [vista, setVista] = useState('dashboard')

  const renderVista = () => {
    switch(vista) {
      case 'dashboard':  return <VistaDashboard irA={setVista} />
      case 'clientes':   return <VistaClientes />
      case 'ceo':        return <VistaCEO />
      case 'sem':        return <VistaSEM />
      case 'cm':         return <VistaCM />
      case 'seo':        return <VistaSEO />
      case 'calendario': return <VistaPlaceholder titulo="Calendario" descripcion="MÓDULO 3 — EN CONSTRUCCIÓN" />
      case 'archivos':   return <VistaPlaceholder titulo="Archivos" descripcion="MÓDULO 5 — EN CONSTRUCCIÓN" />
      case 'alertas':    return <VistaPlaceholder titulo="Alertas" descripcion="MÓDULO 4 — EN CONSTRUCCIÓN" />
      case 'ia':         return <VistaPlaceholder titulo="Cerebro IA" descripcion="MÓDULO 6 — EN CONSTRUCCIÓN" />
      default:           return <VistaDashboard irA={setVista} />
    }
  }

  const btnSidebar = (key: string): React.CSSProperties => ({
    display:'flex', alignItems:'center', gap:'10px',
    padding:'9px 14px', borderRadius:'8px', cursor:'pointer',
    color: vista===key ? GOLD : '#3a3a5a',
    background: vista===key ? '#161628' : 'transparent',
    fontWeight: vista===key ? 600 : 400,
    fontSize:'13px', border:'none', width:'100%',
    textAlign:'left', marginBottom:'2px',
  })

  const navItems = ['dashboard','clientes','calendario','archivos','alertas','ia']
  const rolItems = ['ceo','cm','sem','seo']

  return (
    <div style={{ minHeight:'100vh', background:C, color:'#e2e2ee', display:'flex', fontFamily:"'Segoe UI','SF Pro Display',system-ui,sans-serif", fontSize:'14px' }}>

      {/* SIDEBAR */}
      <aside style={{ width:'232px', background:C2, borderRight:`1px solid ${C3}`, display:'flex', flexDirection:'column', flexShrink:0, position:'sticky', top:0, height:'100vh' }}>
        <div style={{ padding:'28px 20px 24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'30px', height:'30px', background:'linear-gradient(135deg,#c9a96e,#7a5010)', borderRadius:'7px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {Ico.bolt}
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:'14px', letterSpacing:'1.5px', color:'#fff' }}>CHAR CORE</div>
              <div style={{ fontSize:'8px', color:'#28284a', letterSpacing:'2px', marginTop:'1px' }}>SISTEMA OPERATIVO</div>
            </div>
          </div>
        </div>

        <div style={{ height:'1px', background:C3, margin:'0 20px 20px' }} />

        <nav style={{ padding:'0 10px', flex:1, overflowY:'auto' }}>
          <div style={{ fontSize:'9px', color:'#24244a', letterSpacing:'2px', marginBottom:'8px', paddingLeft:'14px', fontWeight:600 }}>NAVEGACIÓN</div>
          {navItems.map(k => (
            <button key={k} onClick={() => setVista(k)} style={btnSidebar(k)}>
              {VISTAS[k].icon}{VISTAS[k].label}
              {k==='alertas' && <span style={{ marginLeft:'auto', background:'#f87171', color:'#fff', fontSize:'9px', fontWeight:700, padding:'1px 6px', borderRadius:'10px' }}>3</span>}
            </button>
          ))}

          <div style={{ height:'1px', background:C3, margin:'20px 4px 16px' }} />

          <div style={{ fontSize:'9px', color:'#24244a', letterSpacing:'2px', marginBottom:'8px', paddingLeft:'14px', fontWeight:600 }}>PANELES DE ROL</div>
          {rolItems.map(k => (
            <button key={k} onClick={() => setVista(k)} style={btnSidebar(k)}>
              <span style={{ width:'5px', height:'5px', borderRadius:'50%', background: vista===k ? GOLD : '#24244a', flexShrink:0 }} />
              {VISTAS[k].label}
            </button>
          ))}
        </nav>

        <div style={{ padding:'18px 20px', borderTop:`1px solid ${C3}`, display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'28px', height:'28px', background:'#161628', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:GOLD, fontWeight:700, fontSize:'11px', border:`1px solid #2a2a4a` }}>G</div>
          <div>
            <div style={{ fontSize:'12px', fontWeight:600, color:'#8888aa' }}>Gabriel</div>
            <div style={{ fontSize:'10px', color:'#28284a' }}>Administrador</div>
          </div>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main style={{ flex:1, padding:'44px 52px', overflowY:'auto' }}>
        {renderVista()}
      </main>

    </div>
  )
}
