export type ProjectKind = 'kunde' | 'eigen'
export type ProjectStatus = 'geplant' | 'in_arbeit' | 'pausiert' | 'abgeschlossen'
export type Priority = 'niedrig' | 'mittel' | 'hoch'
export type TaskStatus = 'offen' | 'in_arbeit' | 'rueckfrage' | 'erledigt'

export const TASK_STATUS_ORDER: TaskStatus[] = ['offen', 'in_arbeit', 'rueckfrage', 'erledigt']

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  offen: 'Offen',
  in_arbeit: 'In Arbeit',
  rueckfrage: 'Rückfrage',
  erledigt: 'Erledigt',
}

export interface Task {
  id: string
  title: string
  status: TaskStatus
  prio: Priority
  unterPrio: number | null
  startDatum: string | null
  kunde: string | null
  abteilung: string | null
  zustaendig: string | null
  naechsterSchritt: string | null
  fragen: string | null
  benoetigteInfos: string | null
  geplanteZeitStunden: number | null
  istZeitStunden: number | null
  umsatzEuro: number | null
  wiedervorlage: string | null
  erledigtAm: string | null
  protokoll: string | null
  taskvorschlaege: string | null
  fuerClaude: boolean
}

export interface Milestone {
  id: string
  title: string
  eta: string | null
  sortOrder: number
  tasks: Task[]
}

export interface Project {
  id: string
  workspaceId: string
  name: string
  kind: ProjectKind
  status: ProjectStatus
  prio: Priority
  currentTask: string | null
  includeInDashboard: boolean
  milestones: Milestone[]
}
