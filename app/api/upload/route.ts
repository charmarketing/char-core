import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if(!file){
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
    }

    const maxSize = 50 * 1024 * 1024
    if(file.size > maxSize){
      return NextResponse.json({ error: 'Archivo muy grande. Máximo 50MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    const nombre = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const carpeta = file.type.startsWith('video/') ? 'videos' : 'imagenes'
    const path = `${carpeta}/${nombre}`

    const bytes = await file.arrayBuffer()
    const buffer = new Uint8Array(bytes)

    const { error } = await supabase.storage
      .from('blog-media')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false
      })

    if(error) throw error

    const { data: urlData } = supabase.storage
      .from('blog-media')
      .getPublicUrl(path)

    return NextResponse.json({ 
      url: urlData.publicUrl,
      tipo: carpeta,
      nombre: file.name
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
