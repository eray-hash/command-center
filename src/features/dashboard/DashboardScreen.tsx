import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient'
import { mockProjects } from '../../data/mockProjects'
import type { Project } from '../../types/project'
import { ProjectCard } from './ProjectCard'
import { AgendaList } from '../agenda/AgendaList'
import { useAgenda } from '../../lib/useAgenda'

export function DashboardScreen() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const agenda = useAgenda()

  useEffect(() => {
    if (!supabase) return

    async function loadProjects() {
      const { data, error } = await supabase!
        .from('projects')
        .select('*, milestones(*, tasks(*))')
        .eq('include_in_dashboard', true)

      if (!error && data) {
        setProjects(
          data.map((row) => ({
            id: row.id,
            name: row.name,
            kind: row.kind,
            status: row.status,
            currentTask: row.current_task,
            includeInDashboard: row.include_in_dashboard,
            milestones: (row.milestones ?? [])
              .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
              .map((m: { id: string; title: string; done: boolean; eta: string | null; sort_order: number; tasks: { id: string; title: string; done: boolean }[] }) => ({
                id: m.id,
                title: m.title,
                done: m.done,
                eta: m.eta,
                sortOrder: m.sort_order,
                tasks: (m.tasks ?? []).map((t) => ({ id: t.id, title: t.title, done: t.done })),
              })),
          })),
        )
      }
      setLoading(false)
    }

    loadProjects()
  }, [])

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Fundament Command Center</h1>
        {!isSupabaseConfigured && (
          <span className="rounded-full bg-amber-600/20 px-3 py-1 text-xs font-medium text-amber-400">
            Demo-Modus — keine Datenbank verbunden
          </span>
        )}
      </header>

      <AgendaList
        items={agenda.items}
        projects={projects}
        onAdd={(text) => agenda.add(text, null)}
        onToggle={agenda.toggle}
        onRemove={agenda.remove}
      />

      {loading ? (
        <p className="text-white/50">Lade Projekte…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onAddAgendaItem={(text, projectId) => agenda.add(text, projectId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
