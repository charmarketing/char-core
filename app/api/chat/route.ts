import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { mensaje, cliente, filosofia, historial, pestaña, datosPitch, promptShadow } = await req.json()

    // Usamos la clave de Grok que ya tenés configurada en tu archivo .env
    const XAI_API_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY || "";

    if (!XAI_API_KEY) {
      return NextResponse.json({ 
        error: "Falta configurar la clave de Grok (XAI_API_KEY) en las variables de entorno (.env)" 
      }, { status: 500 });
    }

    // ── INSTRUCCIONES MAESTRAS DE LA AGENCIA ──
    let systemPrompt = `Sos el Cerebro IA de CHAR, una agencia de marketing digital argentina de élite. Especializada en contenido cinematográfico y estrategia de alto impacto.
    
    REGLAS MÁXIMAS:
    - Respondé siempre en español argentino (usá "vos", "te", "podés").
    - Sé conciso pero profundo – máximo 3 párrafos (a menos que se pida una propuesta extensa).
    - Siempre orientá hacia acción concreta.
    - Sos experto en marketing digital, redes sociales, contenido y estrategia B2B High Ticket.
    - Nunca rompas el personaje.
    - IMPORTANTE: Si el nombre del cliente parece un código o ID raro (como números y letras largas), ignorá ese código y hablá en general de la estrategia de la agencia sin mencionar números técnicos.`;

    if (cliente && filosofia) {
      systemPrompt += `\n\nEstás respondiendo en el contexto del cliente: ${cliente}\nFilosofía y ADN de ${cliente}:\n${filosofia}`;
    }

    let promptFinal = mensaje;

    // ── SEGMENTAMOS LA LÓGICA SEGÚN LA PESTAÑA QUE APRETÓ EL USUARIO ──
    if (pestaña === 'shadow') {
      systemPrompt += `\n\nTu rol actual es el módulo SHADOW: Auditar de forma implacable ideas, guiones, copys o estrategias. Encontrá fallas y optimizalas bajo el ADN del cliente.`;
      promptFinal = `Audita exhaustivamente el siguiente material bajo la filosofía del cliente activo:\n"${promptShadow || mensaje}"`;
    } 
    else if (pestaña === 'auto-pitch') {
      systemPrompt += `\n\nTu rol actual es el módulo AUTO-PITCH: Crear propuestas comerciales High Ticket ultra-irresistibles en segundos. Estructura el pitch de forma limpia, vendedora y usando negritas.`;
      promptFinal = `Generá una propuesta comercial premium a nivel CHAR para este prospecto:
      - Empresa objetivo: ${datosPitch?.empresa || 'Empresa Prospecto'}
      - Rubro: ${datosPitch?.rubro || 'Mercado B2B'}
      - Red Social: ${datosPitch?.redSocial || 'Instagram/LinkedIn'}
      - Problema detectado: ${datosPitch?.problema || 'Falta de contenido premium y autoridad'}`;
    } 
    else if (pestaña === 'noticias') {
      systemPrompt = `Sos el redactor estrella y cazador de tendencias de IA para el blog de CHAR. Escribís artículos disruptivos, magnéticos, directos al grano y al estilo LinkedIn actual (fáciles de leer de forma pública).`;
      promptFinal = `Escribí un artículo de tendencia corto e impactante sobre Inteligencia Artificial aplicada a los negocios o creación audiovisual premium.`;
    }

    // Mapeamos el historial existente al formato que entiende Grok (X.AI / OpenAI style)
    const messagesForGrok = [
      { role: "system", content: systemPrompt }
    ];

    if (historial && Array.isArray(historial)) {
      historial.forEach((h: any) => {
        messagesForGrok.push({
          role: h.rol === 'user' ? 'user' : 'assistant',
          content: h.texto || h.content || ""
        });
      });
    }

    // Agregamos el mensaje o prompt actual al final
    messagesForGrok.push({ role: "user", content: promptFinal });

    // ── LLAMADA ULTRA RÁPIDA A GROK ──
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "grok-beta", // El modelo rápido y actualizado que usás en el editor
        messages: messagesForGrok,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Error de Grok: ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    const respuestaTexto = data.choices[0].message.content || "No se recibió respuesta.";

    // Devolvemos la respuesta en un string limpio para que tu frontend la renderice
    return NextResponse.json(respuestaTexto);

  } catch (error: any) {
    console.error("❌ Error en api/chat/route.ts:", error);
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}
