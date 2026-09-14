-- Fundament Command Center: Grundschema
-- 2 Nutzer (Eray + Hassan Süslü), geteilter Zugriff auf alle Projekte.

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('kunde', 'eigen')),
  status text not null default 'geplant' check (status in ('geplant', 'in_arbeit', 'pausiert', 'abgeschlossen')),
  current_task text,
  claude_session_id text,
  include_in_dashboard boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  eta date,
  sort_order int not null default 0
);

alter table projects enable row level security;
alter table milestones enable row level security;

-- Nur die beiden angemeldeten Nutzer (Eray + Hassan) haben Zugriff; jeder authentifizierte
-- Nutzer darf lesen und schreiben, da es sich um ein geteiltes 2-Personen-Dashboard handelt.
create policy "authenticated read projects" on projects
  for select using (auth.role() = 'authenticated');
create policy "authenticated write projects" on projects
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated read milestones" on milestones
  for select using (auth.role() = 'authenticated');
create policy "authenticated write milestones" on milestones
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
