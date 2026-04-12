'use client'
import { useState } from 'react'

// ── DATOS ──────────────────────────────────────────────────────────────────
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

// ── ICONOS SVG ─────────────────────────────────────────────────────────────
const I = {
  grid:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  users:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  cal:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  folder: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  bell:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  cpu:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  plus:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trend:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  task:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  warn:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  film:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>,
  bolt:   <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  check:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  dollar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  target: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  bar:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  pen:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  link:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
}

// ── COMPONENTES REUTILIZABLES ─────────────────────────────────────────────
const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: '#0c0c1a', border: '1px solid #14142a', borderRadius: '12px', padding: '24px', ...style }}>
    {children}
  </div>
)

const Tag = ({ label, color }: { label: string; color: string }) => (
  <span style={{ padding: '2px 10px', borderRadius: '20px', background: color + '15', border: `1px solid ${color}35`, fontSize: '9px', color, fontWeight: 700, letterSpacing: '1px' }}>
    {label}
  </span>
)

const SectionTitle = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
  <div style={{ marginBottom: '20px' }}>
    <div style={{ fontSize: '9px', color: '#2e2e4a', letterSpacing: '3px', fontWeight: 700, marginBottom: '4px' }}>{eyebrow}</div>
    <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#fff' }}>{title}</h2>
  </div>
)

const StatRow = ({ label, value, color = '#c9a96e' }: { label: string; value: string; color?: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #14142a' }}>
    <span style={{ fontSize: '12px', color: '#44445e' }}>{label}</span>
    <span style={{ fontSize: '13px', fontWeight: 700, color }}>{value}</span>
  </div>
)

const TaskItem = ({ text, done = false, priority = 'normal' }: { text: string; done?: boolean; priority?: 'alta' | 'media' | 'normal' }) => {
  const pColor = priority === 'alta' ? '#f87171' : priority === 'media' ? '#facc15' : '#44445e'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: '1px solid #0e0e20' }}>
      <div style={{ width: '18px', height: '18px', borderRadius: '5px', border: `1px solid ${done ? '#4ade80' : '#1e1e38'}`, background: done ? '#4ade8015' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {done && I.check}
      </div>
      <span style={{ fontSize: '12px', color: done ? '#2e2e4a' : '#8888aa', textDecoration: done ? 'line-through' : 'none', flex: 1 }}>{text}</span>
      {priority !== 'normal' && <Tag label={priority.toUpperCase()} color={pColor} />}
    </div>
  )
}

// ── PANELES POR ROL ────────────────────────────────────────────────────────

function PanelCEO() {
  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <SectionTitle eyebrow="DIRECCIÓN EJECUTIVA" title="Panel CEO" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* KPIs globales */}
        <Card>
          <div style={{ fontSize: '11px', color: '#44445e', letterSpacing: '1px', fontWeight: 600, marginBottom: '16px' }}>KPIs GLOBALES</div>
          <StatRow label="Clientes activos" value="3 / 10" />
          <StatRow label="Ingresos estimados" value="—" color="#4ade80" />
          <StatRow label="Tareas completadas" value="12 / 19" />
          <StatRow label="Clips generados" value="0" color="#a78bfa" />
          <StatRow label="Alertas críticas" value="1" color="#f87171" />
        </Card>

        {/* Estado del equipo */}
        <Card>
          <div style={{ fontSize: '11px', color: '#44445e', letterSpacing: '1px', fontWeight: 600, marginBottom: '16px' }}>EQUIPO</div>
          {[
            { nombre: 'Gabriel', rol: 'Dev / Ops', estado: 'ACTIVO', color: '#4ade80' },
            { nombre: 'Adri', rol: 'Gestor de Proyectos', estado: 'ACTIVO', color: '#4ade80' },
          ].map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #14142a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', background: '#161628', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9a96e', fontWeight: 700, fontSize: '11px' }}>
                  {m.nombre[0]}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#ccc' }}>{m.nombre}</div>
                  <div style={{ fontSize: '10px', color: '#2e2e4a' }}>{m.rol}</div>
                </div>
              </div>
              <Tag label={m.estado} color={m.color} />
            </div>
          ))}
        </Card>
      </div>

      {/* Tareas CEO */}
      <Card>
        <div style={{ fontSize: '11px', color: '#44445e', letterSpacing: '1px', fontWeight: 600, marginBottom: '4px' }}>TAREAS EJECUTIVAS</div>
        <TaskItem text="Revisar propuesta para Cliente Beta" priority="alta" />
        <TaskItem text="Definir estrategia Q2 con Adri" priority="media" />
        <TaskItem text="Configurar módulo de facturación" />
        <TaskItem text="Revisar métricas semanales" done />
        <TaskItem text="Actualizar filosofía CHAR en Cerebro IA" />
      </Card>
    </div>
  )
}

function PanelSEM() {
  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <SectionTitle eyebrow="SEARCH ENGINE MARKETING" title="Panel SEM" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Card>
          <div style={{ fontSize: '11px', color: '#44445e', letterSpacing: '1px', fontWeight: 600, marginBottom: '16px' }}>CAMPAÑAS ACTIVAS</div>
          {[
            { nombre: 'Google Ads — Alfa', estado: 'ACTIVA', color: '#4ade80', presupuesto: '$0 / mes' },
            { nombre: 'Meta Ads — Beta', estado: 'PAUSADA', color: '#facc15', presupuesto: '$0 / mes' },
            { nombre: 'Google Ads — Gamma', estado: 'SIN INICIAR', color: '#44445e', presupuesto: '—' },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #14142a' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#ccc', fontWeight: 500 }}>{c.nombre}</div>
                <div style={{ fontSize: '10px', color: '#2e2e4a', marginTop: '2px' }}>Presupuesto: {c.presupuesto}</div>
              </div>
              <Tag label={c.estado} color={c.color} />
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontSize: '11px', color: '#44445e', letterSpacing: '1px', fontWeight: 600, marginBottom: '16px' }}>MÉTRICAS SEM</div>
          <StatRow label="Impresiones totales" value="—" />
          <StatRow label="Clics totales" value="—" />
          <StatRow label="CTR promedio" value="—" color="#60a5fa" />
          <StatRow label="Costo por clic" value="—" color="#facc15" />
          <StatRow label="Conversiones" value="—" color="#4ade80" />
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: '11px', color: '#44445e', letterSpacing: '1px', fontWeight: 600, marginBottom: '4px' }}>TAREAS SEM</div>
        <TaskItem text="Configurar primera campaña Google Ads" priority="alta" />
        <TaskItem text="Definir keywords para Cliente Alfa" priority="alta" />
        <TaskItem text="Conectar Google Analytics a la app" priority="media" />
        <TaskItem text="Investigar competencia en SEM — Gamma" />
        <TaskItem text="Revisar landing pages de clientes" />
      </Card>
    </div>
  )
}

function PanelCM() {
  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <SectionTitle eyebrow="COMMUNITY MANAGEMENT" title="Panel CM" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Card>
          <div style={{ fontSize: '11px', color: '#44445e', letterSpacing: '1px', fontWeight: 600, marginBottom: '16px' }}>CONTENIDO ESTA SEMANA</div>
          {[
            { cliente: 'Cliente Alfa', red: 'Instagram', posts: '3', estado: 'PLANIFICADO', color: '#facc15' },
            { cliente: 'Cliente Beta', red: 'YouTube', posts: '1', estado: 'PENDIENTE', color: '#f87171' },
            { cliente: 'Cliente Gamma', red: 'LinkedIn', posts: '2', estado: 'PUBLICADO', color: '#4ade80' },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #14142a' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#ccc', fontWeight: 500 }}>{c.cliente}</div>
                <div style={{ fontSize: '10px', color: '#2e2e4a', marginTop: '2px' }}>{c.red} · {c.posts} publicaciones</div>
              </div>
              <Tag label={c.estado} color={c.color} />
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontSize: '11px', color: '#44445e', letterSpacing: '1px', fontWeight: 600, marginBottom: '16px' }}>MÉTRICAS CM</div>
          <StatRow label="Posts publicados" value="2" />
          <StatRow label="Alcance promedio" value="—" />
          <StatRow label="Engagement rate" value="—" color="#60a5fa" />
          <StatRow label="Seguidores ganados" value="—" color="#4ade80" />
          <StatRow label="Stories programadas" value="0" color="#facc15" />
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: '11px', color: '#44445e', letterSpacing: '1px', fontWeight: 600, marginBottom: '4px' }}>TAREAS CM</div>
        <TaskItem text="Crear calendario de contenido Mayo — Alfa" priority="alta" />
        <TaskItem text="Grabar CHAR Session para Cliente Beta" priority="alta" />
        <TaskItem text="Responder comentarios — Gamma LinkedIn" priority="media" />
        <TaskItem text="Diseñar 3 stories template para Alfa" />
        <TaskItem text="Revisar estética de feed — Cliente Gamma" done />
      </Card>
    </div>
  )
}

function PanelSEO() {
  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <SectionTitle eyebrow="SEARCH ENGINE OPTIMIZATION" title="Panel SEO" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Card>
          <div style={{ fontSize: '11px', color: '#44445e', letterSpacing: '1px', fontWeight: 600, marginBottom: '16px' }}>POSICIONAMIENTO</div>
          {[
            { cliente: 'Cliente Alfa', keyword: 'Sin asignar', posicion: '—', color: '#44445e' },
            { cliente: 'Cliente Beta', keyword: 'Sin asignar', posicion: '—', color: '#44445e' },
            { cliente: 'Cliente Gamma', keyword: 'Sin asignar', posicion: '—', color: '#44445e' },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #14142a' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#ccc', fontWeight: 500 }}>{c.cliente}</div>
                <div style={{ fontSize: '10px', color: '#2e2e4a', marginTop: '2px' }}>Keyword principal: {c.keyword}</div>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: c.color }}>{c.posicion}</span>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontSize: '11px', color: '#44445e', letterSpacing: '1px', fontWeight: 600, marginBottom: '16px' }}>MÉTRICAS SEO</div>
          <StatRow label="Domain Authority" value="—" />
          <StatRow label="Backlinks totales" value="—" />
          <StatRow label="Keywords top 10" value="—" color="#60a5fa" />
          <StatRow label="Tráfico orgánico" value="—" color="#4ade80" />
          <StatRow label="Páginas indexadas" value="—" color="#c9a96e" />
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: '11px', color: '#44445e', letterSpacing: '1px', fontWeight: 600, marginBottom: '4px' }}>TAREAS SEO</div>
        <TaskItem text="Auditoría SEO inicial — Cliente Alfa" priority="alta" />
        <TaskItem text="Investigación de keywords — Gamma" priority="alta" />
        <TaskItem text="Optimizar meta descriptions — Beta" priority="media" />
        <TaskItem text="Instalar Google Search Console en clientes" />
        <TaskItem text="Generar reporte mensual de posicionamiento" />
      </Card>
    </div>
  )
}

// ── DASHBOARD PRINCIPAL ────────────────────────────────────────────────────
export default function Dashboard() {
  const [rolActivo, setRolActivo] = useState('CEO')
  const [vistaActiva, setVistaActiva] = useState('dashboard')

  const nav = [
    { key: 'dashboard', icon: I.grid, label: 'Dashboard' },
    { key: 'clientes', icon: I.users, label: 'Clientes' },
    { key: 'calendario', icon: I.cal, label: 'Calendario' },
    { key: 'archivos', icon: I.folder, label: 'Archivos' },
    { key: 'alertas', icon: I.bell, label: 'Alertas' },
    { key: 'ia', icon: I.cpu, label: 'Cerebro IA' },
  ]

  const metrics = [
    { label: 'Clientes Activos', val: '3', icon: I.trend, color: '#c9a96e', note: '+1 este mes' },
    { label: 'Tareas Pendientes', val: '7', icon: I.task, color: '#60a5fa', note: '2 vencen hoy' },
    { label: 'Alertas Críticas', val: '1', icon: I.warn, color: '#f87171', note: 'Requiere acción' },
    { label: 'Clips Generados', val: '—', icon: I.film, color: '#a78bfa', note: 'Próximo módulo' },
  ]

  const btnStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px 14px', borderRadius: '8px', cursor: 'pointer',
    color: active ? '#c9a96e' : '#44445e',
    background: active ? '#161628' : 'transparent',
    fontWeight: active ? 600 : 400,
    fontSize: '13px', border: 'none', width: '100%',
    textAlign: 'left', marginBottom: '2px',
  })

  const panelActivo = () => {
    if (rolActivo === 'CEO') return <PanelCEO />
    if (rolActivo === 'SEM') return <PanelSEM />
    if (rolActivo === 'CM') return <PanelCM />
    if (rolActivo === 'SEO') return <PanelSEO />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', color: '#e2e2ee', display: 'flex', fontFamily: "'Segoe UI','SF Pro Display',system-ui,sans-serif", fontSize: '14px' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: '232px', background: '#0c0c1a', borderRight: '1px solid #14142a', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '28px 20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg,#c9a96e,#7a5010)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {I.bolt}
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
          {nav.map(item => (
            <button key={item.key} onClick={() => setVistaActiva(item.key)} style={btnStyle(vistaActiva === item.key)}>
              {item.icon}{item.label}
            </button>
          ))}

          <div style={{ height: '1px', background: '#14142a', margin: '20px 4px 16px' }} />

          <div style={{ fontSize: '9px', color: '#28284a', letterSpacing: '2px', marginBottom: '8px', paddingLeft: '14px', fontWeight: 600 }}>ROL ACTIVO</div>
          {roles.map(rol => (
            <button key={rol} onClick={() => { setRolActivo(rol); setVistaActiva('dashboard') }} style={btnStyle(rolActivo === rol && vistaActiva === 'dashboard')}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: rolActivo === rol && vistaActiva === 'dashboard' ? '#c9a96e' : '#24244a', flexShrink: 0 }} />
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

      {/* ── MAIN ── */}
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
            {I.plus} Nuevo Cliente
          </button>
        </div>

        {/* Métricas globales — siempre visibles */}
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

        {/* Clientes — siempre visibles */}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', background: '#161628', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9a96e', fontWeight: 800, fontSize: '13px', border: '1px solid #1e1e38' }}>
                        {c.nombre.charAt(8)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#fff' }}>{c.nombre}</div>
                        <div style={{ fontSize: '11px', color: '#44445e', marginTop: '2px' }}>{c.red}</div>
                      </div>
                    </div>
                    <Tag label={est.label} color={est.color} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
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
                      <button key={btn} style={{ flex: 1, background: '#14142a', border: '1px solid #1c1c34', borderRadius: '6px', color: '#44445e', padding: '6px 0', fontSize: '10px', cursor: 'pointer', fontWeight: 500 }}>{btn}</button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Panel dinámico por rol */}
        {panelActivo()}

      </main>
    </div>
  )
}
