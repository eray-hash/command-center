-- Fundament Command Center: Bereiche (Workspaces) + CRM-Felder pro Task + Prio pro Projekt

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('gemeinsam', 'privat', 'custom')),
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table projects
  add column if not exists workspace_id uuid references workspaces(id) on delete set null,
  add column if not exists prio text not null default 'mittel' check (prio in ('niedrig', 'mittel', 'hoch'));

-- "done" auf Milestones entfällt (ergibt sich aus dem Status der zugehörigen Tasks)
alter table milestones drop column if exists done;

alter table tasks
  drop column if exists done,
  add column if not exists status text not null default 'offen' check (status in ('offen', 'in_arbeit', 'rueckfrage', 'erledigt')),
  add column if not exists prio text not null default 'mittel' check (prio in ('niedrig', 'mittel', 'hoch')),
  add column if not exists kunde text,
  add column if not exists abteilung text,
  add column if not exists zustaendig text,
  add column if not exists naechster_schritt text,
  add column if not exists fragen text,
  add column if not exists benoetigte_infos text,
  add column if not exists geplante_zeit_stunden numeric,
  add column if not exists ist_zeit_stunden numeric,
  add column if not exists umsatz_euro numeric,
  add column if not exists wiedervorlage date,
  add column if not exists erledigt_am date;

alter table workspaces enable row level security;

create policy "authenticated read workspaces" on workspaces
  for select using (auth.role() = 'authenticated');
create policy "authenticated write workspaces" on workspaces
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Hinweis: "privat"-Workspaces werden aktuell noch nicht per RLS voneinander abgeschottet
-- (beide Nutzer sind "authenticated" und sehen technisch alles). Echte Trennung privat/
-- gemeinsam braucht eine RLS-Policy auf owner_id, sobald Supabase live ist.
