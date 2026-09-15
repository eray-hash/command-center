import { useState } from 'react'
import type { Task } from '../../types/project'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-white/50">
      {label}
      {children}
    </label>
  )
}

const inputClass =
  'rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-white outline-none focus:border-brand-teal'

export function TaskDetailModal({
  task,
  onClose,
  onSave,
}: {
  task: Task
  onClose: () => void
  onSave: (patch: Partial<Task>) => void
}) {
  const [draft, setDraft] = useState<Task>(task)

  function field<K extends keyof Task>(key: K, value: Task[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function save() {
    onSave(draft)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/10 bg-[#17171d] p-5"
      >
        <input
          value={draft.title}
          onChange={(e) => field('title', e.target.value)}
          className="mb-4 w-full bg-transparent text-lg font-semibold outline-none"
        />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <select
              value={draft.status}
              onChange={(e) => field('status', e.target.value as Task['status'])}
              className={inputClass}
            >
              <option value="offen">Offen</option>
              <option value="in_arbeit">In Arbeit</option>
              <option value="rueckfrage">Rückfrage</option>
              <option value="erledigt">Erledigt</option>
            </select>
          </Field>

          <Field label="Priorität">
            <select
              value={draft.prio}
              onChange={(e) => field('prio', e.target.value as Task['prio'])}
              className={inputClass}
            >
              <option value="niedrig">Niedrig</option>
              <option value="mittel">Mittel</option>
              <option value="hoch">Hoch</option>
            </select>
          </Field>

          <Field label="Kunde">
            <input
              value={draft.kunde ?? ''}
              onChange={(e) => field('kunde', e.target.value || null)}
              className={inputClass}
            />
          </Field>

          <Field label="Abteilung">
            <input
              value={draft.abteilung ?? ''}
              onChange={(e) => field('abteilung', e.target.value || null)}
              className={inputClass}
            />
          </Field>

          <Field label="Zuständig">
            <input
              value={draft.zustaendig ?? ''}
              onChange={(e) => field('zustaendig', e.target.value || null)}
              className={inputClass}
            />
          </Field>

          <Field label="Wiedervorlage">
            <input
              type="date"
              value={draft.wiedervorlage ?? ''}
              onChange={(e) => field('wiedervorlage', e.target.value || null)}
              className={inputClass}
            />
          </Field>

          <Field label="Geplante Zeit (Std.)">
            <input
              type="number"
              value={draft.geplanteZeitStunden ?? ''}
              onChange={(e) => field('geplanteZeitStunden', e.target.value ? Number(e.target.value) : null)}
              className={inputClass}
            />
          </Field>

          <Field label="Ist-Zeit (Std.)">
            <input
              type="number"
              value={draft.istZeitStunden ?? ''}
              onChange={(e) => field('istZeitStunden', e.target.value ? Number(e.target.value) : null)}
              className={inputClass}
            />
          </Field>

          <Field label="Umsatz (€)">
            <input
              type="number"
              value={draft.umsatzEuro ?? ''}
              onChange={(e) => field('umsatzEuro', e.target.value ? Number(e.target.value) : null)}
              className={inputClass}
            />
          </Field>

          <Field label="Erledigt am">
            <input
              type="date"
              value={draft.erledigtAm ?? ''}
              onChange={(e) => field('erledigtAm', e.target.value || null)}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          <Field label="Nächster Schritt">
            <textarea
              value={draft.naechsterSchritt ?? ''}
              onChange={(e) => field('naechsterSchritt', e.target.value || null)}
              rows={2}
              className={inputClass}
            />
          </Field>
          <Field label="Offene Fragen">
            <textarea
              value={draft.fragen ?? ''}
              onChange={(e) => field('fragen', e.target.value || null)}
              rows={2}
              className={inputClass}
            />
          </Field>
          <Field label="Benötigte Informationen">
            <textarea
              value={draft.benoetigteInfos ?? ''}
              onChange={(e) => field('benoetigteInfos', e.target.value || null)}
              rows={2}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md px-3 py-1.5 text-sm text-white/50 hover:text-white">
            Abbrechen
          </button>
          <button onClick={save} className="rounded-md bg-brand-violet px-4 py-1.5 text-sm font-medium">
            Speichern
          </button>
        </div>
      </div>
    </div>
  )
}
