#Supabase Strapi Sync

This folder contains:
- React admin panel
- Supabase SQL + Edge Function
- Next.js site (ISR + revalidate endpoint)
- Astro site
- SvelteKit site
- Strapi extra files (to drop into a Strapi project)

## How to use
1. Import `supabase/entries.sql` into your Supabase project.
2. Deploy the edge function from `supabase/functions/entries`.
3. In `admin-panel`, set `VITE_SUPABASE_FN_URL` to your edge function URL and run:
   ```bash
   npm install
   npm run dev
   ```
4. In `sites/nextjs-site`, set:
   ```bash
   STRAPI_PUBLIC_URL=...
   REVALIDATE_SECRET=...
   ```
   then run:
   ```bash
   npm install
   npm run dev
   ```

For Strapi: create a normal Strapi project, then copy the `strapi-backend/src/...` files into it.
