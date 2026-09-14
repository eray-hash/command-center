import type { Project } from '../types/project'

// Demo-Daten für den Fall, dass keine Supabase-Verbindung konfiguriert ist.
export const mockProjects: Project[] = [
  {
    id: 'mayer-holding-crm',
    name: 'Mayer Holding CRM',
    kind: 'kunde',
    status: 'in_arbeit',
    currentTask: 'Immobilienradar-Integration',
    includeInDashboard: true,
    milestones: [
      { id: 'm1', title: 'CRM-Mockup live', done: true, eta: null, sortOrder: 1 },
      { id: 'm2', title: 'Immobilienradar mit Exposé-Export', done: false, eta: '2026-10-01', sortOrder: 2 },
      { id: 'm3', title: 'Buchhaltungssoftware (Kontoauszug-Scan)', done: false, eta: null, sortOrder: 3 },
    ],
  },
  {
    id: 'fundament-branding',
    name: 'Fundament IT Branding',
    kind: 'eigen',
    status: 'pausiert',
    currentTask: null,
    includeInDashboard: true,
    milestones: [
      { id: 'm1', title: 'F-Monogramm finalisiert', done: true, eta: null, sortOrder: 1 },
      { id: 'm2', title: 'DPMA-Markencheck', done: true, eta: null, sortOrder: 2 },
    ],
  },
  {
    id: 'command-center',
    name: 'Fundament Command Center',
    kind: 'eigen',
    status: 'in_arbeit',
    currentTask: 'PWA-Grundgerüst + Datenmodell',
    includeInDashboard: true,
    milestones: [
      { id: 'm1', title: 'Datenmodell + Auth (2 Nutzer)', done: false, eta: null, sortOrder: 1 },
      { id: 'm2', title: 'Echtzeit-Projektübersicht', done: false, eta: null, sortOrder: 2 },
      { id: 'm3', title: 'Sprachsteuerung', done: false, eta: null, sortOrder: 3 },
      { id: 'm4', title: 'Meeting-Mitschnitt + Protokoll', done: false, eta: null, sortOrder: 4 },
      { id: 'm5', title: 'Automatische Claude-Session-Anbindung', done: false, eta: null, sortOrder: 5 },
    ],
  },
]
