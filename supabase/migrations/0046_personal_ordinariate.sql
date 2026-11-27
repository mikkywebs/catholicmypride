-- 0046: a Personal Ordinariate can be listed as a jurisdiction (for example Our Lady of Walsingham,
-- for England, Wales and Scotland). Safe to run more than once.
alter table public.dioceses drop constraint if exists dioceses_kind_check;
alter table public.dioceses add constraint dioceses_kind_check
  check (kind in ('Archdiocese', 'Diocese', 'Eparchy', 'Apostolic Vicariate', 'Prefecture', 'Military Ordinariate', 'Personal Ordinariate'));
