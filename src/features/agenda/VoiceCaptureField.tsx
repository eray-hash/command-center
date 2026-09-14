import { useEffect, useState } from 'react'
import { useVoiceInput } from '../../hooks/useVoiceInput'

export function VoiceCaptureField({
  placeholder,
  onSubmit,
}: {
  placeholder: string
  onSubmit: (text: string) => void
}) {
  const { supported, listening, transcript, start, stop, reset } = useVoiceInput()
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (transcript) setDraft(transcript)
  }, [transcript])

  function submit() {
    const text = draft.trim()
    if (!text) return
    onSubmit(text)
    setDraft('')
    reset()
  }

  return (
    <div className="flex items-center gap-2">
      {supported && (
        <button
          type="button"
          onClick={listening ? stop : start}
          title={listening ? 'Aufnahme stoppen' : 'Per Sprache diktieren'}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm transition ${
            listening ? 'animate-pulse bg-red-600' : 'bg-brand-violet'
          }`}
        >
          🎤
        </button>
      )}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder={supported ? `${placeholder} (oder Mikrofon nutzen)` : placeholder}
        className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-brand-teal"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!draft.trim()}
        className="shrink-0 rounded-md bg-brand-teal px-3 py-2 text-sm font-medium disabled:opacity-30"
      >
        Hinzufügen
      </button>
    </div>
  )
}
