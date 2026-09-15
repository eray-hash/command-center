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

export function DashboardScreen() {
  const { projects, loading, moveTask, updateTask, createProject, logCallOnProject, createIdeaTask } = useProjects()
  const { workspaces, selectedId, setSelectedId, addWorkspace } = useWorkspaces()
  const recordings = useRecordings()

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
        <h1 className="text-xl font-bold">Fundament Command Center</h1>
        {!isSupabaseConfigured && (
          <span className="rounded-full bg-amber-600/20 px-3 py-1 text-xs font-medium text-amber-400">
            Demo-Modus — keine Datenbank verbunden
          </span>
        )}
      </header>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <VoiceQuery projects={projects} />
        <RecordingButton onSaved={(transcript, durationSec) => recordings.addRecording(transcript, durationSec)} />
      </div>

      <WorkspaceTabs
        workspaces={workspaces}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={addWorkspace}
      />

      <ClaudeHandoffList
        projects={projects}
        onUnflag={(projectId, milestoneId, taskId) =>
          updateTask(projectId, milestoneId, taskId, { fuerClaude: false })
        }
      />

      <IdeaCaptureBar onSubmit={(text) => createIdeaTask(text, null, sharedWorkspaceId)} />

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
