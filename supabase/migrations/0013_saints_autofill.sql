-- Catholic My Pride: Saint of the Day prepared automatically from the calendar.
-- auto_filled: the saint was added automatically and not yet edited.
alter table public.saints add column if not exists auto_filled boolean not null default false;
notify pgrst, 'reload schema';
