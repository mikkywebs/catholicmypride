-- 0036: a YouTube video can be shown on a blog post or a novena page. Safe to run more than once.
alter table public.posts   add column if not exists youtube_url text;
alter table public.novenas add column if not exists youtube_url text;
notify pgrst, 'reload schema';
