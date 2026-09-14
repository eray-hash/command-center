import { useState } from 'react'
import type { Project } from '../../types/project'
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

export function ProjectCard({
  project,
  onAddAgendaItem,
}: {
  project: Project
  onAddAgendaItem: (text: string, projectId: string) => void
}) {
  const [showCapture, setShowCapture] = useState(false)

  const allTasks = project.milestones.flatMap((m) => m.tasks)
  const doneCount = allTasks.filter((t) => t.done).length
  const total = allTasks.length

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold leading-tight">{project.name}</h3>
          <span className="text-xs text-white/50">{project.kind === 'kunde' ? 'Kundenprojekt' : 'Eigenes Projekt'}</span>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-white ${statusColor[project.status]}`}>
          {statusLabel[project.status]}
        </span>
      </div>

      {project.currentTask && (
        <p className="text-sm text-white/70">
          <span className="text-white/40">Gerade dran: </span>
          {project.currentTask}
        </p>
      )}

      <div>
        <div className="h-1.5 w-full rounded-full bg-white/10">
          <div
            className="h-1.5 rounded-full bg-brand-violet"
            style={{ width: total ? `${(doneCount / total) * 100}%` : '0%' }}
          />
        </div>
        <div className="mt-1 text-xs text-white/50">{doneCount}/{total} Einzelschritte erledigt</div>
      </div>

      <MilestoneList milestones={project.milestones} />

      <div className="border-t border-white/10 pt-2">
        {showCapture ? (
          <VoiceCaptureField
            placeholder="Was soll noch mit rein?"
            onSubmit={(text) => {
              onAddAgendaItem(text, project.id)
              setShowCapture(false)
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowCapture(true)}
            className="text-xs text-white/40 hover:text-brand-teal"
          >
            + Agenda-Punkt für dieses Projekt
          </button>
        )}
      </div>
    </div>
  )
}
