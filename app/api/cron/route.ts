import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if(authHeader !== `Bearer ${process.env.CRON_SECRET}`){
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const hoy = new Date().toISOString().split('T')[0]

    const { data: tareas } = await supabase
      .from('tareas')
      .select('*, clientes(nombre)')
      .eq('completada', false)
      .lte('fecha_vencimiento', hoy)

    if(!tareas || tareas.length === 0){
      return NextResponse.json({ ok: true, mensaje: 'Sin tareas vencidas hoy' })
    }

    for(const tarea of tareas){
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'tarea_vencida',
          datos: {
            tarea: tarea.titulo,
            cliente: tarea.clientes?.nombre || 'Sin cliente',
            fecha: new Date(tarea.fecha_vencimiento).toLocaleDateString('es-AR')
          }
        })
      })
    }

    return NextResponse.json({ 
      ok: true, 
      tareas_vencidas: tareas.length,
      detalle: tareas.map((t:any) => t.titulo)
    })

  } catch (error: any) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
