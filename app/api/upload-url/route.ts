import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json()
    if (!filename || !contentType) {
      return NextResponse.json({ error: 'filename y contentType requeridos' }, { status: 400 })
    }

    const key = `videos/${Date.now()}-${filename.replace(/\s+/g, '_')}`

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      ContentType: contentType,
    })

    // URL prefirmada válida por 1 hora — el browser sube directo a R2
    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 })

    // URL pública del archivo una vez subido
    const publicUrl = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${key}`

    return NextResponse.json({ signedUrl, publicUrl, key })
  } catch (err: any) {
    console.error('[upload-url]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
