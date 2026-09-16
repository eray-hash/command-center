import { useState } from 'react'
import { isSupabaseConfigured } from '../../lib/supabaseClient'
import { ProjectCard } from './ProjectCard'
import { useProjects } from '../../lib/useProjects'
import { useWorkspaces } from '../../lib/useWorkspaces'
import { WorkspaceTabs } from '../workspace/WorkspaceTabs'
import { VoiceQuery } from '../voice/VoiceQuery'
import { RecordingButton } from '../recording/RecordingButton'
import { AssignRecordingModal } from '../recording/AssignRecordingModal'
import { useRecordings } from '../../lib/useRecordings'
import { IdeaCaptureBar } from '../idea/IdeaCaptureBar'
import { ClaudeHandoffList } from '../claude/ClaudeHandoffList'
import { TodayPriorities } from '../today/TodayPriorities'

export function DashboardScreen() {
  const { projects, loading, moveTask, updateTask, createProject, logCallOnProject, createIdeaTask } = useProjects()
  const { workspaces, selectedId, setSelectedId, addWorkspace } = useWorkspaces()
  const recordings = useRecordings()
  const [toolsOpen, setToolsOpen] = useState<'voice' | 'record' | 'idea' | null>(null)

  const sharedWorkspaceId = workspaces.find((w) => w.kind === 'gemeinsam')?.id ?? selectedId

  const visibleProjects = projects
    .filter((p) => p.workspaceId === selectedId)
    .sort((a, b) => {
      const order = { hoch: 0, mittel: 1, niedrig: 2 }
      return order[a.prio] - order[b.prio]
    })

  const nextPendingRecording = recordings.pendingAssignment[0]

  async function handleAssignExisting(projectId: string | null) {
    if (!nextPendingRecording) return
    recordings.assignRecording(nextPendingRecording.id, projectId)
    if (projectId) {
      await logCallOnProject(
        projectId,
        nextPendingRecording.transcript,
        nextPendingRecording.durationSec,
        nextPendingRecording.createdAt,
      )
    }
  }

  async function handleAssignNew(name: string) {
    if (!nextPendingRecording) return
    const projectId = await createProject(name, sharedWorkspaceId)
    recordings.assignRecording(nextPendingRecording.id, projectId)
    await logCallOnProject(
      projectId,
      nextPendingRecording.transcript,
      nextPendingRecording.durationSec,
      nextPendingRecording.createdAt,
    )
    setSelectedId(sharedWorkspaceId) // neues Projekt landet im gemeinsamen Bereich — dorthin wechseln, damit man es sofort sieht
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-400">Fundament Command Center</h2>
        {!isSupabaseConfigured && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            Demo-Modus — keine Datenbank verbunden
          </span>
        )}
      </header>

      <TodayPriorities projects={projects} />

      {/* Schmale Werkzeugleiste: Sprachabfrage / Protokoll / Idee — bewusst klein, damit "Heute" der erste Blickfang bleibt */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setToolsOpen(toolsOpen === 'voice' ? null : 'voice')}
          className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium ${toolsOpen === 'voice' ? 'border-brand-violet bg-brand-violet/10 text-brand-violet' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}
        >
          🎙️ Frag das Dashboard
        </button>
        <button
          onClick={() => setToolsOpen(toolsOpen === 'record' ? null : 'record')}
          className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium ${toolsOpen === 'record' ? 'border-brand-teal bg-brand-teal/10 text-brand-teal' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}
        >
          📝 Protokollieren
        </button>
        <button
          onClick={() => setToolsOpen(toolsOpen === 'idea' ? null : 'idea')}
          className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium ${toolsOpen === 'idea' ? 'border-brand-violet bg-brand-violet/10 text-brand-violet' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}
        >
          💡 Neue Idee
        </button>
      </div>

      {toolsOpen === 'voice' && <VoiceQuery projects={projects} />}
      {toolsOpen === 'record' && (
        <RecordingButton onSaved={(transcript, durationSec) => recordings.addRecording(transcript, durationSec)} />
      )}
      {toolsOpen === 'idea' && (
        <IdeaCaptureBar onSubmit={(text) => createIdeaTask(text, null, sharedWorkspaceId)} />
      )}

      <ClaudeHandoffList
        projects={projects}
        onUnflag={(projectId, milestoneId, taskId) =>
          updateTask(projectId, milestoneId, taskId, { fuerClaude: false })
        }
      />

      <h2 className="mb-2 mt-6 text-sm font-semibold text-gray-500">Projektübersicht</h2>

      <WorkspaceTabs
        workspaces={workspaces}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={addWorkspace}
      />

      {loading ? (
        <p className="text-gray-500">Lade Projekte…</p>
      ) : visibleProjects.length === 0 ? (
        <p className="text-gray-400">Noch keine Projekte in diesem Bereich.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onAddIdea={(text, projectId) => createIdeaTask(text, projectId, sharedWorkspaceId)}
              onMoveTask={moveTask}
              onSaveTask={updateTask}
            />
          ))}
        </div>
      )}

      {nextPendingRecording && (
        <AssignRecordingModal
          recording={nextPendingRecording}
          projects={projects}
          onAssignExisting={handleAssignExisting}
          onAssignNew={handleAssignNew}
          onDiscard={() => recordings.removeRecording(nextPendingRecording.id)}
        />
      )}
    </div>
  )
}
