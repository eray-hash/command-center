-- Ergänzt die aus Erays Excel-ToDo-Liste bekannten Felder "Start" (Datum) und
-- "Unter-Prio" (1-9, Reihenfolge innerhalb von A/B/C), die beim ersten Import fehlten.

alter table tasks
  add column if not exists start_datum date,
  add column if not exists unter_prio integer;
