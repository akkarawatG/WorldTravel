import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Param "next" ถ้าไม่มีให้ไปหน้า home
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Logic เลือก URL ปลายทางที่ถูกต้อง
      // ถ้ามี Environment Variable ให้ใช้ (Vercel) ถ้าไม่มีใช้ origin (Local)
      const forwardedHost = request.headers.get('x-forwarded-host') 
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        // Localhost
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        // Vercel (x-forwarded-host มักจะเป็น domain จริง)
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        // Fallback
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // ถ้า Error
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}