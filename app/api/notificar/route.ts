import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { tipo, datos } = await req.json()
    const apiKey = process.env.RESEND_API_KEY

    if(!apiKey){
      return NextResponse.json({ error: 'Sin RESEND_API_KEY' }, { status: 500 })
    }

    const templates: Record<string, { asunto: string; html: string }> = {
      tarea_vencida: {
        asunto: `⚠️ Tarea vencida — ${datos.cliente}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#05050f;color:#f0f0ff;padding:32px;border-radius:16px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
              <img src="https://project-gpu0d.vercel.app/fonts/logo-char.png" width="40" height="40" style="object-fit:contain"/>
              <div>
                <div style="font-size:18px;font-weight:800;color:#ffcd38;letter-spacing:1px;">CHAR CORE</div>
                <div style="font-size:11px;color:#4a4a6a;letter-spacing:2px;">SISTEMA OPERATIVO</div>
              </div>
            </div>
            <div style="background:#0b0b18;border:1px solid #f87171;border-radius:12px;padding:24px;margin-bottom:20px;">
              <div style="font-size:11px;color:#f87171;letter-spacing:2px;margin-bottom:8px;font-weight:700;">⚠️ TAREA VENCIDA</div>
              <div style="font-size:20px;font-weight:800;color:#f0f0ff;margin-bottom:8px;">${datos.tarea}</div>
              <div style="font-size:14px;color:#9090b8;">Cliente: <strong style="color:#ffcd38;">${datos.cliente}</strong></div>
              <div style="font-size:14px;color:#9090b8;">Venció: <strong style="color:#f87171;">${datos.fecha}</strong></div>
            </div>
            <a href="https://project-gpu0d.vercel.app" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#ffcd38,#cc8800);color:#050510;font-weight:800;text-decoration:none;border-radius:10px;font-size:14px;">
              Ver en CHAR CORE →
            </a>
            <div style="margin-top:24px;font-size:11px;color:#4a4a6a;border-top:1px solid #16163a;padding-top:16px;">
              CHAR · Agencia de Marketing Digital · Argentina · 2026
            </div>
          </div>
        `
      },
      comentario_blog: {
        asunto: `💬 Nuevo comentario en el blog — ${datos.post}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#05050f;color:#f0f0ff;padding:32px;border-radius:16px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
              <img src="https://project-gpu0d.vercel.app/fonts/logo-char.png" width="40" height="40" style="object-fit:contain"/>
              <div>
                <div style="font-size:18px;font-weight:800;color:#ffcd38;letter-spacing:1px;">CHAR CORE</div>
                <div style="font-size:11px;color:#4a4a6a;letter-spacing:2px;">SISTEMA OPERATIVO</div>
              </div>
            </div>
            <div style="background:#0b0b18;border:1px solid #4f8fff;border-radius:12px;padding:24px;margin-bottom:20px;">
              <div style="font-size:11px;color:#4f8fff;letter-spacing:2px;margin-bottom:8px;font-weight:700;">💬 NUEVO COMENTARIO</div>
              <div style="font-size:20px;font-weight:800;color:#f0f0ff;margin-bottom:8px;">${datos.post}</div>
              <div style="font-size:14px;color:#9090b8;margin-bottom:4px;">De: <strong style="color:#ffcd38;">${datos.nombre}</strong></div>
              <div style="background:#111124;border-radius:8px;padding:12px;margin-top:12px;font-size:14px;color:#9090b8;font-style:italic;">"${datos.comentario}"</div>
            </div>
            <a href="https://project-gpu0d.vercel.app/blog/${datos.post_id}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#ffcd38,#cc8800);color:#050510;font-weight:800;text-decoration:none;border-radius:10px;font-size:14px;">
              Ver comentario →
            </a>
            <div style="margin-top:24px;font-size:11px;color:#4a4a6a;border-top:1px solid #16163a;padding-top:16px;">
              CHAR · Agencia de Marketing Digital · Argentina · 2026
            </div>
          </div>
        `
      },
      alerta_cliente: {
        asunto: `🔔 Alerta — ${datos.cliente}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#05050f;color:#f0f0ff;padding:32px;border-radius:16px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
              <img src="https://project-gpu0d.vercel.app/fonts/logo-char.png" width="40" height="40" style="object-fit:contain"/>
              <div>
                <div style="font-size:18px;font-weight:800;color:#ffcd38;letter-spacing:1px;">CHAR CORE</div>
                <div style="font-size:11px;color:#4a4a6a;letter-spacing:2px;">SISTEMA OPERATIVO</div>
              </div>
            </div>
            <div style="background:#0b0b18;border:1px solid #ffcd38;border-radius:12px;padding:24px;margin-bottom:20px;">
              <div style="font-size:11px;color:#ffcd38;letter-spacing:2px;margin-bottom:8px;font-weight:700;">🔔 ALERTA CHAR CORE</div>
              <div style="font-size:20px;font-weight:800;color:#f0f0ff;margin-bottom:8px;">${datos.cliente}</div>
              <div style="font-size:14px;color:#9090b8;">${datos.mensaje}</div>
            </div>
            <a href="https://project-gpu0d.vercel.app" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#ffcd38,#cc8800);color:#050510;font-weight:800;text-decoration:none;border-radius:10px;font-size:14px;">
              Ver en CHAR CORE →
            </a>
            <div style="margin-top:24px;font-size:11px;color:#4a4a6a;border-top:1px solid #16163a;padding-top:16px;">
              CHAR · Agencia de Marketing Digital · Argentina · 2026
            </div>
          </div>
        `
      }
    }

    const template = templates[tipo]
    if(!template){
      return NextResponse.json({ error: 'Tipo de notificación inválido' }, { status: 400 })
    }

    const destinatarios = [
      process.env.EMAIL_GABRIEL,
      process.env.EMAIL_ADRI
    ].filter(Boolean)

    const resultados = await Promise.all(
      destinatarios.map(async (email) => {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            from: 'CHAR CORE <onboarding@resend.dev>',
            to: email,
            subject: template.asunto,
            html: template.html
          })
        })
        return res.json()
      })
    )

    return NextResponse.json({ ok: true, resultados })

  } catch (error: any) {
    console.error('Notificar error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
