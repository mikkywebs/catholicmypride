-- 0039: the directory can list military ordinariates (Kenya, Uganda, South Africa). Safe to run more than once.
alter table public.dioceses drop constraint if exists dioceses_kind_check;
alter table public.dioceses add constraint dioceses_kind_check
  check (kind in ('Archdiocese', 'Diocese', 'Eparchy', 'Apostolic Vicariate', 'Prefecture', 'Military Ordinariate'));
notify pgrst, 'reload schema';
