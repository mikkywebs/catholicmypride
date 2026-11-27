-- 0048: two more kinds of jurisdiction for Eastern Europe: an exarchate (the archiepiscopal exarchates
-- of the Ukrainian Greek Catholic Church) and an apostolic administration (Southern Albania, Belarus).
-- Includes 0046 and 0047. Safe to run more than once.
alter table public.dioceses drop constraint if exists dioceses_kind_check;
alter table public.dioceses add constraint dioceses_kind_check
  check (kind in ('Archdiocese', 'Diocese', 'Patriarchate', 'Eparchy', 'Apostolic Vicariate', 'Apostolic Exarchate', 'Exarchate',
                  'Apostolic Administration', 'Prefecture', 'Territorial Abbey', 'Territorial Prelature', 'Military Ordinariate', 'Personal Ordinariate'));
