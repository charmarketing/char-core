import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mensaje, cliente, filosofia, historial, pestaña, datosPitch, promptShadow } = body

    // Buscamos de manera exhaustiva en todas las variantes posibles de variables de entorno
    const API_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY || process.env.GROQ_API_KEY || "";

    if (!API_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: "Falta configurar la clave de API en Vercel (Asegurate de que se llame XAI_API_KEY, GROK_API_KEY o GROQ_API_KEY)" 
      }, { status: 400 });
    }

    let systemPrompt = `Sos el Cerebro IA de CHAR, una agencia de marketing digital argentina de élite. Especializada en contenido cinematográfico y estrategia de alto impacto.
    Respondé siempre en español argentino (usá "vos", "te", "podés").
    Sé conciso pero profundo – máximo 3 párrafos.
    Si el nombre del cliente parece un código o ID raro, ignoralo y hablá en general de la estrategia de la agencia.`;

    if (cliente && filosofia) {
      systemPrompt += `\n\nEstás respondiendo en el contexto del cliente: ${cliente}\nFilosofía y ADN:\n${filosofia}`;
    }

    let promptFinal = mensaje;
    const pestañaActual = String(pestaña || '').toLowerCase();

    if (pestañaActual.includes('shadow')) {
      systemPrompt += `\n\nTu rol actual es el módulo SHADOW: Auditar de forma implacable ideas o estrategias.`;
      promptFinal = `Audita el siguiente material:\n"${promptShadow || mensaje}"`;
    } 
    else if (pestañaActual.includes('pitch') || pestañaActual.includes('auto')) {
      systemPrompt += `\n\nTu rol actual es el módulo AUTO-PITCH: Crear propuestas comerciales High Ticket. Usa negritas.`;
      promptFinal = `Generá una propuesta comercial premium para:
      - Empresa: ${datosPitch?.empresa || 'Prospecto'}
      - Rubro: ${datosPitch?.rubro || 'B2B'}
      - Red Social: ${datosPitch?.redSocial || 'Instagram'}
      - Problema: ${datosPitch?.problema || 'Falta de autoridad'}`;
    } 
    else if (pestañaActual.includes('noticias') || pestañaActual.includes('blog')) {
      systemPrompt = `Sos el redactor estrella del blog de CHAR. Escribís artículos al estilo LinkedIn actual (fáciles de leer).`;
      promptFinal = `Escribí un artículo de tendencia corto e impactante sobre IA aplicada a los negocios B2B.`;
    }

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

    messagesForGrok.push({ role: "user", content: promptFinal });

    // Intentamos pegarle al servidor de Groq (usando el formato universal compatible con su API)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Usamos el modelo ultra veloz y estándar de Groq para evitar fallas
        messages: messagesForGrok,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ success: false, error: `Error de proveedor: ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    const respuestaTexto = data.choices[0].message.content || "No se recibió respuesta.";

    // SIEMPRE respondemos con un objeto JSON estructurado para que el frontend no rompa
    return NextResponse.json({ success: true, resultado: respuestaTexto });

  } catch (error: any) {
    console.error("❌ Error en api/chat/route.ts:", error);
    return NextResponse.json({ success: false, error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
