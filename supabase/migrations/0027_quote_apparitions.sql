-- 0027: quotes can be marked as words of Our Lady in Church-approved apparitions. Safe to run more than once.
alter table public.quotes drop constraint if exists quotes_kind_check;
alter table public.quotes add constraint quotes_kind_check
  check (kind in ('jesus', 'mary', 'apparition', 'bible', 'saint', 'pope', 'bishop', 'scholar', 'church'));
notify pgrst, 'reload schema';
