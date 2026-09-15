import { useDroppable } from '@dnd-kit/core'
import type { Task, TaskStatus } from '../../types/project'
import { TASK_STATUS_LABEL } from '../../types/project'
import { TaskCard } from './TaskCard'

export function KanbanColumn({
  status,
  tasks,
  onOpenTask,
}: {
  status: TaskStatus
  tasks: Task[]
  onOpenTask: (task: Task) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-[220px] flex-1 flex-col gap-2 rounded-lg border p-2 transition ${
        isOver ? 'border-brand-teal bg-brand-teal/5' : 'border-white/10 bg-black/20'
      }`}
    >
      <div className="flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-wide text-white/40">
        <span>{TASK_STATUS_LABEL[status]}</span>
        <span>{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onOpen={() => onOpenTask(task)} />
        ))}
        {tasks.length === 0 && <p className="px-1 text-xs text-white/20">—</p>}
      </div>
    </div>
  )
}
