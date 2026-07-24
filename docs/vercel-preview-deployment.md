# Qaddem AI — Vercel Preview Deployment

## Purpose

Create a server-capable preview for the Next.js application without changing `haderksa.org` or removing the existing public site.

## Vercel project settings

1. Import `Mohammed-3bgarino0-lgtm/job-tracker-platform` from GitHub.
2. Set **Root Directory** to `apps/web`.
3. Keep **Include source files outside of the Root Directory in the Build Step** enabled so the app can access `packages/shared` and `prisma/schema.prisma`.
4. Use the detected Next.js framework preset.
5. Use Node.js 22.
6. Keep the default pnpm install and Next.js build commands unless the deployment log requires an override.

## Required environment variables

Configure these for Preview first:

- `DATABASE_URL`: a PostgreSQL connection string. Prisma Postgres through the Vercel Marketplace is suitable because it provides a pooled serverless connection.
- `NEXT_PUBLIC_APP_URL`: the Vercel preview URL after the first deployment.
- `NEXT_TELEMETRY_DISABLED=1`.

Do not commit real credentials to GitHub.

## Database preparation

The current repository contains a Prisma schema but no production migration history yet. Before enabling resume persistence in production:

1. Create a dedicated preview database.
2. Review the Prisma schema.
3. Generate and review the initial migration.
4. Apply it to Preview only.
5. Run the smoke tests below.

Do not point Preview at an unrelated production database.

## Preview smoke test

The preview is acceptable only when all checks pass:

1. `/api/health` returns HTTP 200 with `status: ok`.
2. `/`, `/dashboard`, `/jobs`, `/applications`, `/resume`, `/profile`, `/searches`, `/devices`, and `/settings` load without server errors.
3. Desktop and mobile navigation work.
4. The site contains no legacy dummy jobs, companies, users, or match scores.
5. A valid PDF or DOCX can reach the review screen when a real test user and database are available.
6. Missing values remain empty rather than being fabricated.
7. No final job application is submitted automatically.

## Domain cutover

Do not attach `haderksa.org` until Preview passes the smoke test. When it passes:

1. Add the domain to the Vercel project.
2. Copy the DNS records requested by Vercel.
3. Lower DNS TTL before the planned cutover when possible.
4. Keep the old deployment available for rollback.
5. Verify HTTPS, redirects, `/api/health`, desktop, and mobile after DNS changes.

## Rollback

If the new deployment fails after cutover, restore the previous DNS records and keep the new Vercel deployment available only on its preview domain while the issue is corrected.
