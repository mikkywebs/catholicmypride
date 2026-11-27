-- Prayer-time reminders (web push).
-- Phones that opt in get a notification at each timed prayer (Angelus, Holy Father, Divine Mercy…),
-- on their own clock. Supabase calls the website once a minute; the website sends what is due.

create extension if not exists pg_cron;
create extension if not exists pg_net;

create table if not exists public.push_subscriptions (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  tz text not null default 'UTC',
  last_key text,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
-- No policies: nobody reads or writes this table directly. Only the functions below touch it.

-- A random password that only this database and its own scheduled job know.
create table if not exists public.push_settings (id int primary key default 1 check (id = 1), secret text not null);
alter table public.push_settings enable row level security;
insert into public.push_settings (id, secret) values (1, replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')) on conflict (id) do nothing;

-- Visitors subscribe / unsubscribe from the website.
create or replace function public.push_subscribe(p_endpoint text, p_p256dh text, p_auth text, p_tz text)
returns void language sql security definer set search_path = public as $$
  insert into push_subscriptions (endpoint, p256dh, auth, tz)
  values (left(p_endpoint, 1000), left(p_p256dh, 200), left(p_auth, 100), coalesce(nullif(left(p_tz, 64), ''), 'UTC'))
  on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth, tz = excluded.tz;
$$;

create or replace function public.push_unsubscribe(p_endpoint text)
returns void language sql security definer set search_path = public as $$
  delete from push_subscriptions where endpoint = p_endpoint;
$$;

-- The sender (website) gets the list only with the right password.
create or replace function public.push_targets(p_secret text)
returns setof push_subscriptions language sql security definer set search_path = public as $$
  select s.* from push_subscriptions s where exists (select 1 from push_settings where secret = p_secret);
$$;

create or replace function public.push_sent(p_secret text, p_endpoint text, p_key text, p_gone boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from push_settings where secret = p_secret) then return; end if;
  if p_gone then delete from push_subscriptions where endpoint = p_endpoint;
  else update push_subscriptions set last_key = p_key where endpoint = p_endpoint; end if;
end $$;

revoke all on function public.push_targets(text) from public;
revoke all on function public.push_sent(text, text, text, boolean) from public;
grant execute on function public.push_subscribe(text, text, text, text), public.push_unsubscribe(text),
  public.push_targets(text), public.push_sent(text, text, text, boolean) to anon, authenticated;

-- Every minute, ask the website to send the reminders that are due.
select cron.unschedule('prayer-reminders') where exists (select 1 from cron.job where jobname = 'prayer-reminders');
select cron.schedule('prayer-reminders', '* * * * *', $$
  select net.http_get(
    url := 'https://www.catholicmypride.org/api/push/send',
    headers := jsonb_build_object('x-push-secret', (select secret from public.push_settings where id = 1))
  );
$$);
