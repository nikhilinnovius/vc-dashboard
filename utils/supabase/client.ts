import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6bGxwbXJ1b3V2bG5qZHBhenZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwNDMxMCwiZXhwIjoyMDcyNjgwMzEwfQ.EXYl7GiiXM7l8Kd2_kSX8b7vFciHhfsmc9ZsHPgBMZo"
const SUPABASE_URL="https://zzllpmruouvlnjdpazvf.supabase.co"

export function createClient() {
  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  )
}
