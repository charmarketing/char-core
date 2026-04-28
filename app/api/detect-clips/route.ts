import { NextResponse } from "next/server"

export async function POST(req: Request) {

  const { transcript } = await req.json()

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: "Detect viral moments in transcripts"
        },
        {
          role: "user",
          content: `
          From this transcript detect the 5 most viral moments.
          Return timestamps like:

          00:01:20 - 00:01:50
          00:04:10 - 00:04:40
          00:08:00 - 00:08:30

          Transcript:
          ${transcript}
          `
        }
      ]
    })
  })

  const data = await response.json()

  return NextResponse.json(data)

}
