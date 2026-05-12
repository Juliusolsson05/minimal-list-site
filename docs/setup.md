# Setup

This guide covers the parts intentionally left out of the short README.

## Requirements

- Node.js
- pnpm
- Postgres database
- Supabase project with Storage enabled

## Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Required variables:

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

Optional AI variables:

```env
OPENROUTER_API_KEY=""
GEMINI_API_KEY=""
```

Keep `NEXT_PUBLIC_ENABLE_AI=false` if you want normal manual uploads only.

## Database

Apply migrations:

```bash
pnpm db:migrate
```

Seed the admin user and demo content:

```bash
pnpm db:seed
```

The seed script reads `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

## Supabase Storage

Create a public Supabase Storage bucket matching `SUPABASE_STORAGE_BUCKET`.

The default example value is:

```env
SUPABASE_STORAGE_BUCKET="minimal-list"
```

Uploaded item and poster images are stored in that bucket.

## Customization

- Change public site text with `NEXT_PUBLIC_SITE_*`.
- Toggle optional surfaces with `NEXT_PUBLIC_ENABLE_POSTERS`, `NEXT_PUBLIC_ENABLE_MUSIC`, and `NEXT_PUBLIC_ENABLE_AI`.
- Change categories and demo content in `prisma/seed.ts`.
- Replace demo images in `public/`.
- Adjust metadata through `src/lib/site-config.ts`.

## Deploying

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
