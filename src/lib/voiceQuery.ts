import type { Project } from '../types/project'

// Bekannte Zusatz-Begriffe pro Projekt, damit häufige Sprach-/Verschreib-Varianten
// direkt (ohne Unschärfe-Suche) erkannt werden.
const ALIASES: Record<string, string[]> = {
  'mayer-holding-crm': ['meyer holding', 'meyer', 'mayer', 'maya', 'maier', 'holding', 'crm'],
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

// Levenshtein-Distanz (Editierdistanz) — zählt, wie viele Buchstaben eingefügt, gelöscht
// oder ersetzt werden müssten, um von a nach b zu kommen.
function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j])
    }
  }
  return dp[a.length][b.length]
}

// Wie tolerant wir bei einem Wort dieser Länge gegenüber Abweichungen sind — Spracherkennung
// verschreibt Eigennamen wie "Mayer" öfter mal als "Maya", "Meyer", "Maier" etc.
function toleranceFor(wordLength: number): number {
  if (wordLength <= 4) return 1
  if (wordLength <= 7) return 2
  return 3
}

export function findProjectForQuery(query: string, projects: Project[]): Project | null {
  const q = normalize(query)

  // 1. Exakter/Teilstring-Treffer auf Name + bekannte Aliase — am zuverlässigsten, zuerst versuchen.
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
  if (best) return best.project

  // 2. Unscharfer Abgleich pro Wort — fängt Verschreibungen der Spracherkennung ab
  // (z. B. "Maya" statt "Mayer"), ohne jede Variante von Hand pflegen zu müssen.
  const queryWords = q.split(' ').filter((w) => w.length >= 3)
  let fuzzyBest: { project: Project; distance: number } | null = null

  for (const project of projects) {
    const candidateWords = [project.name, ...(ALIASES[project.id] ?? [])]
      .flatMap((c) => normalize(c).split(' '))
      .filter((w) => w.length >= 4)

    for (const candidateWord of candidateWords) {
      for (const queryWord of queryWords) {
        const distance = levenshtein(candidateWord, queryWord)
        if (distance <= toleranceFor(candidateWord.length)) {
          if (!fuzzyBest || distance < fuzzyBest.distance) fuzzyBest = { project, distance }
        }
      }
    }
  }

  return fuzzyBest?.project ?? null
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
