import type { Project, Task } from '../types/project'

export interface PriorityEntry {
  task: Task
  projectId: string
  milestoneId: string
  projectName: string
  kind: 'overdue' | 'today' | 'hoch' | 'claude'
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function collectPriorityEntries(projects: Project[]): {
  priorities: PriorityEntry[]
  upcoming: PriorityEntry[]
} {
  const today = todayIso()
  const in7 = new Date()
  in7.setDate(in7.getDate() + 7)
  const in7Iso = in7.toISOString().slice(0, 10)

  const priorities: PriorityEntry[] = []
  const upcoming: PriorityEntry[] = []
  const seen = new Set<string>()

  for (const project of projects) {
    for (const milestone of project.milestones) {
      for (const task of milestone.tasks) {
        if (task.status === 'erledigt') continue

        if (task.wiedervorlage && task.wiedervorlage <= today) {
          priorities.push({ task, projectId: project.id, milestoneId: milestone.id, projectName: project.name, kind: 'overdue' })
          seen.add(task.id)
        } else if (task.wiedervorlage && task.wiedervorlage <= in7Iso) {
          upcoming.push({ task, projectId: project.id, milestoneId: milestone.id, projectName: project.name, kind: 'today' })
        }
      }
    }
  }

  for (const project of projects) {
    for (const milestone of project.milestones) {
      for (const task of milestone.tasks) {
        if (task.status === 'erledigt' || seen.has(task.id)) continue
        if (task.prio === 'hoch') {
          priorities.push({ task, projectId: project.id, milestoneId: milestone.id, projectName: project.name, kind: 'hoch' })
          seen.add(task.id)
        } else if (task.fuerClaude) {
          priorities.push({ task, projectId: project.id, milestoneId: milestone.id, projectName: project.name, kind: 'claude' })
          seen.add(task.id)
        }
      }
    }
  }

  return { priorities, upcoming }
}

const kindLabel: Record<PriorityEntry['kind'], string> = {
  overdue: 'Rückruf/Wiedervorlage überfällig',
  today: 'Wiedervorlage bald fällig',
  hoch: 'hohe Priorität',
  claude: 'an Claude übergeben',
}

export function describePriorityEntries(entries: PriorityEntry[], max = 6): string {
  if (entries.length === 0) return 'Für heute ist nichts Dringendes offen — sauber.'

  const shown = entries.slice(0, max)
  const lines = shown.map(
    (e) => `${e.task.title} bei ${e.projectName} (${kindLabel[e.kind]})`,
  )
  const rest = entries.length - shown.length
  const tail = rest > 0 ? ` Und noch ${rest} weitere${rest === 1 ? 'r' : ''} Punkt${rest === 1 ? '' : 'e'}.` : ''

  return `Du hast ${entries.length} Priorität${entries.length === 1 ? '' : 'en'} heute: ${lines.join('; ')}.${tail}`
}
