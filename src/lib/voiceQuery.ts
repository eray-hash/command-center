import type { Project, Task } from '../types/project'
import { collectPriorityEntries, describePriorityEntries } from './todayPriorities'

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

  const revenue = allTasks.reduce((sum, t) => sum + (t.umsatzEuro ?? 0), 0)
  if (revenue > 0) parts.push(`Umsatz bisher erfasst: ${revenue.toLocaleString('de-DE')} €.`)

  return parts.join(' ')
}

interface TaskRef {
  task: Task
  projectName: string
}

function allOpenTasks(projects: Project[]): TaskRef[] {
  const out: TaskRef[] = []
  for (const project of projects) {
    for (const milestone of project.milestones) {
      for (const task of milestone.tasks) {
        if (task.status !== 'erledigt') out.push({ task, projectName: project.name })
      }
    }
  }
  return out
}

function listAnswer(refs: TaskRef[], emptyText: string, max = 6): string {
  if (refs.length === 0) return emptyText
  const shown = refs.slice(0, max)
  const lines = shown.map((r) => `${r.task.title} (${r.projectName})`)
  const rest = refs.length - shown.length
  const tail = rest > 0 ? ` Und ${rest} weitere${rest === 1 ? 'r' : ''}.` : ''
  return `${refs.length} Punkt${refs.length === 1 ? '' : 'e'}: ${lines.join('; ')}.${tail}`
}

// --- Zuständige Personen erkennen (aus den echten Daten, keine feste Liste nötig) ---

function collectPeople(projects: Project[]): string[] {
  const set = new Set<string>()
  for (const project of projects) {
    for (const milestone of project.milestones) {
      for (const task of milestone.tasks) {
        if (task.zustaendig) set.add(task.zustaendig)
      }
    }
  }
  return [...set]
}

function findPersonForQuery(query: string, people: string[]): string | null {
  const q = normalize(query)
  // Bewusst nur exakter Teilstring-Abgleich (keine Unschärfe-Toleranz): kurze Namen wie
  // "Hasan" oder "Timo" kollidieren sonst zu leicht mit gewöhnlichen Wörtern ("haben" etc.).
  for (const person of people) {
    if (q.includes(normalize(person))) return person
  }
  return null
}

// --- Intent-Erkennung: rein lokale Stichwortliste, keine Kosten, kein Sprachmodell ---

const DAY_OVERVIEW_KEYWORDS = [
  'heute zu tun',
  'heute alles zu tun',
  'was steht heute an',
  'was steht an',
  'meine prioritaten',
  'meine priorita',
  'was muss ich heute',
  'was muss ich tun',
  'was liegt heute an',
  'was habe ich heute',
  'aufgaben heute',
  'to do liste',
  'todo liste',
]

const CALL_KEYWORDS = ['wen muss ich anrufen', 'wen soll ich anrufen', 'wen rufe ich an', 'welche ruckrufe']

const OPEN_QUESTIONS_KEYWORDS = [
  'offene fragen',
  'offene ruckfragen',
  'welche ruckfragen',
  'worauf warten wir',
  'worauf warte ich',
  'was fehlt uns noch',
]

const OVERDUE_KEYWORDS = ['uberfallig', 'was hinkt', 'was hangt', 'was ist liegen geblieben']

const HIGH_PRIO_KEYWORDS = [
  'hohe priorita',
  'hoher priorita',
  'was ist wichtig',
  'was ist am wichtigsten',
  'wichtigsten themen',
  'was brennt',
]

const CLAUDE_KEYWORDS = [
  'bei claude',
  'an claude uebergeben',
  'was hast du claude',
  'was soll claude',
  'fuer claude vorgemerkt',
]

const PROJECT_LIST_KEYWORDS = [
  'wie viele projekte',
  'welche projekte gibt es',
  'welche projekte laufen',
  'was laeuft gerade alles',
  'liste alle projekte',
  'alle projekte auf',
]

const REVENUE_KEYWORDS = ['umsatz', 'wie viel geld', 'einnahmen']

export type VoiceAnswer = {
  kind:
    | 'day-overview'
    | 'calls'
    | 'person'
    | 'open-questions'
    | 'overdue'
    | 'high-prio'
    | 'claude'
    | 'project-list'
    | 'project'
    | 'not-found'
  text: string
}

function includesAny(q: string, keywords: string[]): boolean {
  return keywords.some((k) => q.includes(k))
}

// Ein Einstiegspunkt für die Sprachabfrage: prüft der Reihe nach spezifischere Absichten
// (Anrufe, Person, Rückfragen, Überfälliges, Priorität, Claude, Projektliste, Umsatz),
// bevor sie auf ein einzelnes Projekt oder den allgemeinen Tagesüberblick zurückfällt.
export function answerVoiceQuery(query: string, projects: Project[]): VoiceAnswer {
  const q = normalize(query)

  if (includesAny(q, CALL_KEYWORDS)) {
    const { priorities } = collectPriorityEntries(projects)
    const calls = priorities.filter((e) => e.kind === 'overdue')
    const text =
      calls.length === 0
        ? 'Aktuell steht niemand zum Rückruf an.'
        : `Anrufen: ${calls.map((e) => `${e.task.zustaendig ?? e.task.title} zu "${e.task.title}" (${e.projectName})`).join('; ')}.`
    return { kind: 'calls', text }
  }

  const people = collectPeople(projects)
  const person = people.length > 0 ? findPersonForQuery(query, people) : null
  if (person) {
    const refs = allOpenTasks(projects).filter((r) => r.task.zustaendig === person)
    return {
      kind: 'person',
      text: listAnswer(refs, `${person} hat aktuell keine offenen Aufgaben eingetragen.`),
    }
  }

  if (includesAny(q, OPEN_QUESTIONS_KEYWORDS)) {
    const refs = allOpenTasks(projects).filter((r) => r.task.status === 'rueckfrage' || r.task.fragen)
    return {
      kind: 'open-questions',
      text: listAnswer(
        refs.map((r) => ({ ...r, task: { ...r.task, title: r.task.fragen ?? r.task.title } })),
        'Aktuell gibt es keine offenen Rückfragen.',
      ),
    }
  }

  if (includesAny(q, OVERDUE_KEYWORDS)) {
    const { priorities } = collectPriorityEntries(projects)
    const overdue = priorities.filter((e) => e.kind === 'overdue')
    return {
      kind: 'overdue',
      text: listAnswer(
        overdue.map((e) => ({ task: e.task, projectName: e.projectName })),
        'Nichts ist überfällig — sauber!',
      ),
    }
  }

  if (includesAny(q, HIGH_PRIO_KEYWORDS)) {
    const refs = allOpenTasks(projects).filter((r) => r.task.prio === 'hoch')
    return { kind: 'high-prio', text: listAnswer(refs, 'Aktuell ist nichts mit hoher Priorität offen.') }
  }

  if (includesAny(q, CLAUDE_KEYWORDS)) {
    const refs = allOpenTasks(projects).filter((r) => r.task.fuerClaude)
    return { kind: 'claude', text: listAnswer(refs, 'Aktuell liegt nichts bei Claude zur Bearbeitung.') }
  }

  if (includesAny(q, PROJECT_LIST_KEYWORDS)) {
    const names = projects.map((p) => `${p.name} (${statusLabel[p.status]})`)
    return {
      kind: 'project-list',
      text: `Du hast ${projects.length} Projekte: ${names.join(', ')}.`,
    }
  }

  if (includesAny(q, REVENUE_KEYWORDS)) {
    const project = findProjectForQuery(query, projects)
    if (project) {
      const revenue = project.milestones
        .flatMap((m) => m.tasks)
        .reduce((sum, t) => sum + (t.umsatzEuro ?? 0), 0)
      return {
        kind: 'project',
        text:
          revenue > 0
            ? `Für ${project.name} sind bisher ${revenue.toLocaleString('de-DE')} € Umsatz erfasst.`
            : `Für ${project.name} ist noch kein Umsatz erfasst.`,
      }
    }
  }

  if (includesAny(q, DAY_OVERVIEW_KEYWORDS)) {
    const { priorities } = collectPriorityEntries(projects)
    return { kind: 'day-overview', text: describePriorityEntries(priorities) }
  }

  const project = findProjectForQuery(query, projects)
  if (project) {
    return { kind: 'project', text: buildProjectAnswer(project) }
  }

  return {
    kind: 'not-found',
    text: `Das habe ich nicht verstanden. Frag z. B. "Was habe ich heute zu tun?", "Wen muss ich anrufen?", "Was macht Hasan?", "Welche Rückfragen gibt es?" oder "Wie steht Mayer Holding?"`,
  }
}
