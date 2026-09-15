export interface RecordingMeta {
  id: string
  createdAt: string
  durationSec: number
  transcript: string
  projectId: string | null
  assigned: boolean
}
