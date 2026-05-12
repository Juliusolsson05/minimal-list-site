# Minimal List Site

A clean personal list template for items you like, want to buy, or want to keep track of. Inspired by [Curated Supply](https://www.curated.supply/), with a plain black-and-white design that is easy to make your own.

My own site using this template is [juliuslist.com](https://juliuslist.com).

![Screenshot of Julius List built with this template](public/readme/juliuslist-screenshot.png)

## Why This Is Useful

Most personal list sites are either too generic or too much work to maintain. This template is meant to be a practical middle ground: a clean place to keep track of things you like, want to buy, want to remember, or used to care about enough to archive.

The core flow is simple: add an item, upload an image, write a short description, and organize it by category. If you want the site to stay fully manual, you can leave AI turned off and use it like a normal CMS.

If you do enable AI, the admin has a few optional helpers:

- **AI background removal / studio image generation**: when uploading an item image, you can check a box to turn a messy product photo into a cleaner white-background product-style image.
- **Image filling and framing**: uploaded product photos are normalized into square listing images, so the grid stays visually consistent even when source images have different aspect ratios.
- **Listing copy generation**: the AI item flow can draft a title, short tagline, price formatting, and description from an uploaded image and a few details.
- **Poster processing**: poster uploads can be framed into a consistent poster presentation, with the original image preserved separately.

All of this is optional. The template works fine without AI keys, and the feature flags let you hide AI or posters entirely.

## Features

- Public item collection with categories and search
- Optional poster collection
- Archive page for old or hidden entries
- Admin dashboard for creating, editing, archiving, and deleting content
- Password-protected admin login with NextAuth
- Prisma/Postgres database
- Supabase Storage image uploads
- Optional OpenRouter AI helpers with Gemini fallback
- Optional AI background removal / studio image checkbox when uploading items
- Vercel-ready Next.js app

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Prisma
- Postgres
- Supabase Storage
- NextAuth

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env` and fill in the values.

Required:

```env
DATABASE_URL=""
DIRECT_URL=""
NEXTAUTH_URL=""
NEXTAUTH_SECRET=""
ADMIN_EMAIL=""
ADMIN_PASSWORD=""

NEXT_PUBLIC_SITE_NAME=""
NEXT_PUBLIC_SITE_OWNER=""
NEXT_PUBLIC_SITE_DESCRIPTION=""
NEXT_PUBLIC_SITE_ABOUT=""

NEXT_PUBLIC_ENABLE_POSTERS="true"
NEXT_PUBLIC_ENABLE_MUSIC="false"
NEXT_PUBLIC_ENABLE_AI="false"

NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
SUPABASE_STORAGE_BUCKET=""
```

Optional AI providers:

```env
OPENROUTER_API_KEY=""
GEMINI_API_KEY=""
```

Keep `NEXT_PUBLIC_ENABLE_AI=false` if you want normal manual uploads only.

## Feature Flags

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_ENABLE_POSTERS` | `true` | Shows the poster collection and admin poster tools. |
| `NEXT_PUBLIC_ENABLE_MUSIC` | `false` | Reserved for clones that want to add a music surface. |
| `NEXT_PUBLIC_ENABLE_AI` | `false` | Shows AI item creation and AI image cleanup controls. |

## Scripts

```bash
pnpm dev          # Start local dev server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript
pnpm audit --prod # Check production dependency advisories
pnpm db:migrate   # Apply Prisma migrations
pnpm db:seed      # Seed admin user and demo content
```

## Supabase Storage

Create a public Supabase Storage bucket matching `SUPABASE_STORAGE_BUCKET`.

The default example value is:

```env
SUPABASE_STORAGE_BUCKET="minimal-list"
```

Uploaded item and poster images are stored in that bucket.

## Customize

- Change the public site text with the `NEXT_PUBLIC_SITE_*` variables.
- Toggle optional surfaces with `NEXT_PUBLIC_ENABLE_POSTERS`, `NEXT_PUBLIC_ENABLE_MUSIC`, and `NEXT_PUBLIC_ENABLE_AI`.
- Change categories and demo content in `prisma/seed.ts`.
- Replace demo images in `public/`.
- Adjust metadata in `src/app/layout.tsx` through `src/lib/site-config.ts`.

## Deploy

The app is ready for Vercel. Set the environment variables in your Vercel project, then deploy from GitHub.

For production databases, run migrations before or during deployment:

```bash
pnpm db:migrate
```

## Security

- Do not commit `.env` files.
- Do not commit deployment exports or one-off scripts with live keys.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Use a strong `NEXTAUTH_SECRET`.
- Use a strong `ADMIN_PASSWORD`.

## License

MIT
