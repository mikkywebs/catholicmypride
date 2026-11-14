# Catholic My Pride — catholicmypride.org

Next.js (App Router, Cache Components) + Supabase + Vercel.

## Set up

1. Create a Supabase project. In the SQL editor, run `supabase/migrations/0001_init.sql` once.
2. In Supabase → Authentication → Users, add the admin's email and password. Then run:
   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'cmpapostolate@gmail.com';
   ```
3. On Vercel, import this repo and add the variables from `.env.example`.
4. Add `catholicmypride.org` in Vercel → Domains, keeping Namecheap's DNS (add Vercel's A/CNAME records there).

## How content works

- Everything is entered in `/admin`. A section, menu item, category or social link stays hidden until it has published content.
- Featured images are cropped to 16:9 (1600 × 900) on upload; book covers to 2:3.
- Public pages are cached and refreshed instantly when the admin saves.
- Prayer requests appear on the Prayer Wall only after approval. Links are blocked in the form and by the database.

## Scripts

`npm run dev`, `npm run build`, `npm run lint`
