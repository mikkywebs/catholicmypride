-- 0038: choose where a blog post's or novena's YouTube video appears. Safe to run more than once.
alter table public.posts   add column if not exists video_position text;
alter table public.novenas add column if not exists video_position text;
notify pgrst, 'reload schema';
