import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function middleware() {
  const response = NextResponse.next()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!existingProfile) {
      const email = user.email || ''
      const fullName = (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || ''
      const avatarUrl = (user.user_metadata?.avatar_url as string) || ''

      await supabase.from('profiles').upsert({
        id: user.id,
        email,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}