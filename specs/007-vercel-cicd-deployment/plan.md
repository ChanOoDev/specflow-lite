# Implementation Plan: Vercel CI/CD Deployment

**Branch**: `007-vercel-cicd-deployment` | **Date**: 2026-06-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-vercel-cicd-deployment/spec.md`

## Summary

Set up automated CI/CD from GitHub to Vercel for the SpecFlow Lite Next.js project. The integration covers: automatic production deployments on push to `main`, preview deployments for every pull request, environment variable management for Supabase credentials, and deployment monitoring via GitHub status checks. Setup uses Vercel's GitHub App integration (no CLI, no Actions YAML). A single `vercel.json` configuration file is the only code change committed to the repository — all other configuration is done in the Vercel dashboard.

## Technical Context

**Language/Version**: N/A — platform configuration (Next.js 16 is the built project)

**Primary Dependencies**: Vercel platform (GitHub App integration), Next.js (auto-detected framework)

**Storage**: Vercel encrypted env var storage (for Supabase keys); no database changes

**Testing**: Manual verification via Vercel dashboard and GitHub PR checks; Playwright E2E can validate production/preview URLs

**Target Platform**: Web — Vercel edge network, Next.js App Router on serverless/edge functions

**Project Type**: CI/CD pipeline configuration (no application code changes)

**Performance Goals**: Production deploy < 3 min from push to live; preview deploy < 2 min

**Constraints**: Zero-touch deploys (no manual steps after setup); zero-downtime rollback on failure; no secrets in repository

**Scale/Scope**: Single project, single production branch (`main`), preview per PR; 1 config file changed

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Specification-First | ✅ PASS | spec.md approved with 5 user stories, 12 FRs, 6 SCs |
| II. Test-First with UI Verification | ✅ PASS | quickstart.md defines manual verification scenarios; preview URLs enable Playwright E2E on deployed instances |
| III. Security by Default | ✅ PASS | Env vars stored in Vercel (encrypted), not in repo; `.env.local` already gitignored; no secrets in code; `NEXT_PUBLIC_*` pattern for safe client-side exposure |
| IV. AI-Assisted but Human-Reviewed | ✅ PASS | Plan reviewed; Vercel setup requires human OAuth authorization |
| V. Component Simplicity | ✅ PASS | Single config file (`vercel.json`, 4 lines of config); no custom scripts or workflow YAML needed |

**Post-Design Re-check**: ✅ All principles remain satisfied. No new code. One config file. No complexity additions.

## Project Structure

### Documentation (this feature)

```text
specs/007-vercel-cicd-deployment/
├── plan.md              # This file
├── research.md          # Phase 0: GitHub App vs CLI, config, env vars, caching
├── data-model.md        # Phase 1: configuration artifacts, deployment lifecycle
├── quickstart.md        # Phase 1: setup steps, validation scenarios
├── contracts/           # Phase 1: N/A — no API contracts
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
vercel.json                          # NEW: build and framework configuration
.env.local.example                   # EXISTING: documents required env vars
next.config.ts                       # EXISTING: already has optimizePackageImports
```

**Structure Decision**: This is a CI/CD platform configuration feature — no application code changes. The only new file is `vercel.json` at the repository root. All other configuration lives in the Vercel dashboard (environment variables, GitHub integration settings) and is not stored in the repository.

## Complexity Tracking

> No Constitution violations — this section intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
