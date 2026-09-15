-- Gesprächsprotokoll (Text-Mitschrift) + Platz für spätere Taskvorschläge pro Task.
-- Ersetzt die Idee, rohe Audiodateien zu speichern: nur die Mitschrift wird abgelegt.

alter table tasks
  add column if not exists protokoll text,
  add column if not exists taskvorschlaege text;
