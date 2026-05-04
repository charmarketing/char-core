import { uploadToR2 } from "../../lib/r2"

export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get("file") as File

  if (!file) {
    return Response.json({ error: "No file" }, { status: 400 })
  }

  const filename = await uploadToR2(file)

  const url = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${filename}`

  return Response.json({ url })
}
