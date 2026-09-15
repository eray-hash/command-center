import { useRef } from 'react'
import { useLiveTranscription } from '../../hooks/useLiveTranscription'

export function RecordingButton({ onSaved }: { onSaved: (transcript: string, durationSec: number) => void }) {
  const { supported, listening, liveText, start, stop } = useLiveTranscription()
  const startedAtRef = useRef(0)

  if (!supported) {
    return <p className="text-xs text-white/30">Protokoll-Aufnahme in diesem Browser nicht verfügbar.</p>
  }

  function handleClick() {
    if (listening) {
      const transcript = stop()
      const durationSec = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000))
      if (transcript) onSaved(transcript, durationSec)
      return
    }
    startedAtRef.current = Date.now()
    start()
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg transition ${
            listening ? 'animate-pulse bg-red-600' : 'bg-brand-teal'
          }`}
          title={listening ? 'Protokoll beenden' : 'Gespräch als Protokoll mitschreiben'}
        >
          {listening ? '⏹️' : '📝'}
        </button>
        <div>
          <h2 className="text-sm font-semibold text-white/80">
            {listening ? 'Protokoll läuft…' : 'Gespräch protokollieren'}
          </h2>
          <p className="text-xs text-white/40">
            Vorher ansagen: „Ich schreibe das zur Protokollierung mit, ist das okay?" — es wird nur der Text
            gespeichert, keine Audiodatei.
          </p>
        </div>
      </div>
      {listening && (
        <p className="mt-3 max-h-24 overflow-y-auto text-xs italic text-white/50">{liveText || '…höre zu…'}</p>
      )}
    </div>
  )
}
