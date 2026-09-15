import { useEffect, useState } from 'react'
import type { Project, Task, TaskStatus } from '../types/project'
import { mockProjects } from '../data/mockProjects'
import { isSupabaseConfigured, supabase } from './supabaseClient'

const STORAGE_KEY = 'command-center:projects'
const IDEEN_PROJECT_NAME = 'Ideen & Neukunden'
const IDEEN_MILESTONE_TITLE = 'Ideen'

interface TaskRow {
  id: string
  title: string
  status: TaskStatus
  prio: Task['prio']
  kunde: string | null
  abteilung: string | null
  zustaendig: string | null
  naechster_schritt: string | null
  fragen: string | null
  benoetigte_infos: string | null
  geplante_zeit_stunden: number | null
  ist_zeit_stunden: number | null
  umsatz_euro: number | null
  wiedervorlage: string | null
  erledigt_am: string | null
  protokoll: string | null
  taskvorschlaege: string | null
  fuer_claude: boolean
}

interface MilestoneRow {
  id: string
  title: string
  eta: string | null
  sort_order: number
  tasks: TaskRow[]
}

interface ProjectRow {
  id: string
  workspace_id: string | null
  name: string
  kind: Project['kind']
  status: Project['status']
  prio: Project['prio']
  current_task: string | null
  milestones: MilestoneRow[]
}

function blankTask(overrides: Partial<Task> & Pick<Task, 'title'>): Task {
  return {
    id: crypto.randomUUID(),
    status: 'offen',
    prio: 'mittel',
    kunde: null,
    abteilung: null,
    zustaendig: null,
    naechsterSchritt: null,
    fragen: null,
    benoetigteInfos: null,
    geplanteZeitStunden: null,
    istZeitStunden: null,
    umsatzEuro: null,
    wiedervorlage: null,
    erledigtAm: null,
    protokoll: null,
    taskvorschlaege: null,
    fuerClaude: false,
    ...overrides,
  }
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    prio: row.prio,
    kunde: row.kunde,
    abteilung: row.abteilung,
    zustaendig: row.zustaendig,
    naechsterSchritt: row.naechster_schritt,
    fragen: row.fragen,
    benoetigteInfos: row.benoetigte_infos,
    geplanteZeitStunden: row.geplante_zeit_stunden,
    istZeitStunden: row.ist_zeit_stunden,
    umsatzEuro: row.umsatz_euro,
    wiedervorlage: row.wiedervorlage,
    erledigtAm: row.erledigt_am,
    protokoll: row.protokoll,
    taskvorschlaege: row.taskvorschlaege,
    fuerClaude: row.fuer_claude,
  }
}

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    workspaceId: row.workspace_id ?? '',
    name: row.name,
    kind: row.kind,
    status: row.status,
    prio: row.prio,
    currentTask: row.current_task,
    includeInDashboard: true,
    milestones: (row.milestones ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((m) => ({
        id: m.id,
        title: m.title,
        eta: m.eta,
        sortOrder: m.sort_order,
        tasks: (m.tasks ?? []).map(mapTask),
      })),
  }
}

// Snake_case-Patch fürs Schreiben nach Supabase (nur die Felder, die sich ändern).
function toTaskRowPatch(patch: Partial<Task>): Record<string, unknown> {
  const map: Record<string, string> = {
    title: 'title',
    status: 'status',
    prio: 'prio',
    kunde: 'kunde',
    abteilung: 'abteilung',
    zustaendig: 'zustaendig',
    naechsterSchritt: 'naechster_schritt',
    fragen: 'fragen',
    benoetigteInfos: 'benoetigte_infos',
    geplanteZeitStunden: 'geplante_zeit_stunden',
    istZeitStunden: 'ist_zeit_stunden',
    umsatzEuro: 'umsatz_euro',
    wiedervorlage: 'wiedervorlage',
    erledigtAm: 'erledigt_am',
    protokoll: 'protokoll',
    taskvorschlaege: 'taskvorschlaege',
    fuerClaude: 'fuer_claude',
  }
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(patch)) {
    const column = map[key]
    if (column) out[column] = value
  }
  return out
}

function loadLocal(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Project[]) : mockProjects
  } catch {
    return mockProjects
  }
}

function saveLocal(projects: Project[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  } catch {
    // z. B. privates Fenster ohne localStorage-Zugriff — Stand bleibt dann nur im Speicher.
  }
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() => (isSupabaseConfigured ? [] : loadLocal()))
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) saveLocal(projects)
  }, [projects])

  useEffect(() => {
    if (!supabase) return

    supabase
      .from('projects')
      .select('*, milestones(*, tasks(*))')
      .eq('include_in_dashboard', true)
      .then(({ data, error }) => {
        if (!error && data) {
          setProjects((data as ProjectRow[]).map(mapProject))
        } else if (error) {
          console.error('Projekte konnten nicht geladen werden:', error.message)
        }
        setLoading(false)
      })
  }, [])

  function updateTask(projectId: string, milestoneId: string, taskId: string, patch: Partial<Task>) {
    setProjects((prev) =>
      prev.map((project) =>
        project.id !== projectId
          ? project
          : {
              ...project,
              milestones: project.milestones.map((milestone) =>
                milestone.id !== milestoneId
                  ? milestone
                  : {
                      ...milestone,
                      tasks: milestone.tasks.map((t) => (t.id !== taskId ? t : { ...t, ...patch })),
                    },
              ),
            },
      ),
    )

    if (supabase) {
      supabase
        .from('tasks')
        .update(toTaskRowPatch(patch))
        .eq('id', taskId)
        .then(({ error }) => {
          if (error) console.error('Task konnte nicht gespeichert werden:', error.message)
        })
    }
  }

  function moveTask(projectId: string, milestoneId: string, taskId: string, newStatus: TaskStatus) {
    const patch: Partial<Task> =
      newStatus === 'erledigt'
        ? { status: newStatus, erledigtAm: new Date().toISOString().slice(0, 10) }
        : { status: newStatus }
    updateTask(projectId, milestoneId, taskId, patch)
  }

  async function createProject(
    name: string,
    workspaceId: string,
    overrides: Partial<Pick<Project, 'kind' | 'status'>> = {},
  ): Promise<string> {
    const id = crypto.randomUUID()
    const kind = overrides.kind ?? 'kunde'
    const status = overrides.status ?? 'geplant'
    const newProject: Project = {
      id,
      workspaceId,
      name,
      kind,
      status,
      prio: 'mittel',
      currentTask: null,
      includeInDashboard: true,
      milestones: [],
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          id,
          workspace_id: workspaceId,
          name,
          kind,
          status,
          prio: 'mittel',
          include_in_dashboard: true,
        })
        .select()
        .single()
      if (error) {
        console.error('Projekt konnte nicht angelegt werden:', error.message)
      } else if (data) {
        newProject.id = data.id
      }
    }

    setProjects((prev) => [...prev, newProject])
    return newProject.id
  }

  // Findet einen Meilenstein per Titel in einem (aktuellen) Projekt-Stand oder legt ihn an.
  async function ensureMilestone(projectId: string, title: string): Promise<string> {
    const project = projects.find((p) => p.id === projectId)
    const existing = project?.milestones.find((m) => m.title === title)
    if (existing) return existing.id

    const milestoneId = crypto.randomUUID()
    const sortOrder = Math.max(0, ...(project?.milestones.map((m) => m.sortOrder) ?? [0])) + 1
    const milestone = { id: milestoneId, title, eta: null, sortOrder, tasks: [] }

    setProjects((prev) =>
      prev.map((p) => (p.id !== projectId ? p : { ...p, milestones: [...p.milestones, milestone] })),
    )

    if (supabase) {
      const { error } = await supabase
        .from('milestones')
        .insert({ id: milestoneId, project_id: projectId, title, sort_order: sortOrder })
      if (error) console.error(`Meilenstein "${title}" konnte nicht angelegt werden:`, error.message)
    }

    return milestoneId
  }

  async function addTaskToMilestone(projectId: string, milestoneId: string, task: Task) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id !== projectId
          ? p
          : {
              ...p,
              milestones: p.milestones.map((m) => (m.id !== milestoneId ? m : { ...m, tasks: [...m.tasks, task] })),
            },
      ),
    )

    if (supabase) {
      const { error } = await supabase.from('tasks').insert({
        id: task.id,
        milestone_id: milestoneId,
        title: task.title,
        status: task.status,
        prio: task.prio,
        ist_zeit_stunden: task.istZeitStunden,
        erledigt_am: task.erledigtAm,
        protokoll: task.protokoll,
        fuer_claude: task.fuerClaude,
      })
      if (error) console.error('Task konnte nicht gespeichert werden:', error.message)
    }
  }

  // Legt (falls nötig) einen "Telefonate"-Meilenstein an und trägt das Gespräch als
  // erledigten Task mit Ist-Zeit (Abrechnung) und Protokoll-Text ein.
  async function logCallOnProject(projectId: string, transcript: string, durationSec: number, occurredAt: string) {
    const milestoneId = await ensureMilestone(projectId, 'Telefonate')
    const dateLabel = new Date(occurredAt).toLocaleDateString('de-DE')
    const hours = Math.round((durationSec / 3600) * 100) / 100

    const task = blankTask({
      title: `Telefonat – ${dateLabel}`,
      status: 'erledigt',
      istZeitStunden: hours,
      erledigtAm: occurredAt.slice(0, 10),
      protokoll: transcript || null,
    })

    await addTaskToMilestone(projectId, milestoneId, task)
  }

  // Idee per Sprache/Text: wird direkt als Task angelegt. Ohne Projektbezug landet sie
  // im Sammelprojekt "Ideen & Neukunden" (gemeinsamer Bereich), bis sie eingeordnet wird.
  async function createIdeaTask(text: string, projectId: string | null, sharedWorkspaceId: string) {
    let targetProjectId = projectId

    if (!targetProjectId) {
      const existing = projects.find((p) => p.name === IDEEN_PROJECT_NAME)
      targetProjectId = existing
        ? existing.id
        : await createProject(IDEEN_PROJECT_NAME, sharedWorkspaceId, { kind: 'eigen', status: 'in_arbeit' })
    }

    const milestoneId = await ensureMilestone(targetProjectId, IDEEN_MILESTONE_TITLE)
    const task = blankTask({ title: text })
    await addTaskToMilestone(targetProjectId, milestoneId, task)
  }

  return {
    projects,
    loading,
    updateTask,
    moveTask,
    createProject,
    logCallOnProject,
    createIdeaTask,
  }
}
