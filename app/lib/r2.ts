import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
})

export async function uploadToR2(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const fileName = `${Date.now()}-${file.name}`

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
  })

  await r2.send(command)

  return fileName
}
