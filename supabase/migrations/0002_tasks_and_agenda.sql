-- Fundament Command Center: Einzelschritte pro Meilenstein + Sprach-Agenda

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references milestones(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  sort_order int not null default 0
);

create table if not exists agenda_items (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  project_id uuid references projects(id) on delete set null,
  status text not null default 'offen' check (status in ('offen', 'erledigt')),
  created_at timestamptz not null default now()
);

alter table tasks enable row level security;
alter table agenda_items enable row level security;

create policy "authenticated read tasks" on tasks
  for select using (auth.role() = 'authenticated');
create policy "authenticated write tasks" on tasks
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated read agenda_items" on agenda_items
  for select using (auth.role() = 'authenticated');
create policy "authenticated write agenda_items" on agenda_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
