-- Schließt die zuvor bekannte Sicherheitslücke: "privat"-Bereiche waren technisch für
-- jeden authentifizierten Nutzer lesbar. Ab hier gilt: ein "privat"-Workspace ist nur für
-- seinen owner_id sichtbar, "gemeinsam"/"custom"-Bereiche bleiben für alle authentifizierten
-- Nutzer sichtbar (laut Vorgabe: beide dürfen neue Bereiche anlegen und gemeinsam nutzen).

-- workspaces --------------------------------------------------------------

drop policy if exists "authenticated read workspaces" on workspaces;
drop policy if exists "authenticated write workspaces" on workspaces;

create policy "read own or shared workspaces" on workspaces
  for select using (kind <> 'privat' or owner_id = auth.uid());

create policy "insert workspaces" on workspaces
  for insert with check (auth.role() = 'authenticated');

create policy "modify own or shared workspaces" on workspaces
  for update using (kind <> 'privat' or owner_id = auth.uid())
  with check (kind <> 'privat' or owner_id = auth.uid());

create policy "delete own or shared workspaces" on workspaces
  for delete using (kind <> 'privat' or owner_id = auth.uid());

-- projects ------------------------------------------------------------------

drop policy if exists "authenticated read projects" on projects;
drop policy if exists "authenticated write projects" on projects;

create policy "read projects in visible workspaces" on projects
  for select using (
    workspace_id is null
    or exists (
      select 1 from workspaces w
      where w.id = projects.workspace_id
        and (w.kind <> 'privat' or w.owner_id = auth.uid())
    )
  );

create policy "modify projects in visible workspaces" on projects
  for all using (
    workspace_id is null
    or exists (
      select 1 from workspaces w
      where w.id = projects.workspace_id
        and (w.kind <> 'privat' or w.owner_id = auth.uid())
    )
  )
  with check (
    workspace_id is null
    or exists (
      select 1 from workspaces w
      where w.id = projects.workspace_id
        and (w.kind <> 'privat' or w.owner_id = auth.uid())
    )
  );

-- milestones (erben die Sichtbarkeit ihres Projekts) -------------------------

drop policy if exists "authenticated read milestones" on milestones;
drop policy if exists "authenticated write milestones" on milestones;

create policy "read milestones of visible projects" on milestones
  for select using (
    exists (
      select 1 from projects p
      left join workspaces w on w.id = p.workspace_id
      where p.id = milestones.project_id
        and (p.workspace_id is null or w.kind <> 'privat' or w.owner_id = auth.uid())
    )
  );

create policy "modify milestones of visible projects" on milestones
  for all using (
    exists (
      select 1 from projects p
      left join workspaces w on w.id = p.workspace_id
      where p.id = milestones.project_id
        and (p.workspace_id is null or w.kind <> 'privat' or w.owner_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from projects p
      left join workspaces w on w.id = p.workspace_id
      where p.id = milestones.project_id
        and (p.workspace_id is null or w.kind <> 'privat' or w.owner_id = auth.uid())
    )
  );

-- tasks (erben die Sichtbarkeit über milestone -> project) -------------------

drop policy if exists "authenticated read tasks" on tasks;
drop policy if exists "authenticated write tasks" on tasks;

create policy "read tasks of visible projects" on tasks
  for select using (
    exists (
      select 1 from milestones m
      join projects p on p.id = m.project_id
      left join workspaces w on w.id = p.workspace_id
      where m.id = tasks.milestone_id
        and (p.workspace_id is null or w.kind <> 'privat' or w.owner_id = auth.uid())
    )
  );

create policy "modify tasks of visible projects" on tasks
  for all using (
    exists (
      select 1 from milestones m
      join projects p on p.id = m.project_id
      left join workspaces w on w.id = p.workspace_id
      where m.id = tasks.milestone_id
        and (p.workspace_id is null or w.kind <> 'privat' or w.owner_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from milestones m
      join projects p on p.id = m.project_id
      left join workspaces w on w.id = p.workspace_id
      where m.id = tasks.milestone_id
        and (p.workspace_id is null or w.kind <> 'privat' or w.owner_id = auth.uid())
    )
  );

-- agenda_items (global, wenn project_id null; sonst Sichtbarkeit des Projekts) ----

drop policy if exists "authenticated read agenda_items" on agenda_items;
drop policy if exists "authenticated write agenda_items" on agenda_items;

create policy "read agenda items" on agenda_items
  for select using (
    project_id is null
    or exists (
      select 1 from projects p
      left join workspaces w on w.id = p.workspace_id
      where p.id = agenda_items.project_id
        and (p.workspace_id is null or w.kind <> 'privat' or w.owner_id = auth.uid())
    )
  );

create policy "modify agenda items" on agenda_items
  for all using (
    project_id is null
    or exists (
      select 1 from projects p
      left join workspaces w on w.id = p.workspace_id
      where p.id = agenda_items.project_id
        and (p.workspace_id is null or w.kind <> 'privat' or w.owner_id = auth.uid())
    )
  )
  with check (
    project_id is null
    or exists (
      select 1 from projects p
      left join workspaces w on w.id = p.workspace_id
      where p.id = agenda_items.project_id
        and (p.workspace_id is null or w.kind <> 'privat' or w.owner_id = auth.uid())
    )
  );
