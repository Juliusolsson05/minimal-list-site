# Setup

This guide covers the parts intentionally left out of the short README.

## Requirements

- Node.js
- pnpm
- SQLite for local development
- Postgres and Supabase Storage for production deployments

## Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Required variables:

```env
DATABASE_URL=""
NEXTAUTH_URL=""
NEXTAUTH_SECRET=""
ADMIN_EMAIL=""
ADMIN_PASSWORD=""

NEXT_PUBLIC_SITE_NAME=""
NEXT_PUBLIC_SITE_OWNER=""
NEXT_PUBLIC_SITE_DESCRIPTION=""
NEXT_PUBLIC_SITE_ABOUT=""

NEXT_PUBLIC_ENABLE_POSTERS="true"
NEXT_PUBLIC_ENABLE_MUSIC="true"
NEXT_PUBLIC_ENABLE_AI="false"

STORAGE_DRIVER="local"
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

For local development, use SQLite:

```bash
pnpm run setup:local
```

That creates `.env` if needed, installs dependencies with `NODE_ENV=development`, creates or updates `prisma/dev.db`, and seeds the admin user plus demo content.

If you already have a database and only want to seed:

```bash
pnpm db:seed
```

The seed script reads `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

## Storage

Local development uses `STORAGE_DRIVER=local`, which saves uploads under `public/uploads`.

For production, use Supabase Storage:

1. Set `STORAGE_DRIVER=supabase`.
2. Create a public Supabase Storage bucket matching `SUPABASE_STORAGE_BUCKET`.
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

The default example value is:

```env
SUPABASE_STORAGE_BUCKET="minimal-list"
```

Uploaded item, poster, and music cover images are stored locally or in that bucket, depending on `STORAGE_DRIVER`.

## Postgres

SQLite is intentionally the default so the template is easy to try. For production Postgres, use `prisma/schema.postgres.prisma`:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
pnpm db:postgres:push
pnpm db:postgres:seed
pnpm build:postgres
```

On Vercel, set the build command to `pnpm build:postgres` after adding the Postgres and Supabase environment variables.

## Customization

- Change public site text with `NEXT_PUBLIC_SITE_*`.
- Toggle optional surfaces with `NEXT_PUBLIC_ENABLE_POSTERS`, `NEXT_PUBLIC_ENABLE_MUSIC`, and `NEXT_PUBLIC_ENABLE_AI`.
- Change categories and demo content in `prisma/seed.ts`.
- Replace demo images in `public/`.
- Adjust metadata through `src/lib/site-config.ts`.

## Deploying

The app is ready for Vercel. For production, set Postgres and Supabase environment variables in your Vercel project, then deploy from GitHub.

For production databases, push the Postgres schema before or during deployment:

```bash
pnpm db:postgres:push
```

## Security

- Do not commit `.env` files.
- Do not commit deployment exports or one-off scripts with live keys.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Use a strong `NEXTAUTH_SECRET`.
- Use a strong `ADMIN_PASSWORD`.
