import type { Project } from '../types/project'

// Bekannte Zusatz-Begriffe pro Projekt, damit Sprachvarianten/Verschreiber erkannt werden
// (z. B. "Meyer" statt "Mayer" — passiert Eray selbst regelmäßig beim Diktieren).
const ALIASES: Record<string, string[]> = {
  'mayer-holding-crm': ['meyer holding', 'meyer', 'mayer', 'holding', 'crm'],
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Umlaute/Akzente vereinheitlichen
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function findProjectForQuery(query: string, projects: Project[]): Project | null {
  const q = normalize(query)

  let best: { project: Project; score: number } | null = null

  for (const project of projects) {
    const candidates = [project.name, ...(ALIASES[project.id] ?? [])].map(normalize)
    for (const candidate of candidates) {
      if (!candidate) continue
      if (q.includes(candidate)) {
        const score = candidate.length
        if (!best || score > best.score) best = { project, score }
      }
    }
  }

  return best?.project ?? null
}

const prioLabel: Record<Project['prio'], string> = { niedrig: 'niedriger', mittel: 'mittlerer', hoch: 'hoher' }
const statusLabel: Record<Project['status'], string> = {
  geplant: 'geplant',
  in_arbeit: 'in Arbeit',
  pausiert: 'pausiert',
  abgeschlossen: 'abgeschlossen',
}

export function buildProjectAnswer(project: Project): string {
  const allTasks = project.milestones.flatMap((m) => m.tasks)
  const done = allTasks.filter((t) => t.status === 'erledigt').length
  const total = allTasks.length
  const pct = total ? Math.round((done / total) * 100) : 0

  const parts: string[] = []
  parts.push(`${project.name} steht bei ${pct} Prozent, Status ${statusLabel[project.status]}, ${prioLabel[project.prio]} Priorität.`)

  if (project.currentTask) parts.push(`Gerade dran: ${project.currentTask}.`)

  const nextMilestone = project.milestones
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .find((m) => m.tasks.some((t) => t.status !== 'erledigt'))
  if (nextMilestone) {
    parts.push(`Aktueller Meilenstein: ${nextMilestone.title}${nextMilestone.eta ? `, fällig am ${nextMilestone.eta}` : ''}.`)
  }

  const openQuestions = allTasks.filter((t) => t.status === 'rueckfrage' || t.fragen)
  if (openQuestions.length > 0) {
    const first = openQuestions[0]
    parts.push(`Offene Rückfrage: ${first.fragen ?? first.title}.`)
  }

  return parts.join(' ')
}
