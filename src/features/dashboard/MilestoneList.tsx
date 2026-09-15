import { useState } from 'react'
import type { Milestone, Task, TaskStatus } from '../../types/project'
import { KanbanBoard } from '../kanban/KanbanBoard'

export function MilestoneList({
  milestones,
  onMoveTask,
  onSaveTask,
}: {
  milestones: Milestone[]
  onMoveTask: (milestoneId: string, taskId: string, status: TaskStatus) => void
  onSaveTask: (milestoneId: string, taskId: string, patch: Partial<Task>) => void
}) {
  const [openMilestone, setOpenMilestone] = useState<Milestone | null>(null)

  // Nach einer Mutation zeigt das Board weiter den aktuellen Stand des offenen Meilensteins.
  const liveOpenMilestone = openMilestone
    ? milestones.find((m) => m.id === openMilestone.id) ?? null
    : null

  return (
    <div className="flex flex-col gap-1">
      {[...milestones]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((milestone) => {
          const done = milestone.tasks.filter((t) => t.status === 'erledigt').length
          const total = milestone.tasks.length

          return (
            <button
              key={milestone.id}
              type="button"
              onClick={() => setOpenMilestone(milestone)}
              className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-sm hover:bg-white/5"
            >
              <span className="text-white/40">›</span>
              <span className={done === total && total > 0 ? 'text-white/40 line-through' : ''}>
                {milestone.title}
              </span>
              <span className="ml-auto shrink-0 text-xs text-white/40">
                {done}/{total}
                {milestone.eta ? ` · ${milestone.eta}` : ''}
              </span>
            </button>
          )
        })}

      {liveOpenMilestone && (
        <KanbanBoard
          milestone={liveOpenMilestone}
          onClose={() => setOpenMilestone(null)}
          onMoveTask={(taskId, status) => onMoveTask(liveOpenMilestone.id, taskId, status)}
          onSaveTask={(taskId, patch) => onSaveTask(liveOpenMilestone.id, taskId, patch)}
        />
      )}
    </div>
  )
}
