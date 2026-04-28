import { NextResponse } from "next/server"

export async function POST(req: Request) {

  const { audioUrl } = await req.json()

  const response = await fetch("https://api.deepgram.com/v1/listen", {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: audioUrl
    })
  })

  const data = await response.json()

  return NextResponse.json(data)

}
