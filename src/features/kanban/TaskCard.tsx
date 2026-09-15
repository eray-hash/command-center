import { useDraggable } from '@dnd-kit/core'
import type { Task } from '../../types/project'

const prioColor: Record<Task['prio'], string> = {
  niedrig: 'bg-zinc-600',
  mittel: 'bg-amber-600',
  hoch: 'bg-red-600',
}

export function TaskCard({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onOpen}
      className={`cursor-grab rounded-lg border border-white/10 bg-white/5 p-2.5 text-sm active:cursor-grabbing ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="leading-snug">{task.title}</p>
        <span className={`h-2 w-2 shrink-0 rounded-full ${prioColor[task.prio]}`} title={`Prio: ${task.prio}`} />
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-white/40">
        {task.zustaendig && (
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-white/60">{task.zustaendig}</span>
        )}
        {task.wiedervorlage && <span>📅 {task.wiedervorlage}</span>}
        {task.fragen && <span title={task.fragen}>❓</span>}
        {task.umsatzEuro != null && <span>{task.umsatzEuro.toLocaleString('de-DE')} €</span>}
      </div>
    </div>
  )
}
