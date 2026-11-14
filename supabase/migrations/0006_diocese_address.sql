-- Catholic My Pride: optional addresses and map links for dioceses; parish address optional.
-- Safe to run more than once.
alter table public.dioceses add column if not exists address text;
alter table public.dioceses add column if not exists map_url text;
alter table public.churches alter column address drop not null;
notify pgrst, 'reload schema';
