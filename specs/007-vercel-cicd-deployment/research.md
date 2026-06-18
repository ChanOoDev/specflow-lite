# Research: Vercel CI/CD Deployment

**Feature**: 007-vercel-cicd-deployment
**Date**: 2026-06-18
**Status**: Complete

## Research Questions

### RQ-1: GitHub Integration vs Vercel CLI?

**Context**: Two ways to connect a Next.js project to Vercel — the GitHub App integration (automatic, web-based) or the Vercel CLI (`vercel` command). We need production deploys on push to main, plus PR previews.

**Decision**: GitHub App integration (Vercel for GitHub).

**Rationale**:
- Zero CLI maintenance — no local tooling or CI scripts needed
- Automatically sets up GitHub status checks and PR comments
- Auto-detects Next.js framework and applies optimal defaults
- Handles PR preview deployments natively with unique URLs per branch
- Supports environment variable management per environment via the Vercel dashboard
- The alternative (GitHub Actions + Vercel CLI) adds complexity with a workflow YAML file, token management, and manual preview URL setup

**Alternatives considered**:
- GitHub Actions + Vercel CLI — Rejected. Requires `.github/workflows/deploy.yml`, a Vercel token secret, and explicit `vercel deploy` commands. More flexible but unnecessary for a standard Next.js project.
- Manual `vercel` CLI deploys — Rejected. No automation. Violates FR-001.

### RQ-2: vercel.json configuration?

**Context**: Next.js is auto-detected by Vercel, but explicit configuration ensures correct build settings and can optimize caching.

**Decision**: Create a minimal `vercel.json` at the project root.

**Rationale**:
- Explicit is better than implicit — documents the build configuration in version control
- Enables future customization (redirects, rewrites, headers, functions, CRON jobs)
- `buildCommand` and `installCommand` safeguard against framework misdetection
- `outputDirectory` ensures the correct build output is deployed
- GitHub integration auto-detection is reliable but having the config in-repo means the project owns its deployment behavior

**Recommended minimal config**:
```json
{
  "buildCommand": "next build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

**Alternatives considered**:
- No vercel.json (rely on auto-detection) — Works but loses explicit documentation. Less maintainable as the project grows.
- Full-featured vercel.json with rewrites, headers, CRON — Unnecessary now. Can be extended incrementally.

### RQ-3: Environment variables strategy?

**Context**: The project needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` at minimum. These are already in `.env.local` for local development. Must not hardcode them.

**Decision**: Configure env vars in Vercel dashboard via the GitHub integration settings.

**Rationale**:
- Vercel env vars are encrypted at rest and injected at build time
- Support three scopes: Production, Preview, Development — all three needed
- `NEXT_PUBLIC_*` variables are automatically available client-side
- No secret variables in the repository — `.env.local` is already gitignored
- The `.env.local.example` file documents required vars without exposing values

**Variables to configure**:
| Key | Scope | Visibility |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development | Public |

**Alternatives considered**:
- `.env.production` file in repo — Rejected. Secrets in version control violates Constitution III.
- GitHub Actions secrets + `vercel env add` — Rejected. Adds unnecessary CI complexity for a simple setup.

### RQ-4: Build caching strategy?

**Context**: Next.js builds benefit from caching `node_modules` and `.next/cache`. Vercel applies aggressive caching by default but explicit settings ensure consistency.

**Decision**: Rely on Vercel's default caching; no custom cache configuration needed.

**Rationale**:
- Vercel automatically caches `node_modules` (via `package-lock.json` hash)
- `.next/cache` is preserved between builds for incremental builds
- Next.js 16 with `optimizePackageImports` (already configured in `next.config.ts`) reduces bundle size
- No additional config needed — Vercel's defaults are optimized for Next.js

### RQ-5: Preview URL and PR integration?

**Context**: Vercel's GitHub integration provides two key features: deployment status checks and preview URL comments. We need to confirm both are enabled.

**Decision**: Enable both Deployment Status Checks and Pull Request Comments in the Vercel project settings.

**Rationale**:
- Status checks show deployment outcome as a CI check on the PR
- PR comments (by Vercel bot) contain the preview URL directly in the PR thread
- Both are enabled by default when connecting via the GitHub App
- Preview URLs follow the pattern: `https://<project-name>-git-<branch-hash>-<scope>.vercel.app`

### RQ-6: Supabase redirect URLs for preview deployments?

**Context**: Supabase Auth redirects need to be configured for each deployment URL. Preview deployments get unique, unpredictable URLs.

**Decision**: For v1, skip auth redirect configuration for previews. Production URL only.

**Rationale**:
- This project doesn't use Supabase Auth redirects in a user-facing flow — the app reads data, it doesn't authenticate end users
- Supabase client is used server-side for data access via anon key
- No OAuth callback URLs to configure
- If auth redirects become needed later, Vercel's `VERCEL_URL` env var can be used dynamically
