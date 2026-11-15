-- Catholic My Pride: live admin alerts for new prayer requests and messages.
-- Only signed-in admins receive them (row level security applies). Safe to run more than once.
do $$ begin
  alter publication supabase_realtime add table public.prayer_requests;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.contact_messages;
exception when duplicate_object then null; when undefined_object then null; end $$;
