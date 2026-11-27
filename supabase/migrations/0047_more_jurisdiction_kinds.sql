-- 0047: the kinds of jurisdiction Europe needs: a patriarchate (Venice), territorial abbeys and prelatures
-- (Montecassino, Pompeii, Loreto), an apostolic exarchate, and a personal ordinariate. Includes 0046. Safe to run more than once.
alter table public.dioceses drop constraint if exists dioceses_kind_check;
alter table public.dioceses add constraint dioceses_kind_check
  check (kind in ('Archdiocese', 'Diocese', 'Patriarchate', 'Eparchy', 'Apostolic Vicariate', 'Apostolic Exarchate', 'Prefecture',
                  'Territorial Abbey', 'Territorial Prelature', 'Military Ordinariate', 'Personal Ordinariate'));
