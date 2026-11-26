-- 0042: a cathedral photo for each archdiocese/diocese, and a church photo for each parish. Safe to run more than once.
alter table public.dioceses add column if not exists featured_image text;
alter table public.dioceses add column if not exists image_alt text;
alter table public.dioceses add column if not exists cathedral text;
alter table public.churches add column if not exists featured_image text;
alter table public.churches add column if not exists image_alt text;
notify pgrst, 'reload schema';
