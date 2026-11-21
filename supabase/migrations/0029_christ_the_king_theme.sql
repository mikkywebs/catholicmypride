-- 0029: the seasonal decoration setting can also show Christ the King by hand. Safe to run more than once.
alter table public.settings drop constraint if exists settings_seasonal_theme_check;
alter table public.settings add constraint settings_seasonal_theme_check
  check (seasonal_theme in ('auto', 'off', 'advent', 'christmas', 'lent', 'holyweek', 'easter', 'pentecost', 'christking'));
notify pgrst, 'reload schema';
