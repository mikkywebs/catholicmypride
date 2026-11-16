-- Catholic My Pride: allow Eastern Catholic eparchies (e.g. the Maronite Eparchy at Ibadan) in the directory.
-- Safe to run more than once.
alter table public.dioceses drop constraint if exists dioceses_kind_check;
alter table public.dioceses add constraint dioceses_kind_check
  check (kind in ('Archdiocese', 'Diocese', 'Eparchy', 'Apostolic Vicariate', 'Prefecture'));
notify pgrst, 'reload schema';
