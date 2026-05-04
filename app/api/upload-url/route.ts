import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json()

    const endpoint = process.env.R2_ENDPOINT!
    const bucket   = process.env.R2_BUCKET!
    const key      = `videos/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g,'_')}`

    const r2 = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId:     process.env.R2_ACCESS_KEY!,
        secretAccessKey: process.env.R2_SECRET_KEY!,
      },
      forcePathStyle: true,
    })

    const signedUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
      { expiresIn: 3600 }
    )

    const publicUrl = `https://pub-8b0049e88ce647d286ecbba7d9f54023.r2.dev/${key}`

    return NextResponse.json({ signedUrl, publicUrl })
  } catch (e: any) {
    console.error('[upload-url]', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
