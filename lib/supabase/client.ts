import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // During build-time SSR (e.g. /_not-found), env vars may not exist.
  // Return a dummy client that won't crash the build.
  if (!supabaseUrl || !supabaseAnonKey) {
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
