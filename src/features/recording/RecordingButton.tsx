import { useState } from 'react'
import { useAudioRecorder } from '../../hooks/useAudioRecorder'

export function RecordingButton({ onSaved }: { onSaved: (blob: Blob, durationSec: number) => void }) {
  const { supported, recording, error, start, stop } = useAudioRecorder()
  const [saving, setSaving] = useState(false)

  if (!supported) {
    return (
      <p className="text-xs text-white/30">Aufnahme in diesem Browser nicht verfügbar.</p>
    )
  }

  async function handleClick() {
    if (recording) {
      setSaving(true)
      const result = await stop()
      if (result) onSaved(result.blob, result.durationSec)
      setSaving(false)
      return
    }
    await start()
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={saving}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg transition disabled:opacity-50 ${
            recording ? 'animate-pulse bg-red-600' : 'bg-brand-teal'
          }`}
          title={recording ? 'Aufnahme stoppen' : 'Gespräch aufzeichnen'}
        >
          {recording ? '⏹️' : '🔴'}
        </button>
        <div>
          <h2 className="text-sm font-semibold text-white/80">
            {recording ? 'Aufnahme läuft…' : 'Gespräch aufzeichnen'}
          </h2>
          <p className="text-xs text-white/40">
            Vorher ansagen: „Ich zeichne das zur Protokollierung auf, ist das okay?"
          </p>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  )
}
