-- Catholic My Pride: daily readings prepared automatically from the lectionary.
-- auto_filled: the row was created automatically and not yet edited.
-- needs_check: the text comes from a book whose verse numbering differs in the Douay-Rheims; give it a quick look.
alter table public.readings add column if not exists auto_filled boolean not null default false;
alter table public.readings add column if not exists needs_check boolean not null default false;
notify pgrst, 'reload schema';
