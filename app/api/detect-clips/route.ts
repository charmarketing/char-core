import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json()

    if (!transcript || transcript.trim() === "") {
      return NextResponse.json({ error: "El transcrito está vacío" }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Falta la variable de entorno GROQ_API_KEY en Vercel" }, { status: 500 })
    }

    // Forzamos el uso de Llama 3.3 70b con respuesta estructurada en JSON puro
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-specdec", // Modelo premium gratuito de alta velocidad
        response_format: { type: "json_object" }, // FORZAMOS MODO JSON NATIVO
        temperature: 0.3, // Baja temperatura para que sea preciso con los números
        messages: [
          {
            role: "system",
            content: `Eres un experto en edición audiovisual y viralidad en redes sociales (TikTok, Reels, Shorts).
            Analiza el texto y detecta exactamente los 5 momentos con mayor potencial de retención y gancho viral.
            Debes responder UNICAMENTE con un objeto JSON que siga estrictamente la siguiente estructura, sin texto introductorio ni explicaciones:
            {
              "clips": [
                {
                  "id": 1,
                  "startTime": "00:01:20",
                  "endTime": "00:01:50",
                  "title": "Título gancho del clip",
                  "reason": "Breve justificación de por qué es viral"
                }
              ]
            }`
          },
          {
            role: "user",
            content: `Detecta los 5 momentos virales del siguiente texto de transcripción. Asegúrate de que los tiempos de inicio y fin tengan sentido cronológico según el contexto de la conversación.
            
            Transcripción:
            ${transcript}`
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: `Error de Groq API: ${errorText}` }, { status: response.status })
    }

    const data = await response.json()
    
    // Validamos y extraemos el JSON estructurado que nos devolvió Groq
    const contentString = data.choices?.[0]?.message?.content
    if (!contentString) {
      return NextResponse.json({ error: "La IA no devolvió contenido válido" }, { status: 500 })
    }

    const structuredClips = JSON.parse(contentString)

    // Devolvemos los clips listos y limpios directamente al frontend
    return NextResponse.json(structuredClips)

  } catch (error: any) {
    console.error("Error crítico en detect-clips:", error)
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 })
  }
}
