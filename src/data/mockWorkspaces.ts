import type { Workspace } from '../types/workspace'

export const defaultWorkspaces: Workspace[] = [
  { id: 'gemeinsam', name: 'Gemeinsam', kind: 'gemeinsam', ownerId: null },
  { id: 'privat-eray', name: 'Eray – privat', kind: 'privat', ownerId: 'eray' },
  { id: 'privat-hassan', name: 'Hassan – privat', kind: 'privat', ownerId: 'hassan' },
]
