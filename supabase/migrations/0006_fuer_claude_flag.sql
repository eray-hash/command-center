-- Markierung "An Claude übergeben" auf Task-Ebene — ersetzt die separate
-- Agenda-Liste: Ideen werden jetzt direkt als Tasks angelegt, und ein Task
-- kann für die Bearbeitung mit Claude vorgemerkt werden.

alter table tasks add column if not exists fuer_claude boolean not null default false;
