import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient'
import { mockProjects } from '../../data/mockProjects'
import type { Project } from '../../types/project'
import { ProjectCard } from './ProjectCard'

export function DashboardScreen() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) return

    async function loadProjects() {
      const { data, error } = await supabase!
        .from('projects')
        .select('*, milestones(*)')
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
              .map((m: { id: string; title: string; done: boolean; eta: string | null; sort_order: number }) => ({
                id: m.id,
                title: m.title,
                done: m.done,
                eta: m.eta,
                sortOrder: m.sort_order,
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

      {loading ? (
        <p className="text-white/50">Lade Projekte…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
