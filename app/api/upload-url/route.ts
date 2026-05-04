import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://29c957257d0711029533df90987831d2.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json()
    const key = `videos/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g,'_')}`
    const signedUrl = await getSignedUrl(r2, new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      ContentType: contentType,
    }), { expiresIn: 3600 })
    const publicUrl = `https://pub-8b0049e88ce647d286ecbba7d9f54023.r2.dev/${key}`
    return NextResponse.json({ signedUrl, publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
