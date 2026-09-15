import { useEffect, useState } from 'react'
import type { RecordingMeta } from '../../types/recording'
import { loadBlob } from '../../lib/recordingsDb'

function RecordingItem({ recording }: { recording: RecordingMeta }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string | null = null
    loadBlob(recording.id).then((blob) => {
      if (blob) {
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      }
    })
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [recording.id])

  const minutes = Math.floor(recording.durationSec / 60)
  const seconds = recording.durationSec % 60

  return (
    <div className="rounded-md bg-white/5 p-2 text-xs">
      <p className="mb-1 text-white/50">
        {new Date(recording.createdAt).toLocaleString('de-DE')} · {minutes}:{seconds.toString().padStart(2, '0')} Min.
      </p>
      {url && <audio controls src={url} className="w-full" style={{ height: 32 }} />}
    </div>
  )
}

export function ProjectRecordings({ recordings }: { recordings: RecordingMeta[] }) {
  const [open, setOpen] = useState(false)
  if (recordings.length === 0) return null

  return (
    <div className="border-t border-white/10 pt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs text-white/40 hover:text-brand-teal"
      >
        🎙️ {recordings.length} Aufnahme{recordings.length > 1 ? 'n' : ''} {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-2">
          {recordings.map((r) => (
            <RecordingItem key={r.id} recording={r} />
          ))}
        </div>
      )}
    </div>
  )
}
