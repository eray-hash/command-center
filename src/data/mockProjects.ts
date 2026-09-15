import type { Project, Task, TaskStatus, Priority } from '../types/project'

let taskCounter = 0

function task(
  title: string,
  status: TaskStatus,
  extra: Partial<Omit<Task, 'id' | 'title' | 'status'>> = {},
): Task {
  taskCounter += 1
  return {
    id: `t${taskCounter}`,
    title,
    status,
    prio: extra.prio ?? 'mittel',
    kunde: extra.kunde ?? null,
    abteilung: extra.abteilung ?? null,
    zustaendig: extra.zustaendig ?? null,
    naechsterSchritt: extra.naechsterSchritt ?? null,
    fragen: extra.fragen ?? null,
    benoetigteInfos: extra.benoetigteInfos ?? null,
    geplanteZeitStunden: extra.geplanteZeitStunden ?? null,
    istZeitStunden: extra.istZeitStunden ?? null,
    umsatzEuro: extra.umsatzEuro ?? null,
    wiedervorlage: extra.wiedervorlage ?? null,
    erledigtAm: extra.erledigtAm ?? null,
    protokoll: extra.protokoll ?? null,
    taskvorschlaege: extra.taskvorschlaege ?? null,
  }
}

const hoch: Priority = 'hoch'
const mittel: Priority = 'mittel'

// Demo-Daten für den Fall, dass keine Supabase-Verbindung konfiguriert ist.
export const mockProjects: Project[] = [
  {
    id: 'mayer-holding-crm',
    workspaceId: 'gemeinsam',
    name: 'Mayer Holding CRM',
    kind: 'kunde',
    status: 'in_arbeit',
    prio: hoch,
    currentTask: 'Immobilienradar-Integration',
    includeInDashboard: true,
    milestones: [
      {
        id: 'm1',
        title: 'CRM-Mockup live',
        eta: null,
        sortOrder: 1,
        tasks: [
          task('Klickbares Mockup gebaut', 'erledigt', { zustaendig: 'Eray', erledigtAm: '2026-09-05' }),
          task('Auf GitHub Pages veröffentlicht', 'erledigt', { zustaendig: 'Eray', erledigtAm: '2026-09-05' }),
        ],
      },
      {
        id: 'm2',
        title: 'Immobilienradar mit Exposé-Export',
        eta: '2026-10-01',
        sortOrder: 2,
        tasks: [
          task('Datenquelle anbinden', 'erledigt', { zustaendig: 'Eray', erledigtAm: '2026-09-10' }),
          task('Exposé-PDF-Export', 'in_arbeit', {
            zustaendig: 'Eray',
            prio: hoch,
            geplanteZeitStunden: 8,
            istZeitStunden: 3,
          }),
          task('Filter- und Suchlogik', 'offen', { prio: mittel, geplanteZeitStunden: 6 }),
        ],
      },
      {
        id: 'm3',
        title: 'Buchhaltungssoftware (Kontoauszug-Scan)',
        eta: null,
        sortOrder: 3,
        tasks: [
          task('Kontoauszug-Scan → Texterkennung', 'offen', {
            fragen: 'Welches Bankformat liefert der Kunde (CSV/PDF/CAMT)?',
          }),
          task('Pivot-Tabellen-Export', 'offen'),
        ],
      },
    ],
  },
  {
    id: 'fundament-branding',
    workspaceId: 'gemeinsam',
    name: 'Fundament IT Branding',
    kind: 'eigen',
    status: 'pausiert',
    prio: 'niedrig',
    currentTask: null,
    includeInDashboard: true,
    milestones: [
      {
        id: 'm1',
        title: 'F-Monogramm finalisiert',
        eta: null,
        sortOrder: 1,
        tasks: [
          task('Logo-Konzept abgestimmt', 'erledigt', { zustaendig: 'Eray' }),
          task('Vektorisiert (SVG)', 'erledigt', { zustaendig: 'Eray' }),
          task('Negativ- und Einfarbig-Variante', 'erledigt', { zustaendig: 'Eray' }),
        ],
      },
      {
        id: 'm2',
        title: 'DPMA-Markencheck',
        eta: null,
        sortOrder: 2,
        tasks: [task('Markenrecherche durchgeführt', 'erledigt', { zustaendig: 'Eray' })],
      },
    ],
  },
  {
    id: 'command-center',
    workspaceId: 'gemeinsam',
    name: 'Fundament Command Center',
    kind: 'eigen',
    status: 'in_arbeit',
    prio: hoch,
    currentTask: 'Kanban-Umbau + Bereiche + CRM-Felder',
    includeInDashboard: true,
    milestones: [
      {
        id: 'm1',
        title: 'Datenmodell + Auth (2 Nutzer)',
        eta: null,
        sortOrder: 1,
        tasks: [
          task('Supabase-Schema geschrieben', 'erledigt', { zustaendig: 'Eray' }),
          task('PWA-Grundgerüst installierbar', 'erledigt', { zustaendig: 'Eray' }),
          task('Login-Screen gebaut', 'erledigt', { zustaendig: 'Eray' }),
          task('Supabase-Account verbinden', 'rueckfrage', {
            fragen: 'Wartet auf neue geschäftliche E-Mail-Adresse',
            wiedervorlage: '2026-09-20',
          }),
          task('Schema live anwenden', 'offen'),
          task('Echtzeit-Sync verdrahten', 'offen'),
        ],
      },
      {
        id: 'm2',
        title: 'Echtzeit-Projektübersicht',
        eta: null,
        sortOrder: 2,
        tasks: [
          task('Aufklappbare Meilensteine mit Task-Details', 'erledigt', { zustaendig: 'Eray' }),
          task('Live-Abgleich zwischen zwei Geräten', 'offen'),
        ],
      },
      {
        id: 'm3',
        title: 'Sprachsteuerung & Agenda',
        eta: null,
        sortOrder: 3,
        tasks: [
          task('Web-Speech-API-Hook', 'erledigt', { zustaendig: 'Eray' }),
          task('Sprach-Agenda: Idee per Sprache aufnehmen', 'erledigt', { zustaendig: 'Eray' }),
          task('Fragen ans Dashboard stellen (Voice-Query)', 'offen'),
        ],
      },
      {
        id: 'm4',
        title: 'Trello-artiges Kanban + CRM-Felder',
        eta: null,
        sortOrder: 4,
        tasks: [
          task('Datenmodell um CRM-Felder erweitert', 'in_arbeit', { zustaendig: 'Claude' }),
          task('Kanban-Board mit Drag & Drop', 'in_arbeit', { zustaendig: 'Claude' }),
          task('Bereiche (gemeinsam/privat/custom)', 'offen'),
          task('Clustering nach Mitarbeiter/Kostenstelle', 'offen'),
          task('PDF-Export One-Pager', 'offen'),
        ],
      },
      {
        id: 'm5',
        title: 'Meeting-Mitschnitt + Protokoll',
        eta: null,
        sortOrder: 5,
        tasks: [
          task('Manueller Aufnahme-Button', 'offen'),
          task('Consent-Hinweis beim Start', 'offen'),
          task('Zuordnungs-Popup beim nächsten App-Start', 'offen'),
        ],
      },
      {
        id: 'm6',
        title: 'White-Label (Weiterverkauf)',
        eta: null,
        sortOrder: 6,
        tasks: [task('Mandantenfähigkeit (Multi-Tenant) planen', 'offen')],
      },
    ],
  },
]
