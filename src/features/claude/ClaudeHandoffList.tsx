import type { Project } from '../../types/project'

interface HandoffEntry {
  projectId: string
  projectName: string
  milestoneId: string
  taskId: string
  title: string
}

export function ClaudeHandoffList({
  projects,
  onUnflag,
}: {
  projects: Project[]
  onUnflag: (projectId: string, milestoneId: string, taskId: string) => void
}) {
  const entries: HandoffEntry[] = []
  for (const project of projects) {
    for (const milestone of project.milestones) {
      for (const task of milestone.tasks) {
        if (task.fuerClaude) {
          entries.push({
            projectId: project.id,
            projectName: project.name,
            milestoneId: milestone.id,
            taskId: task.id,
            title: task.title,
          })
        }
      }
    }
  }

  if (entries.length === 0) return null

  return (
    <section className="mb-6 rounded-xl border border-brand-violet/30 bg-brand-violet/5 p-4">
      <h2 className="mb-2 text-sm font-semibold text-brand-violet">🤖 Für Claude vorgemerkt ({entries.length})</h2>
      <ul className="flex flex-col gap-2">
        {entries.map((e) => (
          <li
            key={e.taskId}
            className="flex items-center justify-between gap-2 rounded-md bg-white/5 px-3 py-2 text-sm"
          >
            <div>
              <p>{e.title}</p>
              <span className="text-xs text-white/40">{e.projectName}</span>
            </div>
            <button
              onClick={() => onUnflag(e.projectId, e.milestoneId, e.taskId)}
              className="shrink-0 text-xs text-white/40 hover:text-white/70"
            >
              Zurücknehmen
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
