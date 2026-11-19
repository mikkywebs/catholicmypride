-- Catholic My Pride: WhatsApp Channel link (join box after every post). Safe to run more than once.
alter table public.settings add column if not exists whatsapp_channel_url text;
notify pgrst, 'reload schema';
