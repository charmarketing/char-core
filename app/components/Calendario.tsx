'use client'
import { useMemo, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Theme = 'dark' | 'light'

const D = {
  bg: '#05050f', surface: '#0b0b18', s2: '#111124', border: '#16163a',
  b2: '#1e1e3a', text: '#f0f0ff', text2: '#9090b8', text3: '#4a4a6a', muted: '#2a2a4a',
}
const L = {
  bg: '#eef0f8', surface: '#ffffff', s2: '#f4f6ff', border: '#dde0f0',
  b2: '#c8cbdf', text: '#0d0d20', text2: '#2a2a4a', text3: '#606088', muted: '#9090aa',
}
const th = (t: Theme) => (t === 'dark' ? D : L)

const GOLD = '#c9a96e'
const BLUE = '#4f8fff'
const GREEN = '#3dd68c'
const RED = '#f87171'
const AMBER = '#f59e0b'
const PURPLE = '#a78bfa'

function exportCSV(name: string, headers: string[], rows: (string | number)[][]) {
  const sep = ';'
  const bom = '\uFEFF'
  const content = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(sep)).join('\r\n')
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = name + '.csv'; a.click()
  URL.revokeObjectURL(url)
}

function Eb({ text, t }: { text: string; t: Theme }) {
  return <div style={{ fontSize: '9px', color: th(t).text3, letterSpacing: '3px', fontWeight: 700, marginBottom: '4px' }}>{text}</div>
}

function Card({ children, style = {}, t }: { children: React.ReactNode; style?: React.CSSProperties; t: Theme }) {
  const c = th(t)
  return (
    <div className={`char-card char-surface ${t}`} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '22px', boxShadow: '0 2px 16px #00000015', transition: 'border-color 0.2s, box-shadow 0.2s', ...style }}>
      {children}
    </div>
  )
}

function Tag({ label, color }: { label: string; color: string }) {
  return <span style={{ fontSize: '9px', fontWeight: 800, color, border: `1px solid ${color}40`, borderRadius: '6px', padding: '2px 7px', letterSpacing: '0.5px', background: color + '12' }}>{label}</span>
}

function Btn({ children, onClick, v = 'outline', t }: any) {
  const c = th(t)
  const styles: any = {
    primary: { background: `linear-gradient(135deg,${GOLD},#7a5010)`, color: '#fff', border: 'none' },
    outline: { background: c.s2, color: c.text2, border: `1px solid ${c.border}` },
    ghost: { background: 'transparent', color: c.text3, border: `1px solid ${c.border}` },
    danger: { background: '#f8717120', color: RED, border: `1px solid ${RED}40` },
  }
  return (
    <button onClick={onClick} style={{ ...styles[v], borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'Rajdhani,sans-serif', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s' }}>
      {children}
    </button>
  )
}

type Evento = {
  id: string
  titulo: string
  cliente: string
  red: string
  tipo: string
  responsable: string
  estado: 'Borrador' | 'Aprobado' | 'Publicado'
  fecha: string
  hora: string
}

const clienteColor = (cliente: string, clientes: any[]) => {
  const colors = [GOLD, BLUE, PURPLE, GREEN, AMBER]
  const idx = clientes.findIndex(c => c.nombre === cliente)
  return colors[idx % colors.length] || GREEN
}

const estadoColor = (estado: string) => {
  if (estado === 'Publicado') return GREEN
  if (estado === 'Aprobado') return BLUE
  return AMBER
}

const redes = ['Instagram', 'YouTube', 'LinkedIn', 'Meta Ads', 'TikTok', 'Facebook']
const responsables = ['CEO', 'CM', 'SEM', 'SEO']
const estados = ['Borrador', 'Aprobado', 'Publicado']
const tipos = ['Post', 'Story', 'Reel', 'Carrusel', 'Video', 'Artículo', 'Ads']

function inicioMes(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1) }
function finMes(date: Date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0) }
function formatoMes(date: Date) { return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) }
function formatoDiaLargo(date: Date) { return date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) }
function mismoDia(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }
function semanaActual(base: Date) {
  const day = base.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const start = new Date(base)
  start.setDate(base.getDate() + diff)
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d })
}

function inputStyle(t: Theme): React.CSSProperties {
  const c = th(t)
  return { background: c.s2, color: c.text, border: `1px solid ${c.border}`, borderRadius: '10px', padding: '12px 14px', fontFamily: 'Rajdhani,sans-serif', fontSize: '14px', outline: 'none', width: '100%' }
}

function toggleStyle(t: Theme, active: boolean): React.CSSProperties {
  const c = th(t)
  return { background: active ? `linear-gradient(135deg,${GOLD},#8b6010)` : c.s2, color: active ? '#050510' : c.text2, border: active ? 'none' : `1px solid ${c.border}`, borderRadius: '8px', padding: '9px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: 'Rajdhani,sans-serif', letterSpacing: '0.3px' }
}

export default function Calendario({ t }: { t: Theme }) {
  const c = th(t)
  const hoy = new Date()
  const [vista, setVista] = useState<'mensual' | 'semanal'>('mensual')
  const [fechaBase, setFechaBase] = useState(new Date())
  const [eventos, setEventos] = useState<Evento[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [cargando, setCargando] = useState(true)

  const [nuevo, setNuevo] = useState({
    titulo: '', cliente: '', red: 'Instagram', tipo: 'Post',
    responsable: 'CM', estado: 'Borrador', fecha: new Date().toISOString().split('T')[0], hora: '10:00',
  })

  useEffect(() => {
    async function cargar() {
      setCargando(true)
      const { data: clientesData } = await supabase.from('clientes').select('nombre').order('nombre')
      if (clientesData && clientesData.length > 0) {
        setClientes(clientesData)
        setNuevo(prev => ({ ...prev, cliente: clientesData[0].nombre }))
      }
      const { data: eventosData } = await supabase.from('eventos_calendario').select('*').order('fecha')
      if (eventosData) setEventos(eventosData)
      setCargando(false)
    }
    cargar()
  }, [])

  const exportar = () => {
    exportCSV('CHAR_Calendario', ['Título', 'Cliente', 'Red', 'Tipo', 'Responsable', 'Estado', 'Fecha', 'Hora'],
      eventos.map((e) => [e.titulo, e.cliente, e.red, e.tipo, e.responsable, e.estado, e.fecha, e.hora]))
  }

  const resumen = useMemo(() => ({
    total: eventos.length,
    borrador: eventos.filter(e => e.estado === 'Borrador').length,
    aprobado: eventos.filter(e => e.estado === 'Aprobado').length,
    publicado: eventos.filter(e => e.estado === 'Publicado').length,
  }), [eventos])

  const crearEvento = async () => {
    if (!nuevo.titulo.trim()) return
    const { data, error } = await supabase.from('eventos_calendario').insert([nuevo]).select()
    if (error) { console.log('Error:', error); return }
    if (data) setEventos(prev => [...prev, data[0]])
    setNuevo(prev => ({ ...prev, titulo: '', hora: '10:00' }))
    setMostrarForm(false)
  }

  const eliminarEvento = async (id: string) => {
    if (!confirm('¿Eliminar este evento?')) return
    await supabase.from('eventos_calendario').delete().eq('id', id)
    setEventos(prev => prev.filter(e => e.id !== id))
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
    return eventos.filter(e => e.fecha === iso).sort((a, b) => a.hora.localeCompare(b.hora))
  }
    return (
    <div className="char-fade" style={{ display: 'grid', gap: '28px' }}>
      <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px' }}>
        <div>
          <Eb text="PLANIFICACIÓN EDITORIAL" t={t} />
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: c.text }}>Calendario de Contenidos</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Btn v="outline" t={t}>📅 Buffer</Btn>
          <Btn v="outline" t={t}>📆 Google Calendar</Btn>
          <Btn v="outline" t={t} onClick={exportar}>⬇ Exportar CSV</Btn>
          <Btn v="primary" t={t} onClick={() => setMostrarForm(!mostrarForm)}>+ Nuevo Evento</Btn>
        </div>
      </div>

      <div className="g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
        {[['TOTAL PIEZAS', resumen.total, c.text], ['BORRADOR', resumen.borrador, AMBER], ['APROBADO', resumen.aprobado, BLUE], ['PUBLICADO', resumen.publicado, GREEN]].map(([label, val, color]) => (
          <Card key={label as string} t={t} style={{ padding: '18px' }}>
            <div style={{ fontSize: '11px', color: c.text3, marginBottom: '6px', letterSpacing: '1px' }}>{label}</div>
            <div style={{ fontSize: '30px', fontWeight: 800, color: color as string }}>{val}</div>
          </Card>
        ))}
      </div>

      {mostrarForm && (
        <Card t={t}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <Eb text="CREAR NUEVO EVENTO" t={t} />
              <h3 style={{ fontSize: '18px', color: c.text, margin: 0 }}>Nueva pieza de contenido</h3>
            </div>
            <div className="g2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <input value={nuevo.titulo} onChange={e => setNuevo({ ...nuevo, titulo: e.target.value })} placeholder="Título de la pieza" style={inputStyle(t)} />
              <select value={nuevo.cliente} onChange={e => setNuevo({ ...nuevo, cliente: e.target.value })} style={inputStyle(t)}>
                {clientes.map(cl => <option key={cl.nombre}>{cl.nombre}</option>)}
              </select>
              <select value={nuevo.red} onChange={e => setNuevo({ ...nuevo, red: e.target.value })} style={inputStyle(t)}>
                {redes.map(r => <option key={r}>{r}</option>)}
              </select>
              <select value={nuevo.tipo} onChange={e => setNuevo({ ...nuevo, tipo: e.target.value })} style={inputStyle(t)}>
                {tipos.map(r => <option key={r}>{r}</option>)}
              </select>
              <select value={nuevo.responsable} onChange={e => setNuevo({ ...nuevo, responsable: e.target.value })} style={inputStyle(t)}>
                {responsables.map(r => <option key={r}>{r}</option>)}
              </select>
              <select value={nuevo.estado} onChange={e => setNuevo({ ...nuevo, estado: e.target.value })} style={inputStyle(t)}>
                {estados.map(r => <option key={r}>{r}</option>)}
              </select>
              <input type="date" value={nuevo.fecha} onChange={e => setNuevo({ ...nuevo, fecha: e.target.value })} style={inputStyle(t)} />
              <input type="time" value={nuevo.hora} onChange={e => setNuevo({ ...nuevo, hora: e.target.value })} style={inputStyle(t)} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Btn v="primary" t={t} onClick={crearEvento}>Guardar Evento</Btn>
              <Btn v="ghost" t={t} onClick={() => setMostrarForm(false)}>Cancelar</Btn>
            </div>
          </div>
        </Card>
      )}

      <Card t={t} style={{ padding: '18px' }}>
        <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Btn t={t} onClick={() => {
              if (vista === 'semanal') { const d = new Date(fechaBase); d.setDate(d.getDate() - 7); setFechaBase(d) }
              else setFechaBase(new Date(fechaBase.getFullYear(), fechaBase.getMonth() - 1, 1))
            }}>←</Btn>
            <div style={{ fontSize: '18px', fontWeight: 800, color: c.text, textTransform: 'capitalize' }}>
              {vista === 'mensual' ? formatoMes(fechaBase) : `${formatoDiaLargo(diasSemana[0])} → ${formatoDiaLargo(diasSemana[6])}`}
            </div>
            <Btn t={t} onClick={() => {
              if (vista === 'semanal') { const d = new Date(fechaBase); d.setDate(d.getDate() + 7); setFechaBase(d) }
              else setFechaBase(new Date(fechaBase.getFullYear(), fechaBase.getMonth() + 1, 1))
            }}>→</Btn>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setVista('mensual')} style={toggleStyle(t, vista === 'mensual')}>Vista Mensual</button>
            <button onClick={() => setVista('semanal')} style={toggleStyle(t, vista === 'semanal')}>Vista Semanal</button>
          </div>
        </div>
      </Card>

      {vista === 'mensual' ? (
        <Card t={t} style={{ padding: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
            {celdasMes.map((fecha, i) => {
              if (!fecha) return <div key={i} style={{ minHeight: '140px', borderRadius: '12px', background: 'transparent', border: `1px dashed ${c.border}`, opacity: 0.25 }} />
              const items = eventosPorFecha(fecha)
              const esHoy = mismoDia(fecha, hoy)
              return (
                <div key={i} style={{ minHeight: '140px', borderRadius: '12px', background: c.s2, border: `1px solid ${esHoy ? GOLD : c.border}`, padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: esHoy ? `0 0 0 1px ${GOLD}30 inset` : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <div style={{ lineHeight: 1.2 }}>
    <div style={{fontSize:'8px', color: esHoy ? GOLD : c.text3, fontWeight:700, letterSpacing:'0.5px'}}>
      {['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'][(fecha.getDay()+6)%7]}
    </div>
    <div style={{ fontSize: '13px', fontWeight: 800, color: esHoy ? GOLD : c.text }}>{fecha.getDate()}</div>
  </div>
  {items.length > 0 && <Tag label={`${items.length}`} color={GOLD} />}
</div>
                  <div style={{ display: 'grid', gap: '6px' }}>
                    {items.slice(0, 3).map(ev => (
                      <div key={ev.id} className="char-row" style={{ padding: '10px', borderRadius: '10px', background: clienteColor(ev.cliente, clientes) + '12', border: `1px solid ${clienteColor(ev.cliente, clientes)}35`, display: 'grid', gap: '6px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px', alignItems: 'flex-start' }}>
                          <div style={{ fontSize: '13px', color: c.text, fontWeight: 700, lineHeight: 1.3, flex: 1 }}>{ev.titulo}</div>
                          <button onClick={() => eliminarEvento(ev.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: RED, fontSize: '12px', padding: '0', lineHeight: 1, flexShrink: 0 }}>✕</button>
                        </div>
                        <div style={{ fontSize: '12px', color: c.text3 }}>{ev.cliente} · {ev.hora}</div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <Tag label={ev.tipo.toUpperCase()} color={clienteColor(ev.cliente, clientes)} />
                          <Tag label={ev.estado.toUpperCase()} color={estadoColor(ev.estado)} />
                        </div>
                      </div>
                    ))}
                    {items.length > 3 && <div style={{ fontSize: '10px', color: c.text3, padding: '2px 4px' }}>+{items.length - 3} más</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          <Card t={t} style={{ padding: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
              {diasSemana.map((dia, i) => {
                const items = eventosPorFecha(dia)
                const esHoy = mismoDia(dia, hoy)
                return (
                  <div key={i} style={{ borderRadius: '12px', background: c.s2, border: `1px solid ${esHoy ? GOLD : c.border}`, minHeight: '420px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: c.text3, textTransform: 'uppercase', letterSpacing: '1px' }}>{dia.toLocaleDateString('es-AR', { weekday: 'short' })}</div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: esHoy ? GOLD : c.text }}>{dia.getDate()}</div>
                    </div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {items.length === 0 && <div style={{ border: `1px dashed ${c.border}`, borderRadius: '10px', padding: '12px', fontSize: '11px', color: c.text3 }}>Sin contenido</div>}
                      {items.map(ev => (
                        <div key={ev.id} className="char-row" style={{ borderRadius: '10px', padding: '10px', background: clienteColor(ev.cliente, clientes) + '12', border: `1px solid ${clienteColor(ev.cliente, clientes)}35`, display: 'grid', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '12px', color: c.text, fontWeight: 700, flex: 1 }}>{ev.titulo}</div>
                            <button onClick={() => eliminarEvento(ev.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: RED, fontSize: '14px', padding: '0', lineHeight: 1 }}>✕</button>
                          </div>
                          <div style={{ fontSize: '10px', color: c.text3 }}>{ev.cliente} · {ev.red}</div>
                          <div style={{ fontSize: '10px', color: c.text2 }}>Responsable: <span style={{ color: c.text }}>{ev.responsable}</span></div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <Tag label={ev.tipo.toUpperCase()} color={clienteColor(ev.cliente, clientes)} />
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
                <div style={{ fontSize: '14px', color: c.text, fontWeight: 700, marginBottom: '8px' }}>Próximas publicaciones</div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {eventos.slice().sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`)).slice(0, 5).map(ev => (
                    <div key={ev.id} className="char-row" style={{ padding: '10px', borderRadius: '10px', border: `1px solid ${c.border}`, background: c.s2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: c.text, fontWeight: 700 }}>{ev.titulo}</div>
                        <div style={{ fontSize: '10px', color: c.text3, marginTop: '3px' }}>{ev.cliente} · {new Date(ev.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} · {ev.hora}hs</div>
                      </div>
                      <button onClick={() => eliminarEvento(ev.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: RED, fontSize: '16px' }}>🗑</button>
                    </div>
                  ))}
                  {eventos.length === 0 && <div style={{ fontSize: '13px', color: c.text3 }}>No hay eventos creados aún</div>}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: c.text, fontWeight: 700, marginBottom: '8px' }}>Estado de contenidos</div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {[['Borrador', resumen.borrador, AMBER], ['Aprobado', resumen.aprobado, BLUE], ['Publicado', resumen.publicado, GREEN]].map(([label, val, color]) => (
                    <div key={label as string} style={{ padding: '10px 12px', borderRadius: '10px', border: `1px solid ${c.border}`, background: c.s2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: c.text2, fontSize: '13px' }}>{label}</span>
                      <span style={{ color: color as string, fontWeight: 800, fontSize: '18px' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: c.text, fontWeight: 700, marginBottom: '8px' }}>Integraciones</div>
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
