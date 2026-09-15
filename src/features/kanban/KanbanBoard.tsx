import { useState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import type { Milestone, Task, TaskStatus } from '../../types/project'
import { TASK_STATUS_ORDER } from '../../types/project'
import { KanbanColumn } from './KanbanColumn'
import { TaskDetailModal } from './TaskDetailModal'

export function KanbanBoard({
  milestone,
  onClose,
  onMoveTask,
  onSaveTask,
}: {
  milestone: Milestone
  onClose: () => void
  onMoveTask: (taskId: string, status: TaskStatus) => void
  onSaveTask: (taskId: string, patch: Partial<Task>) => void
}) {
  const [openTask, setOpenTask] = useState<Task | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const newStatus = over.id as TaskStatus
    if (TASK_STATUS_ORDER.includes(newStatus)) {
      onMoveTask(String(active.id), newStatus)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#0F0F14]">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <button onClick={onClose} className="text-white/50 hover:text-white">
          ← Zurück
        </button>
        <h2 className="font-semibold">{milestone.title}</h2>
      </header>

      <div className="flex-1 overflow-x-auto p-4 sm:p-6">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-3">
            {TASK_STATUS_ORDER.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={milestone.tasks.filter((t) => t.status === status)}
                onOpenTask={setOpenTask}
              />
            ))}
          </div>
        </DndContext>
      </div>

      {openTask && (
        <TaskDetailModal
          task={openTask}
          onClose={() => setOpenTask(null)}
          onSave={(patch) => onSaveTask(openTask.id, patch)}
        />
      )}
    </div>
  )
}
