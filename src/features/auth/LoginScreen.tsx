import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'

export function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setLoading(true)
    setError(null)
    setInfo(null)

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else if (data.session) {
        // E-Mail-Bestätigung im Projekt deaktiviert — direkt eingeloggt.
      } else {
        setInfo('Konto erstellt. Bitte bestätige die E-Mail, die wir dir geschickt haben, und melde dich danach an.')
        setMode('login')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="mb-4 text-lg font-bold">Fundament Command Center</h1>
        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-teal"
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-teal"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          {info && <p className="text-sm text-brand-teal">{info}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-md bg-brand-violet px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? '…' : mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setError(null)
              setInfo(null)
            }}
            className="text-xs text-gray-400 hover:text-gray-700"
          >
            {mode === 'login' ? 'Noch kein Konto? Registrieren' : 'Schon ein Konto? Anmelden'}
          </button>
        </div>
      </form>
    </div>
  )
}
