import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

// Explizit statt nur auf die Defaults zu vertrauen: Session dauerhaft in localStorage
// ablegen und automatisch erneuern, damit man sich auf dem Homescreen (PWA) nicht bei
// jedem Öffnen neu anmelden muss.
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'command-center-auth',
      },
    })
  : null
