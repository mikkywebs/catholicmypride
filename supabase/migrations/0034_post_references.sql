-- 0034: blog posts can list the references (sources) used to write them. Safe to run more than once.
alter table public.posts add column if not exists sources text;
notify pgrst, 'reload schema';
