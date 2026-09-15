export type WorkspaceKind = 'gemeinsam' | 'privat' | 'custom'

export interface Workspace {
  id: string
  name: string
  kind: WorkspaceKind
  ownerId: string | null // nur bei kind === 'privat' gesetzt
}
