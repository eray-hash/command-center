import { useState } from 'react'
import type { RecordingMeta } from '../../types/recording'
import type { Project } from '../../types/project'

const NEW_PROJECT_VALUE = '__new__'

export function AssignRecordingModal({
  recording,
  projects,
  onAssignExisting,
  onAssignNew,
  onDiscard,
}: {
  recording: RecordingMeta
  projects: Project[]
  onAssignExisting: (projectId: string | null) => void
  onAssignNew: (name: string) => void
  onDiscard: () => void
}) {
  const [selected, setSelected] = useState<string>('')
  const [newName, setNewName] = useState('')

  const minutes = Math.floor(recording.durationSec / 60)
  const seconds = recording.durationSec % 60

  function confirm() {
    if (selected === NEW_PROJECT_VALUE) {
      const trimmed = newName.trim()
      if (!trimmed) return
      onAssignNew(trimmed)
    } else {
      onAssignExisting(selected || null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#17171d] p-5">
        <h2 className="mb-1 text-lg font-semibold">Gespräch wurde protokolliert</h2>
        <p className="mb-3 text-xs text-white/40">
          {new Date(recording.createdAt).toLocaleString('de-DE')} · Dauer {minutes}:
          {seconds.toString().padStart(2, '0')} Min. — wird für die Abrechnung als Ist-Zeit hinterlegt.
        </p>

        <div className="mb-4 max-h-40 overflow-y-auto rounded-md bg-white/5 p-3 text-sm text-white/80">
          {recording.transcript || <span className="text-white/30">Kein Text erkannt.</span>}
        </div>

        <label className="mb-1 block text-xs text-white/50">Welchem Projekt/Kunden zuordnen?</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="mb-2 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-brand-teal"
        >
          <option value="">— Noch unklar / sonstiges —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
          <option value={NEW_PROJECT_VALUE}>+ Neuer Kunde / neues Projekt…</option>
        </select>

        {selected === NEW_PROJECT_VALUE && (
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name des neuen Kunden/Projekts"
            className="mb-4 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-brand-teal"
          />
        )}

        <div className="mt-2 flex justify-end gap-2">
          <button onClick={onDiscard} className="rounded-md px-3 py-1.5 text-sm text-white/50 hover:text-white">
            Löschen
          </button>
          <button
            onClick={confirm}
            disabled={selected === NEW_PROJECT_VALUE && !newName.trim()}
            className="rounded-md bg-brand-violet px-4 py-1.5 text-sm font-medium disabled:opacity-40"
          >
            Zuordnen
          </button>
        </div>
      </div>
    </div>
  )
}
