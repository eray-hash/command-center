export interface AgendaItem {
  id: string
  text: string
  projectId: string | null
  status: 'offen' | 'erledigt'
  createdAt: string
}
