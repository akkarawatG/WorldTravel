import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  let next = searchParams.get('next') ?? '/'
  if (next.startsWith('/')) {
    next = next.slice(1);
  }

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
  
  const forwardedHost = request.headers.get('x-forwarded-host') 
  const isLocalEnv = process.env.NODE_ENV === 'development'

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        const destinationPath = `${basePath}/${next}`;

        if (isLocalEnv) {
          return NextResponse.redirect(`${cleanOrigin}${destinationPath}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${destinationPath}`)
        } else {
          return NextResponse.redirect(`${cleanOrigin}${destinationPath}`)
        }
      } else {
        console.error("Supabase Auth Error:", error.message);
      }
    } catch (err: any) {
      // ✅ ดักจับ Error ขั้นรุนแรงที่ทำให้เซิร์ฟเวอร์พัง (ป้องกัน 502)
      console.error("Server Route Catch Error:", err.message);
    }
  }

  // ถ้าเข้าสู่ระบบไม่สำเร็จ หรือเกิด Error จะถูกส่งมาหน้านี้แทนการขึ้น 502
  return NextResponse.redirect(`${cleanOrigin}${basePath}/auth/auth-code-error`)
}