import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6bGxwbXJ1b3V2bG5qZHBhenZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwNDMxMCwiZXhwIjoyMDcyNjgwMzEwfQ.EXYl7GiiXM7l8Kd2_kSX8b7vFciHhfsmc9ZsHPgBMZo"
const SUPABASE_URL="https://zzllpmruouvlnjdpazvf.supabase.co"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}