# Deploy

Production runs on **Vercel** (region `fra1`, co-located with the Supabase EU-West-1 DB).

## First-time setup

These steps aren't automatable from CI — do them once, then every push to `main` auto-deploys.

### 1. Create the Vercel project

1. Sign in at [vercel.com](https://vercel.com).
2. **Add New → Project** → import this repo from GitHub.
3. Framework preset: Next.js (auto-detected).
4. Build command, install command, output directory: leave defaults; `vercel.json` overrides them.
5. Click **Deploy** for the first time. It'll fail until env vars are set — that's expected.

### 2. Set environment variables

In the Vercel project → **Settings → Environment Variables**. Copy from `.env.example`. Mark each:

| Name                                  | Environments        | Notes |
|---------------------------------------|---------------------|-------|
| `NEXT_PUBLIC_SITE_URL`                | Production          | `https://your-domain.com` |
| `NEXT_PUBLIC_SUPABASE_URL`            | All                 | from Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`| All                 | `sb_publishable_…` |
| `SUPABASE_SERVICE_ROLE_KEY`           | Production, Preview | `sb_secret_…` — Sensitive |
| `DATABASE_URL`                        | Production, Preview | Session pooler URL with password — Sensitive |
| `REVALIDATE_TOKEN`                    | Production, Preview | 32+ random bytes — Sensitive |
| `ANALYTICS_DAILY_SALT_SEED`           | Production, Preview | random — Sensitive |
| `SENTRY_DSN`                          | Production          | optional but recommended |
| `NEXT_PUBLIC_SENTRY_DSN`              | Production          | same value as `SENTRY_DSN` |
| `SENTRY_ORG`, `SENTRY_PROJECT`        | Production          | for source map upload |
| `SENTRY_AUTH_TOKEN`                   | Production          | Sensitive |

Stripe + Resend keys are deferred (MYWEB-8 + email features inactive).

### 3. Wire your domain

In Vercel → **Settings → Domains** → add the production domain. Vercel auto-provisions TLS via Let's Encrypt.

After DNS resolves: update Supabase **Authentication → URL Configuration**:
- Site URL: `https://your-domain.com`
- Redirect URLs: `https://your-domain.com/callback`

### 4. Wire GitHub Actions to deploy

The deploy workflow at `.github/workflows/deploy.yml` runs on every push to `main`.

In the GitHub repo → **Settings → Secrets and variables → Actions**, add:
- `VERCEL_TOKEN` — create at [vercel.com/account/tokens](https://vercel.com/account/tokens)
- `PRODUCTION_DOMAIN` — your domain (no scheme), e.g. `linkin.tree`
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — used by the post-deploy production smoke
- `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `ANALYTICS_DAILY_SALT_SEED` — used by the e2e job in `ci.yml`

The first push to `main` will trigger the deploy job.

### 5. First deploy verification

After deploy, the workflow runs `scripts/smoke-production.ts` automatically. Manually:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com pnpm exec tsx scripts/smoke-production.ts
```

This creates a fixture profile in your Supabase, hits the rendered page, asserts theme + JSON-LD + active blocks render, then deletes the fixture.

## Day-to-day

- **Push to a feature branch + open a PR**: CI runs typecheck/lint/unit/build. Vercel auto-creates a preview deploy at `https://<branch>-<project>.vercel.app`.
- **Merge to `main`**: full E2E suite runs, then production deploy + post-deploy smoke + Lighthouse perf gate.
- **Rollback**: Vercel dashboard → Deployments → pick a prior production deployment → Promote.

## Database migrations

Migrations are applied separately from app deploys. Locally, against the production DB:

```bash
DATABASE_URL=<production session pooler URL> pnpm exec tsx scripts/db-migrate.ts
```

Run this **before** the app deploy that depends on the new schema. Migrations are additive in this codebase; rollbacks aren't automated — be deliberate about destructive changes.

## Performance budget (spec §9)

Lighthouse runs on every production deploy. The CI fails if performance drops below the spec's targets:
- LCP < 1.5s on simulated 3G
- Total JS < 30 KB gzipped
- CLS < 0.05

If a deploy fails the perf gate, the deploy stays live (we don't auto-rollback for perf), but the run goes red and the next push has to fix it.

## Open items punted to MYWEB-13+

- Stripe Checkout + Customer Portal + webhook (MYWEB-8)
- Dynamic OG image (`@vercel/og` Windows path bug — re-enable after Next.js patch upgrade past 15.0.3)
- Video block real upload UI (Supabase Storage bucket setup)
- Pro tier analytics: CTR per block, geo, devices, referrers, cohort, funnel (queries stubbed)
- Materialized view for users with >100k events (spec §8)
