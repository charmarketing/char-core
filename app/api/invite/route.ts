import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req:Request){
  try{
    const {email}=await req.json()
    if(!email) return NextResponse.json({error:'Email requerido'},{status:400})

    const supabase=createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const {error}=await supabase.auth.admin.inviteUserByEmail(email)
    if(error) return NextResponse.json({error:error.message},{status:400})

    return NextResponse.json({ok:true})
  }catch(e:any){
    return NextResponse.json({error:e.message},{status:500})
  }
}
