import { useEffect, useState } from 'react'
import type { Project, Task, TaskStatus } from '../types/project'
import { mockProjects } from '../data/mockProjects'
import { isSupabaseConfigured, supabase } from './supabaseClient'

const STORAGE_KEY = 'command-center:projects'

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

  function addAgendaAsTask(projectId: string, milestoneId: string, title: string) {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
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
    }

    setProjects((prev) =>
      prev.map((project) =>
        project.id !== projectId
          ? project
          : {
              ...project,
              milestones: project.milestones.map((milestone) =>
                milestone.id !== milestoneId ? milestone : { ...milestone, tasks: [...milestone.tasks, newTask] },
              ),
            },
      ),
    )

    if (supabase) {
      supabase
        .from('tasks')
        .insert({ id: newTask.id, milestone_id: milestoneId, title, status: 'offen', prio: 'mittel' })
        .then(({ error }) => {
          if (error) console.error('Task konnte nicht angelegt werden:', error.message)
        })
    }
  }

  return { projects, loading, updateTask, moveTask, addAgendaAsTask }
}
