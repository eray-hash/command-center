import { useEffect, useState } from 'react'
import type { Project, Task, TaskStatus } from '../types/project'
import { mockProjects } from '../data/mockProjects'
import { isSupabaseConfigured, supabase } from './supabaseClient'

const STORAGE_KEY = 'command-center:projects'

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

// Solange keine Supabase-Verbindung besteht, läuft alles lokal (pro Gerät, nicht zwischen
// Eray und Hassan synchronisiert). Sobald `supabase` konfiguriert ist, sollten die Mutationen
// stattdessen gegen `projects`/`milestones`/`tasks` schreiben (Realtime-Sync).
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
          // TODO: Mapping von Supabase-Rows auf das Project-Shape, sobald das Schema live ist.
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
  }

  function moveTask(projectId: string, milestoneId: string, taskId: string, newStatus: TaskStatus) {
    const patch: Partial<Task> =
      newStatus === 'erledigt'
        ? { status: newStatus, erledigtAm: new Date().toISOString().slice(0, 10) }
        : { status: newStatus }
    updateTask(projectId, milestoneId, taskId, patch)
  }

  function addAgendaAsTask(projectId: string, milestoneId: string, title: string) {
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
                      tasks: [
                        ...milestone.tasks,
                        {
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
                        },
                      ],
                    },
              ),
            },
      ),
    )
  }

  return { projects, loading, updateTask, moveTask, addAgendaAsTask }
}
