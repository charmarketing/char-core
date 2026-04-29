import { uploadToR2 } from '../../lib/r2'
import { NextResponse } from 'next/server'
 
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    const key = await uploadToR2(file)
    return NextResponse.json({ success: true, key })
  } catch (err: any) {
    console.error('[upload]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
