export type ProjectKind = 'kunde' | 'eigen'
export type ProjectStatus = 'geplant' | 'in_arbeit' | 'pausiert' | 'abgeschlossen'

export interface Milestone {
  id: string
  title: string
  done: boolean
  eta: string | null
  sortOrder: number
}

export interface Project {
  id: string
  name: string
  kind: ProjectKind
  status: ProjectStatus
  currentTask: string | null
  includeInDashboard: boolean
  milestones: Milestone[]
}
