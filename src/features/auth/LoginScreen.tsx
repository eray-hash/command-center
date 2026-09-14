import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-6">
        <h1 className="mb-4 text-lg font-bold">Fundament Command Center</h1>
        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-brand-teal"
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-brand-teal"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-md bg-brand-violet px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Anmelden…' : 'Anmelden'}
          </button>
        </div>
      </form>
    </div>
  )
}
