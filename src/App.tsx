import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'
import { LoginScreen } from './features/auth/LoginScreen'
import { DashboardScreen } from './features/dashboard/DashboardScreen'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [checkingSession, setCheckingSession] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCheckingSession(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  if (!isSupabaseConfigured) {
    // Demo-Modus: keine Datenbank verbunden, Dashboard zeigt Mock-Daten ohne Login.
    return <DashboardScreen />
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-white/50">Lade…</p>
      </div>
    )
  }

  return session ? <DashboardScreen /> : <LoginScreen />
}

export default App
