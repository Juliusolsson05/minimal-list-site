# Minimal List Site

A reusable personal list template for items, optional posters, and archived things. Inspired by [Curated Supply](https://www.curated.supply/): use it to list items you like, want to buy, or want to keep track of. The visual style is intentionally plain black and white, and the site name, owner, description, about text, feature flags, and storage bucket are configured through environment variables.

## Features

- Public item collection
- Optional poster collection
- Archive page for hidden or old entries
- Admin dashboard for creating, editing, archiving, and deleting content
- NextAuth password login
- Prisma/Postgres database
- Supabase Storage image uploads
- Optional OpenRouter AI helpers with Gemini fallback
- Optional AI background removal / studio image checkbox when uploading items
- Vercel-ready Next.js app

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create `.env` from `.env.example` and fill in the values for your database, site settings, auth secret, admin login, Supabase project, and optional AI providers.

3. Apply database migrations:

```bash
pnpm db:migrate
```

4. Seed the admin user and demo content:

```bash
pnpm db:seed
```

5. Start the app:

```bash
pnpm dev
```

## Scripts

- `pnpm dev` starts the local Next.js server.
- `pnpm build` generates Prisma Client and builds the app.
- `pnpm start` serves the production build.
- `pnpm lint` runs ESLint.
- `pnpm typecheck` runs TypeScript without emitting files.
- `pnpm audit --prod` checks production dependency advisories.
- `pnpm db:migrate` applies Prisma migrations.
- `pnpm db:seed` creates the local admin user and demo content.

## Environment

Required production variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_SITE_OWNER`
- `NEXT_PUBLIC_SITE_DESCRIPTION`
- `NEXT_PUBLIC_SITE_ABOUT`
- `NEXT_PUBLIC_ENABLE_POSTERS`
- `NEXT_PUBLIC_ENABLE_MUSIC`
- `NEXT_PUBLIC_ENABLE_AI`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

Optional AI variables:

- `OPENROUTER_API_KEY`
- `GEMINI_API_KEY`

## Customize

- Change the public site text through the `NEXT_PUBLIC_SITE_*` variables.
- Toggle optional surfaces through `NEXT_PUBLIC_ENABLE_POSTERS`, `NEXT_PUBLIC_ENABLE_MUSIC`, and `NEXT_PUBLIC_ENABLE_AI`.
- Keep `NEXT_PUBLIC_ENABLE_AI=false` if you want normal manual uploads only.
- Change categories and demo content in `prisma/seed.ts`.
- Create the Supabase Storage bucket named by `SUPABASE_STORAGE_BUCKET`.
- Keep real credentials in environment variables only. Do not commit `.env` files or deployment exports.
