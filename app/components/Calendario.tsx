'use client'
import { useMemo, useState } from 'react'

type Theme = 'dark' | 'light'

const D = {
  bg: '#05050f',
  surface: '#0b0b18',
  s2: '#111124',
  border: '#16163a',
  b2: '#1e1e3a',
  text: '#f0f0ff',
  text2: '#9090b8',
  text3: '#4a4a6a',
  muted: '#2a2a4a',
}
const L = {
  bg: '#eef0f8',
  surface: '#ffffff',
  s2: '#f4f6ff',
  border: '#dde0f0',
  b2: '#c8cbdf',
  text: '#0d0d20',
  text2: '#2a2a4a',
  text3: '#606088',
  muted: '#9090aa',
}
const th = (t: Theme) => (t === 'dark' ? D : L)

const GOLD = '#c9a96e'
const BLUE = '#4f8fff'
const GREEN = '#3dd68c'
const RED = '#f87171'
const AMBER = '#f59e0b'
const PURPLE = '#a78bfa'
const PINK = '#ec4899'

function exportCSV(name: string, headers: string[], rows: (string | number)[][]) {
  const sep = ';'
  const bom = '\uFEFF'
  const content = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(sep))
    .join('\r\n')
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name + '.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function Eb({ text, t }: { text: string; t: Theme }) {
  return (
    <div
      style={{
        fontSize: '9px',
        color: th(t).text3,
        letterSpacing: '3px',
        fontWeight: 700,
        marginBottom: '4px',
      }}
    >
      {text}
    </div>
  )
}

function Card({
  children,
  style = {},
  t,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  t: Theme
}) {
  const c = th(t)
  return (
    <div
      className={`char-card char-surface ${t}`}
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: '14px',
        padding: '22px',
        boxShadow: '0 2px 16px #00000015',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function Btn({
  children,
  onClick,
  v = 'ghost',
  t,
}: {
  children: React.ReactNode
  onClick?: () => void
  v?: 'primary' | 'ghost' | 'outline'
  t: Theme
}) {
  const c = th(t)
  const vs: Record<string, React.CSSProperties> = {
    primary: {
      background: `linear-gradient(135deg,${GOLD},#8b6010)`,
      color: '#050510',
      border: 'none',
      fontWeight: 700,
      boxShadow: `0 4px 16px ${GOLD}40`,
    },
    ghost: {
      background: c.s2,
      color: c.text2,
      border: `1px solid ${c.border}`,
      fontWeight: 500,
    },
    outline: {
      background: 'transparent',
      color: GOLD,
      border: `1px solid ${GOLD}55`,
      fontWeight: 600,
    },
  }

  return (
    <button
      className="char-btn"
      onClick={onClick}
      style={{
        ...vs[v],
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        letterSpacing: '0.3px',
        transition: 'all 0.15s',
        fontFamily: 'Rajdhani,sans-serif',
      }}
    >
      {children}
    </button>
  )
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        padding: '2px 9px',
        borderRadius: '20px',
        background: color + '18',
        border: `1px solid ${color}45`,
        fontSize: '9px',
        color,
        fontWeight: 700,
        letterSpacing: '1px',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

const I = {
  cal: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  plus: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  dl: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  left: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  right: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  buffer: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l8 4-8 4-8-4 8-4zm8 8l-8 4-8-4m16 4l-8 4-8-4" />
    </svg>
  ),
  google: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
}

type Evento = {
  id: number
  titulo: string
  cliente: string
  red: string
  tipo: string
  responsable: string
  estado: 'Borrador' | 'Aprobado' | 'Publicado'
  fecha: string
  hora: string
}

const EVENTOS_INICIALES: Evento[] = [
  {
    id: 1,
    titulo: 'Reel teaser campaña',
    cliente: 'Cliente Alfa',
    red: 'Instagram',
    tipo: 'Reel',
    responsable: 'CM',
    estado: 'Aprobado',
    fecha: '2026-04-14',
    hora: '10:00',
  },
  {
    id: 2,
    titulo: 'Post carrusel branding',
    cliente: 'Cliente Alfa',
    red: 'Instagram',
    tipo: 'Carrusel',
    responsable: 'CM',
    estado: 'Borrador',
    fecha: '2026-04-16',
    hora: '15:30',
  },
  {
    id: 3,
    titulo: 'Video largo de campaña',
    cliente: 'Cliente Beta',
    red: 'YouTube',
    tipo: 'Video',
    responsable: 'CM',
    estado: 'Publicado',
    fecha: '2026-04-18',
    hora: '19:00',
  },
  {
    id: 4,
    titulo: 'Anuncio campaña captación',
    cliente: 'Cliente Beta',
    red: 'Meta Ads',
    tipo: 'Ads',
    responsable: 'SEM',
    estado: 'Aprobado',
    fecha: '2026-04-20',
    hora: '11:00',
  },
  {
    id: 5,
    titulo: 'Artículo liderazgo B2B',
    cliente: 'Cliente Gamma',
    red: 'LinkedIn',
    tipo: 'Artículo',
    responsable: 'SEO',
    estado: 'Borrador',
    fecha: '2026-04-22',
    hora: '09:00',
  },
  {
    id: 6,
    titulo: 'Historia backstage',
    cliente: 'Cliente Alfa',
    red: 'Instagram',
    tipo: 'Story',
    responsable: 'CM',
    estado: 'Publicado',
    fecha: '2026-04-22',
    hora: '17:00',
  },
  {
    id: 7,
    titulo: 'Post institucional',
    cliente: 'Cliente Gamma',
    red: 'LinkedIn',
    tipo: 'Post',
    responsable: 'CM',
    estado: 'Aprobado',
    fecha: '2026-04-24',
    hora: '12:00',
  },
]

const clienteColor = (cliente: string) => {
  if (cliente.includes('Alfa')) return GOLD
  if (cliente.includes('Beta')) return BLUE
  if (cliente.includes('Gamma')) return PURPLE
  return GREEN
}

const estadoColor = (estado: Evento['estado']) => {
  if (estado === 'Publicado') return GREEN
  if (estado === 'Aprobado') return BLUE
  return AMBER
}

const redes = ['Instagram', 'YouTube', 'LinkedIn', 'Meta Ads', 'TikTok']
const responsables = ['CEO', 'CM', 'SEM', 'SEO']
const estados: Evento['estado'][] = ['Borrador', 'Aprobado', 'Publicado']
const tipos = ['Post', 'Story', 'Reel', 'Carrusel', 'Video', 'Artículo', 'Ads']

function inicioMes(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function finMes(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function formatoMes(date: Date) {
  return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

function formatoDiaLargo(date: Date) {
  return date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function mismoDia(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function semanaActual(base: Date) {
  const day = base.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const start = new Date(base)
  start.setDate(base.getDate() + diff)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
  return days
}

export default function Calendario({ t }: { t: Theme }) {
  const c = th(t)
  const hoy = new Date()
  const [vista, setVista] = useState<'mensual' | 'semanal'>('mensual')
  const [fechaBase, setFechaBase] = useState(new Date(2026, 3, 15))
  const [eventos, setEventos] = useState<Evento[]>(EVENTOS_INICIALES)
  const [mostrarForm, setMostrarForm] = useState(false)

  const [nuevo, setNuevo] = useState<Omit<Evento, 'id'>>({
    titulo: '',
    cliente: 'Cliente Alfa',
    red: 'Instagram',
    tipo: 'Post',
    responsable: 'CM',
    estado: 'Borrador',
    fecha: '2026-04-25',
    hora: '10:00',
  })

  const exportar = () => {
    exportCSV(
      'CHAR_Calendario_Contenidos',
      ['Título', 'Cliente', 'Red Social', 'Tipo', 'Responsable', 'Estado', 'Fecha', 'Hora'],
      eventos.map((e) => [e.titulo, e.cliente, e.red, e.tipo, e.responsable, e.estado, e.fecha, e.hora])
    )
  }

  const resumen = useMemo(() => {
    const borrador = eventos.filter((e) => e.estado === 'Borrador').length
    const aprobado = eventos.filter((e) => e.estado === 'Aprobado').length
    const publicado = eventos.filter((e) => e.estado === 'Publicado').length
    return { total: eventos.length, borrador, aprobado, publicado }
  }, [eventos])

  const crearEvento = () => {
    if (!nuevo.titulo.trim()) return
    setEventos((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...nuevo,
      },
    ])
    setNuevo({
      titulo: '',
      cliente: 'Cliente Alfa',
      red: 'Instagram',
      tipo: 'Post',
      responsable: 'CM',
      estado: 'Borrador',
      fecha: nuevo.fecha,
      hora: '10:00',
    })
    setMostrarForm(false)
  }

  const mesInicio = inicioMes(fechaBase)
  const mesFin = finMes(fechaBase)
  const primerDiaSemana = (mesInicio.getDay() + 6) % 7
  const diasEnMes = mesFin.getDate()

  const celdasMes = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - primerDiaSemana + 1
    if (dayNum < 1 || dayNum > diasEnMes) return null
    return new Date(fechaBase.getFullYear(), fechaBase.getMonth(), dayNum)
  })

  const diasSemana = semanaActual(fechaBase)

  const eventosPorFecha = (date: Date) => {
    const iso = date.toISOString().split('T')[0]
    return eventos
      .filter((e) => e.fecha === iso)
      .sort((a, b) => a.hora.localeCompare(b.hora))
  }

  return (
    <div className="char-fade" style={{ display: 'grid', gap: '28px' }}>
      <div
        className="topbar"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px' }}
      >
        <div>
          <Eb text="PLANIFICACIÓN EDITORIAL" t={t} />
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: c.text }}>
            Calendario de Contenidos
          </h1>
          <div style={{ fontSize: '12px', color: c.text3, marginTop: '6px' }}>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Btn v="outline" t={t}>{I.buffer} Buffer</Btn>
          <Btn v="outline" t={t}>{I.google} Google Calendar</Btn>
          <Btn v="outline" t={t} onClick={exportar}>{I.dl} Exportar CSV</Btn>
          <Btn v="primary" t={t} onClick={() => setMostrarForm(!mostrarForm)}>{I.plus} Nuevo Evento</Btn>
        </div>
      </div>

      <div className="g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
        <Card t={t} style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', color: c.text3, marginBottom: '6px', letterSpacing: '1px' }}>TOTAL PIEZAS</div>
          <div style={{ fontSize: '30px', fontWeight: 800, color: c.text }}>{resumen.total}</div>
        </Card>
        <Card t={t} style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', color: c.text3, marginBottom: '6px', letterSpacing: '1px' }}>BORRADOR</div>
          <div style={{ fontSize: '30px', fontWeight: 800, color: AMBER }}>{resumen.borrador}</div>
        </Card>
        <Card t={t} style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', color: c.text3, marginBottom: '6px', letterSpacing: '1px' }}>APROBADO</div>
          <div style={{ fontSize: '30px', fontWeight: 800, color: BLUE }}>{resumen.aprobado}</div>
        </Card>
        <Card t={t} style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', color: c.text3, marginBottom: '6px', letterSpacing: '1px' }}>PUBLICADO</div>
          <div style={{ fontSize: '30px', fontWeight: 800, color: GREEN }}>{resumen.publicado}</div>
        </Card>
      </div>

      {mostrarForm && (
        <Card t={t}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <Eb text="CREAR NUEVO EVENTO" t={t} />
              <h3 style={{ fontSize: '18px', color: c.text, margin: 0 }}>Nueva pieza de contenido</h3>
            </div>

            <div className="g2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <input
                value={nuevo.titulo}
                onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })}
                placeholder="Título de la pieza"
                style={inputStyle(t)}
              />
              <select value={nuevo.cliente} onChange={(e) => setNuevo({ ...nuevo, cliente: e.target.value })} style={inputStyle(t)}>
                <option>Cliente Alfa</option>
                <option>Cliente Beta</option>
                <option>Cliente Gamma</option>
              </select>

              <select value={nuevo.red} onChange={(e) => setNuevo({ ...nuevo, red: e.target.value })} style={inputStyle(t)}>
                {redes.map((r) => <option key={r}>{r}</option>)}
              </select>
              <select value={nuevo.tipo} onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value })} style={inputStyle(t)}>
                {tipos.map((r) => <option key={r}>{r}</option>)}
              </select>

              <select value={nuevo.responsable} onChange={(e) => setNuevo({ ...nuevo, responsable: e.target.value })} style={inputStyle(t)}>
                {responsables.map((r) => <option key={r}>{r}</option>)}
              </select>
              <select value={nuevo.estado} onChange={(e) => setNuevo({ ...nuevo, estado: e.target.value as Evento['estado'] })} style={inputStyle(t)}>
                {estados.map((r) => <option key={r}>{r}</option>)}
              </select>

              <input
                type="date"
                value={nuevo.fecha}
                onChange={(e) => setNuevo({ ...nuevo, fecha: e.target.value })}
                style={inputStyle(t)}
              />
              <input
                type="time"
                value={nuevo.hora}
                onChange={(e) => setNuevo({ ...nuevo, hora: e.target.value })}
                style={inputStyle(t)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Btn v="primary" t={t} onClick={crearEvento}>Guardar Evento</Btn>
              <Btn v="ghost" t={t} onClick={() => setMostrarForm(false)}>Cancelar</Btn>
            </div>
          </div>
        </Card>
      )}

      <Card t={t} style={{ padding: '18px' }}>
        <div
          className="topbar"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Btn
              t={t}
              onClick={() => {
  if (vista === 'semanal') {
    const d = new Date(fechaBase)
    d.setDate(d.getDate() - 7)
    setFechaBase(d)
  } else {
    setFechaBase(new Date(fechaBase.getFullYear(), fechaBase.getMonth() - 1, 1))
  }
}}
            >
              {I.left}
            </Btn>
            <div style={{ fontSize: '18px', fontWeight: 800, color: c.text, textTransform: 'capitalize' }}>
              {vista === 'mensual'
                ? formatoMes(fechaBase)
                : `${formatoDiaLargo(diasSemana[0])} → ${formatoDiaLargo(diasSemana[6])}`}
            </div>
            <Btn
              t={t}
              onClick={() => {
  if (vista === 'semanal') {
    const d = new Date(fechaBase)
    d.setDate(d.getDate() + 7)
    setFechaBase(d)
  } else {
    setFechaBase(new Date(fechaBase.getFullYear(), fechaBase.getMonth() + 1, 1))
  }
}}
            >
              {I.right}
            </Btn>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="char-btn"
              onClick={() => setVista('mensual')}
              style={toggleStyle(t, vista === 'mensual')}
            >
              Vista Mensual
            </button>
            <button
              className="char-btn"
              onClick={() => setVista('semanal')}
              style={toggleStyle(t, vista === 'semanal')}
            >
              Vista Semanal
            </button>
          </div>
        </div>
      </Card>

      {vista === 'mensual' ? (
        <Card t={t} style={{ padding: '14px' }}>
          <div
  className="cal-dias-semana"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '10px',
              marginBottom: '10px',
            }}
          >
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
              <div
                key={d}
                style={{
                  padding: '10px',
                  textAlign: 'center',
                  fontSize: '11px',
                  color: c.text3,
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                {d}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '10px',
            }}
          >
            {celdasMes.map((fecha, i) => {
              if (!fecha) {
                return (
                  <div
                    key={i}
                    style={{
                      minHeight: '140px',
                      borderRadius: '12px',
                      background: 'transparent',
                      border: `1px dashed ${c.border}`,
                      opacity: 0.25,
                    }}
                  />
                )
              }

              const items = eventosPorFecha(fecha)
              const esHoy = mismoDia(fecha, hoy)

              return (
                <div
                  key={i}
                  style={{
                    minHeight: '140px',
                    borderRadius: '12px',
                    background: c.s2,
                    border: `1px solid ${esHoy ? GOLD : c.border}`,
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: esHoy ? `0 0 0 1px ${GOLD}30 inset` : 'none',
                  }}
                >
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap:'8px' }}>
  <div
    style={{
      fontSize: '12px',
      fontWeight: 800,
      color: esHoy ? GOLD : c.text,
      display:'flex',
      flexDirection:'column',
      lineHeight:'1.1'
    }}
  >
    <span
      className="cal-dia-mobile"
      style={{
        display:'none',
        fontSize:'10px',
        color:c.text3,
        fontWeight:700,
        letterSpacing:'0.5px'
      }}
    >
      {fecha.toLocaleDateString('es-AR', { weekday: 'short' })}
    </span>
    <span>{fecha.getDate()}</span>
  </div>
                    {items.length > 0 && <Tag label={`${items.length} PIEZA${items.length > 1 ? 'S' : ''}`} color={GOLD} />}
                  </div>

                  <div style={{ display: 'grid', gap: '6px' }}>
                    {items.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        className="char-row"
                        style={{
                          padding: '8px',
                          borderRadius: '10px',
                          background: clienteColor(ev.cliente) + '12',
                          border: `1px solid ${clienteColor(ev.cliente)}35`,
                          display: 'grid',
                          gap: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                          <div style={{ fontSize: '11px', color: c.text, fontWeight: 700, lineHeight: 1.3 }}>
                            {ev.titulo}
                          </div>
                          <div style={{ fontSize: '10px', color: clienteColor(ev.cliente), fontWeight: 700 }}>
                            {ev.hora}
                          </div>
                        </div>
                        <div style={{ fontSize: '10px', color: c.text3 }}>
                          {ev.cliente} · {ev.red}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <Tag label={ev.tipo.toUpperCase()} color={clienteColor(ev.cliente)} />
                          <Tag label={ev.estado.toUpperCase()} color={estadoColor(ev.estado)} />
                        </div>
                      </div>
                    ))}

                    {items.length > 3 && (
                      <div style={{ fontSize: '10px', color: c.text3, padding: '2px 4px' }}>
                        +{items.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          <Card t={t} style={{ padding: '14px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '10px',
              }}
            >
              {diasSemana.map((dia, i) => {
                const items = eventosPorFecha(dia)
                const esHoy = mismoDia(dia, hoy)

                return (
                  <div
                    key={i}
                    style={{
                      borderRadius: '12px',
                      background: c.s2,
                      border: `1px solid ${esHoy ? GOLD : c.border}`,
                      minHeight: '420px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', color: c.text3, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {dia.toLocaleDateString('es-AR', { weekday: 'short' })}
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: esHoy ? GOLD : c.text }}>
                        {dia.getDate()}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: '8px' }}>
                      {items.length === 0 && (
                        <div
                          style={{
                            border: `1px dashed ${c.border}`,
                            borderRadius: '10px',
                            padding: '12px',
                            fontSize: '11px',
                            color: c.text3,
                          }}
                        >
                          Sin contenido programado
                        </div>
                      )}

                      {items.map((ev) => (
                        <div
                          key={ev.id}
                          className="char-row"
                          style={{
                            borderRadius: '10px',
                            padding: '10px',
                            background: clienteColor(ev.cliente) + '12',
                            border: `1px solid ${clienteColor(ev.cliente)}35`,
                            display: 'grid',
                            gap: '6px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ fontSize: '12px', color: c.text, fontWeight: 700 }}>{ev.titulo}</div>
                            <div style={{ fontSize: '10px', color: clienteColor(ev.cliente), fontWeight: 700 }}>{ev.hora}</div>
                          </div>

                          <div style={{ fontSize: '10px', color: c.text3 }}>
                            {ev.cliente} · {ev.red}
                          </div>

                          <div style={{ fontSize: '10px', color: c.text2 }}>
                            Responsable: <span style={{ color: c.text }}>{ev.responsable}</span>
                          </div>

                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <Tag label={ev.tipo.toUpperCase()} color={clienteColor(ev.cliente)} />
                            <Tag label={ev.estado.toUpperCase()} color={estadoColor(ev.estado)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

<Card t={t}>
            <Eb text="RESUMEN OPERATIVO" t={t} />
            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '14px', color: c.text, fontWeight: 700, marginBottom: '8px' }}>
                  Próximas publicaciones
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {eventos
                    .slice()
                    .sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`))
                    .slice(0, 5)
                    .map((ev) => (
                      <div
                        key={ev.id}
                        className="char-row"
                        style={{
                          padding: '10px',
                          borderRadius: '10px',
                          border: `1px solid ${c.border}`,
                          background: c.s2,
                        }}
                      >
                        <div style={{ fontSize: '12px', color: c.text, fontWeight: 700 }}>{ev.titulo}</div>
                        <div style={{ fontSize: '10px', color: c.text3, marginTop: '3px' }}>
                          {ev.cliente} · {new Date(ev.fecha+'T12:00:00').toLocaleDateString('es-AR',{day:'numeric',month:'short'})} · {ev.hora}hs
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '14px', color: c.text, fontWeight: 700, marginBottom: '8px' }}>
                  Estado de contenidos
                </div>
               <div style={{ display: 'grid', gap: '8px' }}>
  <div style={{ padding:'10px 12px', borderRadius:'10px', border:`1px solid ${c.border}`, background:c.s2, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
    <span style={{ color:c.text2, fontSize:'13px' }}>Borrador</span>
    <span style={{ color:AMBER, fontWeight:800, fontSize:'18px' }}>{resumen.borrador}</span>
  </div>
  <div style={{ padding:'10px 12px', borderRadius:'10px', border:`1px solid ${c.border}`, background:c.s2, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
    <span style={{ color:c.text2, fontSize:'13px' }}>Aprobado</span>
    <span style={{ color:BLUE, fontWeight:800, fontSize:'18px' }}>{resumen.aprobado}</span>
  </div>
  <div style={{ padding:'10px 12px', borderRadius:'10px', border:`1px solid ${c.border}`, background:c.s2, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
    <span style={{ color:c.text2, fontSize:'13px' }}>Publicado</span>
    <span style={{ color:GREEN, fontWeight:800, fontSize:'18px' }}>{resumen.publicado}</span>
  </div>
</div>
              </div>

              <div>
                <div style={{ fontSize: '14px', color: c.text, fontWeight: 700, marginBottom: '8px' }}>
                  Integraciones
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                 <Tag label="BUFFER LISTO" color={GREEN} />
                 <Tag label="GOOGLE CALENDAR LISTO" color={BLUE} />
                 <Tag label="API PENDIENTE" color={AMBER} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function inputStyle(t: Theme): React.CSSProperties {
  const c = th(t)
  return {
    background: c.s2,
    color: c.text,
    border: `1px solid ${c.border}`,
    borderRadius: '10px',
    padding: '12px 14px',
    fontFamily: 'Rajdhani,sans-serif',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
  }
}

function toggleStyle(t: Theme, active: boolean): React.CSSProperties {
  const c = th(t)
  return {
    background: active ? `linear-gradient(135deg,${GOLD},#8b6010)` : c.s2,
    color: active ? '#050510' : c.text2,
    border: active ? 'none' : `1px solid ${c.border}`,
    borderRadius: '8px',
    padding: '9px 14px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 700,
    fontFamily: 'Rajdhani,sans-serif',
    letterSpacing: '0.3px',
  }
}

function statLine(c: any, label: string, value: number, color: string): React.CSSProperties {
  return {
    padding: '10px 12px',
    borderRadius: '10px',
    border: `1px solid ${c.border}`,
    background: c.s2,
    color: c.text,
  }
}
