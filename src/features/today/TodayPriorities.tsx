import type { Project, Task } from '../../types/project'

interface Entry {
  task: Task
  projectName: string
  kind: 'overdue' | 'today' | 'hoch' | 'claude'
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function weekdayGerman(): string {
  return new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
}

function collectEntries(projects: Project[]): { priorities: Entry[]; upcoming: Entry[] } {
  const today = todayIso()
  const in7 = new Date()
  in7.setDate(in7.getDate() + 7)
  const in7Iso = in7.toISOString().slice(0, 10)

  const priorities: Entry[] = []
  const upcoming: Entry[] = []
  const seen = new Set<string>()

  for (const project of projects) {
    for (const milestone of project.milestones) {
      for (const task of milestone.tasks) {
        if (task.status === 'erledigt') continue

        if (task.wiedervorlage && task.wiedervorlage <= today) {
          priorities.push({ task, projectName: project.name, kind: 'overdue' })
          seen.add(task.id)
        } else if (task.wiedervorlage && task.wiedervorlage <= in7Iso) {
          upcoming.push({ task, projectName: project.name, kind: 'today' })
        }
      }
    }
  }

  for (const project of projects) {
    for (const milestone of project.milestones) {
      for (const task of milestone.tasks) {
        if (task.status === 'erledigt' || seen.has(task.id)) continue
        if (task.prio === 'hoch') {
          priorities.push({ task, projectName: project.name, kind: 'hoch' })
          seen.add(task.id)
        } else if (task.fuerClaude) {
          priorities.push({ task, projectName: project.name, kind: 'claude' })
          seen.add(task.id)
        }
      }
    }
  }

  return { priorities, upcoming }
}

const iconFor: Record<Entry['kind'], string> = {
  overdue: '📞',
  today: '📅',
  hoch: '🔴',
  claude: '🤖',
}

function EntryRow({ e }: { e: Entry }) {
  return (
    <li className="flex items-start gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5 text-sm">
      <span className="shrink-0">{iconFor[e.kind]}</span>
      <div className="min-w-0 flex-1">
        <p className="text-gray-900">{e.task.title}</p>
        <p className="text-xs text-gray-400">
          {e.projectName}
          {e.task.zustaendig ? ` · ${e.task.zustaendig}` : ''}
          {e.task.wiedervorlage ? ` · ${e.kind === 'overdue' ? 'überfällig seit' : 'fällig'} ${e.task.wiedervorlage}` : ''}
        </p>
      </div>
    </li>
  )
}

export function TodayPriorities({ projects }: { projects: Project[] }) {
  const { priorities, upcoming } = collectEntries(projects)

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
            <EntryRow key={e.task.id} e={e} />
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
              <EntryRow key={e.task.id} e={e} />
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
