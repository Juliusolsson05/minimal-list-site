# Agent Instructions

This file is for AI coding agents helping someone who cloned this repository. Treat it as the high-context handoff that explains what the app is, how it is meant to work, and how to get it running without making the user configure a pile of external services.

The most important rule: local setup should be boring. Use SQLite and local file uploads first. Do not start with Supabase, Vercel, Postgres, OpenRouter, or Gemini unless the user explicitly asks for production deployment or AI features.

## What This App Is

Minimal List Site is a small personal collection website. It is for people who want a clean public list of things they like, want to buy, want to remember, or used to care about.

The site is inspired by Curated Supply-style item lists, but it is built as a reusable template:

- Public home page with item cards
- Category filtering and search
- Optional poster collection
- Optional music collection
- Public archive page for old or hidden entries
- Password-protected admin dashboard
- Image uploads
- Optional AI helpers for listing creation and image cleanup
- Environment-based naming, copy, feature flags, and storage mode

It is intentionally plain black and white so people can clone it and make it their own without fighting a strong brand system.

## Mental Model

The app has two sides:

- Public site: visitors browse items, posters, music, about page, and archive.
- Admin dashboard: the owner logs in, creates/edits/deletes/archives content, and uploads images.

The app has three content types:

- `Item`: regular list entries such as products, references, tools, clothes, furniture, or things to buy.
- `Poster`: visual poster/image collection entries.
- `Song`: music entries with title, artist, album, cover art, optional link, and added date.

The app also has `Category` records for item categories and `User` records for admin login.

## Default Local Stack

Use this stack for local setup:

- Next.js App Router
- Prisma
- SQLite database at `prisma/dev.db`
- Local uploaded files in `public/uploads`
- NextAuth credentials login
- AI features off

No external services are required for the first local run.

## Fast Local Setup

Run these commands from the repo root:

```bash
pnpm run setup:local
pnpm dev
```

Open:

```text
http://localhost:3000
```

Admin login:

```text
http://localhost:3000/admin
```

The admin credentials come from `.env`:

```env
ADMIN_EMAIL="your-admin-email@example.com"
ADMIN_PASSWORD="your-admin-password"
```

For a quick local test, it is fine to set:

```env
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="password"
```

## Required Local Env

For local development, `.env` should look roughly like this:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-this-with-any-long-random-string"

NEXT_PUBLIC_SITE_NAME="Minimal List"
NEXT_PUBLIC_SITE_OWNER="Your Name"
NEXT_PUBLIC_SITE_DESCRIPTION="A clean personal list site for things worth keeping track of."
NEXT_PUBLIC_SITE_ABOUT="Inspired by Curated Supply: a personal list of items you like, want to buy, or want to keep track of."

NEXT_PUBLIC_ENABLE_POSTERS="true"
NEXT_PUBLIC_ENABLE_MUSIC="true"
NEXT_PUBLIC_ENABLE_AI="false"

ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="password"

STORAGE_DRIVER="local"
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
SUPABASE_STORAGE_BUCKET="minimal-list"
```

Do not require Supabase values locally. Blank Supabase values are valid when `STORAGE_DRIVER="local"`.

## Scripts

Use these commands:

```bash
pnpm setup:local    # install deps, create/update SQLite DB, seed demo content
pnpm dev            # start local dev server with NODE_ENV=development
pnpm build          # production build using the default SQLite schema
pnpm build:postgres # production build using the Postgres schema
pnpm typecheck      # TypeScript check
pnpm lint           # ESLint
pnpm db:setup       # prisma db push + seed for local SQLite
pnpm db:push        # push local SQLite schema
pnpm db:seed        # seed current Prisma schema
pnpm db:postgres:push
pnpm db:postgres:seed
```

Use `pnpm db:setup` after changing Prisma models in local mode.

## Feature Flags

Feature flags live in `.env` and are read through `src/lib/site-config.ts`.

```env
NEXT_PUBLIC_ENABLE_POSTERS="true"
NEXT_PUBLIC_ENABLE_MUSIC="true"
NEXT_PUBLIC_ENABLE_AI="false"
```

Behavior:

- `NEXT_PUBLIC_ENABLE_POSTERS=false`: hides poster public/admin surfaces.
- `NEXT_PUBLIC_ENABLE_MUSIC=false`: hides music public/admin surfaces.
- `NEXT_PUBLIC_ENABLE_AI=false`: hides AI creation and AI image cleanup controls.

When helping a user make a simpler clone, disable posters or music through env first. Do not delete feature code unless the user specifically asks for a permanent removal.

## Branding And Site Copy

Branding is env-based. Change these in `.env`:

```env
NEXT_PUBLIC_SITE_NAME=""
NEXT_PUBLIC_SITE_OWNER=""
NEXT_PUBLIC_SITE_DESCRIPTION=""
NEXT_PUBLIC_SITE_ABOUT=""
```

Do not hard-code a user name into components unless they ask. The point of the template is that it can be cloned.

Relevant file:

```text
src/lib/site-config.ts
```

## Data Model

Default schema:

```text
prisma/schema.prisma
```

Production Postgres schema:

```text
prisma/schema.postgres.prisma
```

Models:

- `User`: admin credentials.
- `Category`: item categories.
- `Item`: main list entries.
- `Poster`: poster/image collection entries.
- `Song`: music collection entries.

Seed file:

```text
prisma/seed.ts
```

The seed creates:

- Admin user from `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- Default categories
- Demo items
- Demo music entries

The seed content should stay generic. Do not add the original author's personal taste, private data, API keys, or production URLs.

## SQLite Mode

SQLite is the default because people should be able to try the app immediately after cloning.

Database URL:

```env
DATABASE_URL="file:./dev.db"
```

SQLite database path:

```text
prisma/dev.db
```

Ignored files:

```text
prisma/dev.db
prisma/dev.db-journal
prisma/*.db
prisma/*.db-journal
```

If local data is broken and the user is okay losing it:

```bash
rm -f prisma/dev.db prisma/dev.db-journal
pnpm db:setup
```

## Postgres Mode

Use Postgres for production or if the user explicitly asks.

Production schema:

```text
prisma/schema.postgres.prisma
```

Required production env:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

Commands:

```bash
pnpm db:postgres:push
pnpm db:postgres:seed
pnpm build:postgres
```

For Vercel, set the build command to:

```bash
pnpm build:postgres
```

Do not switch the default local schema back to Postgres. The default clone experience should stay SQLite.

## Storage Modes

Storage is handled in:

```text
src/lib/supabase.ts
```

The filename is historical. It now supports both local storage and Supabase storage.

### Local Storage

Default local env:

```env
STORAGE_DRIVER="local"
```

Uploaded files are written to:

```text
public/uploads
```

This is correct for local development. It is not durable production storage on serverless hosts.

### Supabase Storage

Use this for production/serverless deployments:

```env
STORAGE_DRIVER="supabase"
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
SUPABASE_STORAGE_BUCKET="minimal-list"
```

Create a public bucket matching `SUPABASE_STORAGE_BUCKET`.

If the app asks for Supabase during local setup, fix the local storage path instead of asking the user to make a Supabase account.

## Public Routes

Important app routes:

```text
src/app/page.tsx              # public home, item/poster/music filtering
src/app/about/page.tsx        # about page
src/app/archive/page.tsx      # public archive
src/app/item/[id]/page.tsx    # item detail
src/app/poster/[id]/page.tsx  # poster detail
src/app/admin/page.tsx        # admin dashboard
src/app/admin/login/page.tsx  # admin login
```

There is no dedicated music detail route. Music cards can link to an external music URL if one is provided.

## API Routes

Content APIs:

```text
src/app/api/items/route.ts
src/app/api/items/[id]/route.ts
src/app/api/posters/route.ts
src/app/api/posters/[id]/route.ts
src/app/api/songs/route.ts
src/app/api/songs/[id]/route.ts
src/app/api/categories/route.ts
src/app/api/upload/route.ts
```

Auth:

```text
src/app/api/auth/[...nextauth]/route.ts
```

AI:

```text
src/app/api/ai/generate-listing/route.ts
src/app/api/ai/generate-image/route.ts
src/app/api/ai/analyze-poster/route.ts
src/app/api/ai/parse-date/route.ts
```

Admin write routes require a logged-in session. Public read routes should not require auth.

## Components

Public display:

```text
src/components/HomePage.tsx
src/components/Header.tsx
src/components/CategoryFilter.tsx
src/components/ItemGrid.tsx
src/components/ItemCard.tsx
src/components/PosterGrid.tsx
src/components/PosterCard.tsx
src/components/MusicGrid.tsx
src/components/MusicCard.tsx
src/components/Footer.tsx
```

Admin:

```text
src/components/AdminDashboard.tsx
src/components/AdminPostersManager.tsx
src/components/AdminMusicManager.tsx
src/components/AIProductCreator.tsx
```

UI primitives:

```text
src/components/ui
```

Prefer reusing the existing UI primitives and layout style. Keep the black-and-white, minimal, utilitarian feel unless the user asks for a stronger visual identity.

## Admin Behavior

The admin dashboard supports:

- Add/edit/delete items
- Archive/unarchive items
- Add/edit/delete posters
- Archive/unarchive posters
- Add/edit/delete music
- Archive/unarchive music
- Upload images
- Optional AI listing generation
- Optional AI image cleanup

Archive means setting `archivedAt`, not deleting the record. Archived records appear on `/archive` and disappear from the normal home grids.

## Optional AI

AI is off by default:

```env
NEXT_PUBLIC_ENABLE_AI="false"
```

If the user wants AI:

```env
NEXT_PUBLIC_ENABLE_AI="true"
OPENROUTER_API_KEY=""
GEMINI_API_KEY=""
```

Provider behavior:

- OpenRouter is primary.
- Gemini is fallback.
- The app should continue to work manually if both keys are missing and AI is disabled.

Do not require AI keys for local setup.

## Styling Rules

The template design is intentionally restrained:

- Plain black-and-white system
- Clean grid cards
- Light borders
- Simple typography
- No heavy branding
- No decorative marketing sections

Keep changes consistent with:

```text
src/app/globals.css
tailwind.config.ts
src/components/ui
```

For operational/admin UI, favor density and clarity over landing-page visuals.

## Common User Requests And What To Do

If the user says "set this up locally":

1. Run `pnpm run setup:local`; it copies `.env.example` to `.env` if needed, installs deps, creates/updates SQLite, and seeds demo data.
2. Ensure `DATABASE_URL="file:./dev.db"` if the user edited `.env`.
3. Ensure `STORAGE_DRIVER="local"` if the user edited `.env`.
4. Ensure `NEXT_PUBLIC_ENABLE_AI="false"` if the user edited `.env`.
5. Run `pnpm dev`.

If the user says "make it mine":

1. Update `.env` site variables.
2. Adjust categories and seed content in `prisma/seed.ts` only if they want demo content changed.
3. Do not hard-code personal branding into shared components unless requested.

If the user says "deploy to Vercel":

1. Use Postgres, not SQLite.
2. Use Supabase Storage, not local uploads.
3. Set Vercel build command to `pnpm build:postgres`.
4. Set production env vars in Vercel.
5. Run/push Postgres schema with `pnpm db:postgres:push`.

If the user says "remove posters" or "remove music":

1. Prefer setting feature flags to `"false"`.
2. Only delete code/schema if they explicitly want a smaller permanent fork.

If the user says "uploads are broken":

1. Check `STORAGE_DRIVER`.
2. For local, use `STORAGE_DRIVER="local"`.
3. Confirm `public/uploads/.gitkeep` exists.
4. Confirm `public/uploads` is ignored except `.gitkeep`.

If the user says "Prisma is broken":

1. Run `pnpm exec prisma generate`.
2. Run `pnpm db:push`.
3. If local state is disposable, reset `prisma/dev.db`.

## Files Agents Should Not Commit

Never commit:

```text
.env
.env.*
!.env.example
prisma/dev.db
prisma/*.db
.next
node_modules
public/uploads/*
```

`public/uploads/.gitkeep` is allowed.

## Verification

Before handing work back after code changes, run:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Also validate schemas when touching Prisma:

```bash
DATABASE_URL="file:./dev.db" pnpm exec prisma validate
DATABASE_URL="postgresql://user:pass@localhost:5432/db" DIRECT_URL="postgresql://user:pass@localhost:5432/db" pnpm exec prisma validate --schema prisma/schema.postgres.prisma
```

If you cannot run a command, say exactly which command failed and why.

## Final Principle

This repo should feel easy for a normal person to clone and hand to an AI agent. The agent should be able to make it run locally without creating accounts, reading external docs, or making infrastructure decisions. Keep that path clean.
