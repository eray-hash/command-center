import { useEffect, useState } from 'react'
import type { RecordingMeta } from '../../types/recording'
import type { Project } from '../../types/project'
import { loadBlob } from '../../lib/recordingsDb'

export function AssignRecordingModal({
  recording,
  projects,
  onAssign,
  onDiscard,
}: {
  recording: RecordingMeta
  projects: Project[]
  onAssign: (projectId: string | null) => void
  onDiscard: () => void
}) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [selected, setSelected] = useState<string>('')

  useEffect(() => {
    let url: string | null = null
    loadBlob(recording.id).then((blob) => {
      if (blob) {
        url = URL.createObjectURL(blob)
        setAudioUrl(url)
      }
    })
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [recording.id])

  const minutes = Math.floor(recording.durationSec / 60)
  const seconds = recording.durationSec % 60

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#17171d] p-5">
        <h2 className="mb-1 text-lg font-semibold">Gespräch wurde aufgezeichnet</h2>
        <p className="mb-3 text-xs text-white/40">
          Aufgenommen am {new Date(recording.createdAt).toLocaleString('de-DE')} · Dauer {minutes}:
          {seconds.toString().padStart(2, '0')} Min.
        </p>

        {audioUrl && <audio controls src={audioUrl} className="mb-4 w-full" />}

        <label className="mb-1 block text-xs text-white/50">Welchem Projekt/Kunden zuordnen?</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="mb-4 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-brand-teal"
        >
          <option value="">— Noch unklar / sonstiges —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onDiscard} className="rounded-md px-3 py-1.5 text-sm text-white/50 hover:text-white">
            Löschen
          </button>
          <button
            onClick={() => onAssign(selected || null)}
            className="rounded-md bg-brand-violet px-4 py-1.5 text-sm font-medium"
          >
            Zuordnen
          </button>
        </div>
      </div>
    </div>
  )
}
