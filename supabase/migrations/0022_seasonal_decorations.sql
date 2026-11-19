-- 0022: seasonal decorations setting (automatic by default). Safe to run more than once.
alter table public.settings add column if not exists seasonal_theme text not null default 'auto';
alter table public.settings drop constraint if exists settings_seasonal_theme_check;
alter table public.settings add constraint settings_seasonal_theme_check
  check (seasonal_theme in ('auto', 'off', 'advent', 'christmas', 'lent', 'holyweek', 'easter', 'pentecost'));
notify pgrst, 'reload schema';
