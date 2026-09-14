import type { AgendaItem } from '../../types/agenda'
import type { Project } from '../../types/project'
import { VoiceCaptureField } from './VoiceCaptureField'

export function AgendaList({
  items,
  projects,
  onAdd,
  onToggle,
  onRemove,
}: {
  items: AgendaItem[]
  projects: Project[]
  onAdd: (text: string) => void
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}) {
  const open = items.filter((i) => i.status === 'offen')
  const done = items.filter((i) => i.status === 'erledigt')

  function projectName(projectId: string | null) {
    if (!projectId) return null
    return projects.find((p) => p.id === projectId)?.name ?? null
  }

  return (
    <section className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
      <h2 className="mb-1 text-sm font-semibold text-white/80">Agenda für Claude</h2>
      <p className="mb-3 text-xs text-white/40">
        Per Sprache oder Text notiert — wird bei der nächsten Session gemeinsam eingeordnet, statt automatisch als
        fertiger Plan übernommen zu werden.
      </p>

      <VoiceCaptureField placeholder="Neue Idee oder Agenda-Punkt…" onSubmit={onAdd} />

      {open.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {open.map((item) => (
            <li key={item.id} className="flex items-start gap-2 rounded-md bg-white/5 px-3 py-2 text-sm">
              <input type="checkbox" checked={false} onChange={() => onToggle(item.id)} className="mt-0.5" />
              <div className="flex-1">
                <p>{item.text}</p>
                {projectName(item.projectId) && (
                  <span className="text-xs text-brand-teal">→ {projectName(item.projectId)}</span>
                )}
              </div>
              <button onClick={() => onRemove(item.id)} className="text-xs text-white/30 hover:text-white/60">
                Entfernen
              </button>
            </li>
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-white/40">{done.length} erledigt</summary>
          <ul className="mt-2 flex flex-col gap-1">
            {done.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-xs text-white/30 line-through">
                <input type="checkbox" checked={true} onChange={() => onToggle(item.id)} className="no-underline" />
                {item.text}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
