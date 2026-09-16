import type { Project } from '../../types/project'
import { collectPriorityEntries, type PriorityEntry } from '../../lib/todayPriorities'

function weekdayGerman(): string {
  return new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
}

const iconFor: Record<PriorityEntry['kind'], string> = {
  overdue: '📞',
  today: '📅',
  hoch: '🔴',
  claude: '🤖',
}

function EntryRow({ e, onOpen }: { e: PriorityEntry; onOpen: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-start gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5 text-left text-sm hover:bg-gray-100"
      >
        <span className="shrink-0">{iconFor[e.kind]}</span>
        <div className="min-w-0 flex-1">
          <p className="text-gray-900">{e.task.title}</p>
          <p className="text-xs text-gray-400">
            {e.projectName}
            {e.task.zustaendig ? ` · ${e.task.zustaendig}` : ''}
            {e.task.wiedervorlage
              ? ` · ${e.kind === 'overdue' ? 'überfällig seit' : 'fällig'} ${e.task.wiedervorlage}`
              : ''}
          </p>
        </div>
      </button>
    </li>
  )
}

export function TodayPriorities({
  projects,
  onOpenTask,
}: {
  projects: Project[]
  onOpenTask: (entry: PriorityEntry) => void
}) {
  const { priorities, upcoming } = collectPriorityEntries(projects)

  return (
    <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-400">{weekdayGerman()}</p>
      <h1 className="mb-4 text-xl font-bold text-gray-900">Guten Tag, Eray 👋</h1>

      <h2 className="mb-2 text-sm font-semibold text-gray-700">Deine Prioritäten heute</h2>
      {priorities.length === 0 ? (
        <p className="mb-4 text-sm text-gray-400">Nichts Dringendes — sauber!</p>
      ) : (
        <ul className="mb-4 flex flex-col gap-2">
          {priorities.map((e) => (
            <EntryRow key={e.task.id} e={e} onOpen={() => onOpenTask(e)} />
          ))}
        </ul>
      )}

      {upcoming.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs font-semibold text-gray-500">
            Diese Woche ({upcoming.length})
          </summary>
          <ul className="mt-2 flex flex-col gap-2">
            {upcoming.map((e) => (
              <EntryRow key={e.task.id} e={e} onOpen={() => onOpenTask(e)} />
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
