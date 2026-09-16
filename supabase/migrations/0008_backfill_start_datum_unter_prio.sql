-- Nachpflege der beim ersten Excel-Import fehlenden Felder (Start-Datum, Unter-Prio) für
-- bereits angelegte Tasks, sowie ein zuvor übersehener Task (Immo-Radar-Whitelabel-Exposé).

update tasks set start_datum = '2026-08-12' where id = '68800cc7-a308-410d-a694-857ee5c5ddf7';
update tasks set start_datum = '2026-08-24' where id = 'fc956e39-1fda-4d94-b406-80be77b6bc8c';
update tasks set start_datum = '2026-08-24', unter_prio = 3 where id = 'c5a1a07c-1aeb-4cee-b4a5-43351b2712fd';
update tasks set start_datum = '2026-08-24' where id = '82f1a778-47d7-408e-a526-eddb466fd66e';
update tasks set start_datum = '2026-08-24', unter_prio = 4 where id = '2e86f27e-4c32-4d12-aa24-8fa901fcf7f2';
update tasks set start_datum = '2026-08-28' where id = '72804d7b-aec7-450b-882b-8fe4638a133d';
update tasks set start_datum = '2026-08-28' where id = '0fc14973-4d4a-4cdb-9c93-5138239064e3';
update tasks set start_datum = '2026-08-29' where id = '1775e469-0795-4cd0-8687-64995ba74905';
update tasks set start_datum = '2026-08-30', unter_prio = 2 where id = '5392647d-4f78-4fea-915b-28722b410a89';
update tasks set start_datum = '2026-08-31', unter_prio = 3 where id = 'c55147dd-7d74-4ff0-aed7-cf5533968509';
update tasks set start_datum = '2026-08-28' where id = '20fa3b82-40f7-4d60-a0b8-6f2cc2a33441';
update tasks set start_datum = '2026-09-03' where id = '334b49d7-6cae-4f0a-ac91-e59b7dc97152';
update tasks set start_datum = '2026-09-04' where id = '13e677a5-4167-4e8d-9b97-cdd8bcb3fb9d';
update tasks set unter_prio = 2 where id = 'f93fbb19-d704-48a6-a5d4-9781a239e71f';
update tasks set start_datum = '2026-09-02', unter_prio = 5 where id = '5d518f4a-f5a7-4c96-92d9-c6d7cdb09f99';
update tasks set start_datum = '2026-08-28', unter_prio = 1 where id = '02f41d5d-4b43-4d81-aa21-9d216e582d66';

insert into tasks (id, milestone_id, title, status, prio, start_datum, naechster_schritt)
values (
  gen_random_uuid(),
  '06ea64a1-6d31-40ab-9904-0eca1f3219ed',
  'Immo Radar — Whitelabel-Exposé (1-Seiten-Muster)',
  'in_arbeit',
  'mittel',
  '2026-08-18',
  '06.09: Muster erstellt, 1-Seiten-Exposé soll automatisch als Whitelabel erstellt werden'
);
