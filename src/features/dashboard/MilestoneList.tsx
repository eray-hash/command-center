import { useState } from 'react'
import type { Milestone } from '../../types/project'

function Chevron({ open }: { open: boolean }) {
  return (
    <span className={`inline-block text-white/40 transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
  )
}

export function MilestoneList({ milestones }: { milestones: Milestone[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-1">
      {[...milestones]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((milestone) => {
          const isOpen = openId === milestone.id
          const doneTasks = milestone.tasks.filter((t) => t.done).length

          return (
            <div key={milestone.id} className="rounded-md">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : milestone.id)}
                className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-sm hover:bg-white/5"
              >
                <Chevron open={isOpen} />
                <span className={milestone.done ? 'text-white/40 line-through' : ''}>{milestone.title}</span>
                <span className="ml-auto shrink-0 text-xs text-white/40">
                  {doneTasks}/{milestone.tasks.length}
                  {milestone.eta ? ` · ${milestone.eta}` : ''}
                </span>
              </button>

              {isOpen && (
                <ul className="ml-6 flex flex-col gap-1 border-l border-white/10 py-1 pl-3">
                  {milestone.tasks.length === 0 && (
                    <li className="text-xs text-white/30">Noch keine Einzelschritte hinterlegt</li>
                  )}
                  {milestone.tasks.map((task) => (
                    <li key={task.id} className="flex items-center gap-2 text-xs">
                      <span>{task.done ? '✅' : '⬜️'}</span>
                      <span className={task.done ? 'text-white/40 line-through' : 'text-white/70'}>
                        {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
    </div>
  )
}
