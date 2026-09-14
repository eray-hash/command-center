import type { Project, Task } from '../types/project'

function tasks(entries: Array<[string, boolean]>): Task[] {
  return entries.map(([title, done], i) => ({ id: `t${i}`, title, done }))
}

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
      {
        id: 'm1',
        title: 'CRM-Mockup live',
        done: true,
        eta: null,
        sortOrder: 1,
        tasks: tasks([
          ['Klickbares Mockup gebaut', true],
          ['Auf GitHub Pages veröffentlicht', true],
        ]),
      },
      {
        id: 'm2',
        title: 'Immobilienradar mit Exposé-Export',
        done: false,
        eta: '2026-10-01',
        sortOrder: 2,
        tasks: tasks([
          ['Datenquelle anbinden', true],
          ['Exposé-PDF-Export', false],
          ['Filter- und Suchlogik', false],
        ]),
      },
      {
        id: 'm3',
        title: 'Buchhaltungssoftware (Kontoauszug-Scan)',
        done: false,
        eta: null,
        sortOrder: 3,
        tasks: tasks([
          ['Kontoauszug-Scan → Texterkennung', false],
          ['Pivot-Tabellen-Export', false],
        ]),
      },
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
      {
        id: 'm1',
        title: 'F-Monogramm finalisiert',
        done: true,
        eta: null,
        sortOrder: 1,
        tasks: tasks([
          ['Logo-Konzept abgestimmt', true],
          ['Vektorisiert (SVG)', true],
          ['Negativ- und Einfarbig-Variante', true],
        ]),
      },
      {
        id: 'm2',
        title: 'DPMA-Markencheck',
        done: true,
        eta: null,
        sortOrder: 2,
        tasks: tasks([['Markenrecherche durchgeführt', true]]),
      },
    ],
  },
  {
    id: 'command-center',
    name: 'Fundament Command Center',
    kind: 'eigen',
    status: 'in_arbeit',
    currentTask: 'Aufklappbare Meilensteine + Sprach-Agenda',
    includeInDashboard: true,
    milestones: [
      {
        id: 'm1',
        title: 'Datenmodell + Auth (2 Nutzer)',
        done: false,
        eta: null,
        sortOrder: 1,
        tasks: tasks([
          ['Supabase-Schema geschrieben', true],
          ['PWA-Grundgerüst installierbar', true],
          ['Login-Screen gebaut', true],
          ['Supabase-Account verbinden (wartet auf neue E-Mail)', false],
          ['Schema live anwenden', false],
          ['Echtzeit-Sync verdrahten', false],
        ]),
      },
      {
        id: 'm2',
        title: 'Echtzeit-Projektübersicht',
        done: false,
        eta: null,
        sortOrder: 2,
        tasks: tasks([
          ['Aufklappbare Meilensteine mit Task-Details', true],
          ['Live-Abgleich zwischen zwei Geräten', false],
        ]),
      },
      {
        id: 'm3',
        title: 'Sprachsteuerung',
        done: false,
        eta: null,
        sortOrder: 3,
        tasks: tasks([
          ['Web-Speech-API-Hook', true],
          ['Sprach-Agenda: Idee per Sprache aufnehmen', true],
          ['Fragen ans Dashboard stellen (Voice-Query)', false],
        ]),
      },
      {
        id: 'm4',
        title: 'Meeting-Mitschnitt + Protokoll',
        done: false,
        eta: null,
        sortOrder: 4,
        tasks: tasks([
          ['Consent-Abfrage zu Gesprächsbeginn', false],
          ['Aufnahme + Transkription', false],
          ['Automatische Protokollablage', false],
        ]),
      },
      {
        id: 'm5',
        title: 'Automatische Claude-Session-Anbindung',
        done: false,
        eta: null,
        sortOrder: 5,
        tasks: tasks([
          ['Opt-in/Opt-out pro Session', false],
          ['Sync-Job Claude-Sessions → Supabase', false],
        ]),
      },
    ],
  },
]
