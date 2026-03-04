import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Param "next" ถ้าไม่มีให้ไปหน้า home (เอาเครื่องหมาย / ด้านหน้าออกก่อนเพื่อกันซ้อนกัน)
  let next = searchParams.get('next') ?? '/'
  if (next.startsWith('/')) {
    next = next.slice(1);
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // ✅ ดึง basePath จาก Environment Variable (ค่าจะเป็น '/wordtravel' หรือค่าว่าง)
      let basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      
      // ลบ slash ตัวท้ายของ origin ทิ้งถ้ามี เพื่อป้องกัน URL เบิ้ล //
      const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
      
      // ✅ ตรวจสอบสภาพแวดล้อม (Local vs Production)
      const forwardedHost = request.headers.get('x-forwarded-host') 
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      // สร้าง path ปลายทาง โดยรวม basePath เข้ากับ next 
      const destinationPath = `${basePath}/${next}`;

      if (isLocalEnv) {
        // Localhost
        return NextResponse.redirect(`${cleanOrigin}${destinationPath}`)
      } else if (forwardedHost) {
        // Vercel / Production Server (x-forwarded-host คือโดเมนจริง เช่น ideatrade1.com)
        return NextResponse.redirect(`https://${forwardedHost}${destinationPath}`)
      } else {
        // Fallback
        return NextResponse.redirect(`${cleanOrigin}${destinationPath}`)
      }
    }
  }

  // ถ้า Error ให้พากลับไปหน้า auth-code-error พร้อมรวม basePath
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
  return NextResponse.redirect(`${cleanOrigin}${basePath}/auth/auth-code-error`)
}