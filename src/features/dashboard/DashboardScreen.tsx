import { isSupabaseConfigured } from '../../lib/supabaseClient'
import { ProjectCard } from './ProjectCard'
import { AgendaList } from '../agenda/AgendaList'
import { useAgenda } from '../../lib/useAgenda'
import { useProjects } from '../../lib/useProjects'
import { useWorkspaces } from '../../lib/useWorkspaces'
import { WorkspaceTabs } from '../workspace/WorkspaceTabs'

export function DashboardScreen() {
  const { projects, loading, moveTask, updateTask } = useProjects()
  const { workspaces, selectedId, setSelectedId, addWorkspace } = useWorkspaces()
  const agenda = useAgenda()

  const visibleProjects = projects
    .filter((p) => p.workspaceId === selectedId)
    .sort((a, b) => {
      const order = { hoch: 0, mittel: 1, niedrig: 2 }
      return order[a.prio] - order[b.prio]
    })

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Fundament Command Center</h1>
        {!isSupabaseConfigured && (
          <span className="rounded-full bg-amber-600/20 px-3 py-1 text-xs font-medium text-amber-400">
            Demo-Modus — keine Datenbank verbunden
          </span>
        )}
      </header>

      <WorkspaceTabs
        workspaces={workspaces}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={addWorkspace}
      />

      <AgendaList
        items={agenda.items}
        projects={projects}
        onAdd={(text) => agenda.add(text, null)}
        onToggle={agenda.toggle}
        onRemove={agenda.remove}
      />

      {loading ? (
        <p className="text-white/50">Lade Projekte…</p>
      ) : visibleProjects.length === 0 ? (
        <p className="text-white/30">Noch keine Projekte in diesem Bereich.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onAddAgendaItem={(text, projectId) => agenda.add(text, projectId)}
              onMoveTask={moveTask}
              onSaveTask={updateTask}
            />
          ))}
        </div>
      )}
    </div>
  )
}
