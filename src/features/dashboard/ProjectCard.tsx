import { useState } from 'react'
import type { Project, Task, TaskStatus } from '../../types/project'
import { MilestoneList } from './MilestoneList'
import { VoiceCaptureField } from '../agenda/VoiceCaptureField'

const statusLabel: Record<Project['status'], string> = {
  geplant: 'Geplant',
  in_arbeit: 'In Arbeit',
  pausiert: 'Pausiert',
  abgeschlossen: 'Abgeschlossen',
}

const statusColor: Record<Project['status'], string> = {
  geplant: 'bg-zinc-600',
  in_arbeit: 'bg-brand-teal',
  pausiert: 'bg-amber-600',
  abgeschlossen: 'bg-emerald-600',
}

const prioLabel: Record<Project['prio'], string> = { niedrig: 'Niedrig', mittel: 'Mittel', hoch: 'Hoch' }
const prioColor: Record<Project['prio'], string> = {
  niedrig: 'border-zinc-500 text-zinc-400',
  mittel: 'border-amber-500 text-amber-400',
  hoch: 'border-red-500 text-red-400',
}

export function ProjectCard({
  project,
  onAddIdea,
  onMoveTask,
  onSaveTask,
}: {
  project: Project
  onAddIdea: (text: string, projectId: string) => void
  onMoveTask: (projectId: string, milestoneId: string, taskId: string, status: TaskStatus) => void
  onSaveTask: (projectId: string, milestoneId: string, taskId: string, patch: Partial<Task>) => void
}) {
  const [showCapture, setShowCapture] = useState(false)

  const allTasks = project.milestones.flatMap((m) => m.tasks)
  const doneCount = allTasks.filter((t) => t.status === 'erledigt').length
  const total = allTasks.length
  const pct = total ? Math.round((doneCount / total) * 100) : 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold leading-tight">{project.name}</h3>
          <span className="text-xs text-gray-500">{project.kind === 'kunde' ? 'Kundenprojekt' : 'Eigenes Projekt'}</span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${statusColor[project.status]}`}>
            {statusLabel[project.status]}
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${prioColor[project.prio]}`}>
            Prio {prioLabel[project.prio]}
          </span>
        </div>
      </div>

      {project.currentTask && (
        <p className="text-sm text-gray-700">
          <span className="text-gray-400">Gerade dran: </span>
          {project.currentTask}
        </p>
      )}

      <div>
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div className="h-1.5 rounded-full bg-brand-violet" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 text-xs text-gray-500">{pct}% · {doneCount}/{total} Einzelschritte erledigt</div>
      </div>

      <MilestoneList
        milestones={project.milestones}
        onMoveTask={(milestoneId, taskId, status) => onMoveTask(project.id, milestoneId, taskId, status)}
        onSaveTask={(milestoneId, taskId, patch) => onSaveTask(project.id, milestoneId, taskId, patch)}
      />

      <div className="border-t border-gray-200 pt-2">
        {showCapture ? (
          <VoiceCaptureField
            placeholder="Neue Idee für dieses Projekt…"
            onSubmit={(text) => {
              onAddIdea(text, project.id)
              setShowCapture(false)
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowCapture(true)}
            className="text-xs text-gray-400 hover:text-brand-teal"
          >
            + Idee für dieses Projekt (landet als Task)
          </button>
        )}
      </div>
    </div>
  )
}
