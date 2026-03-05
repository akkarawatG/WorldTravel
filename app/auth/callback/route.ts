import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // ✅ 1. ปรับแก้ตามที่พี่ DevOps แนะนำเป๊ะๆ (มี Fallback ที่ฉลาดขึ้น)
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/'
  const next = searchParams.get('next') ?? basePath

  // ลบ slash ตัวท้ายของ origin เพื่อป้องกัน URL เบิ้ล 
  // (เช่น กันไม่ให้เป็น http://localhost:3000//wordtravel)
  const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
  
  const forwardedHost = request.headers.get('x-forwarded-host') 
  const isLocalEnv = process.env.NODE_ENV === 'development'

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        // ✅ 2. นำตัวแปร next ไปต่อท้าย URL ได้เลยตรงๆ เพราะพี่เขาคิดมาเผื่อแล้ว
        if (isLocalEnv) {
          return NextResponse.redirect(`${cleanOrigin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${cleanOrigin}${next}`)
        }
      } else {
        console.error("Supabase Auth Error:", error.message);
      }
    } catch (err: any) {
      console.error("Server Route Catch Error:", err.message);
    }
  }

  // ✅ 3. กรณีล็อกอินไม่ผ่าน ให้เด้งไปหน้า Error
  const errorPath = basePath === '/' ? '/auth/auth-code-error' : `${basePath}/auth/auth-code-error`;
  return NextResponse.redirect(`${cleanOrigin}${errorPath}`)
}