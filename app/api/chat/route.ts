import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { mensaje, cliente, filosofia, historial } = await req.json()

    const systemPrompt = `Sos el Cerebro IA de CHAR, una agencia de marketing digital argentina de élite.

Estás respondiendo en el contexto del cliente: ${cliente}

Filosofía y ADN de ${cliente}:
${filosofia}

REGLAS:
- Respondé siempre en español argentino (usá "vos", "te", "podés")
- Sé conciso pero profundo — máximo 3 párrafos
- Siempre orientá hacia acción concreta
- Sos experto en marketing digital, redes sociales, contenido y estrategia
- Respondé desde la perspectiva y valores de ${cliente}
- Nunca rompas el personaje`

    const contents = [
      ...historial.map((h:any)=>({
        role: h.rol==='user'?'user':'model',
        parts: [{ text: h.texto }]
      })),
      { role:'user', parts:[{ text: mensaje }] }
    ]

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.8,
          }
        })
      }
    )

    const data = await response.json()
    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta.'
    return NextResponse.json({ respuesta: texto })

  } catch (error:any) {
    console.error('Gemini error:', error)
    return NextResponse.json({ error: error.message },{ status:500 })
  }
}
