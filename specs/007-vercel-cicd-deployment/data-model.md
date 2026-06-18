# Data Model: Vercel CI/CD Deployment

**Feature**: 007-vercel-cicd-deployment
**Date**: 2026-06-18

## Overview

This feature is platform configuration — it has **no database entities**. The "data model" describes configuration artifacts managed by Vercel and tracked in the repository.

## Configuration Artifacts

### vercel.json

Repository-level build and deployment configuration. Tracked in git.

| Field | Type | Value | Description |
|---|---|---|---|
| `buildCommand` | string | `"next build"` | Build command Vercel runs |
| `installCommand` | string | `"npm install"` | Dependency install command |
| `framework` | string | `"nextjs"` | Framework identifier for optimization |
| `outputDirectory` | string | `".next"` | Build output directory |

**Version control**: Committed to repository root.

### Environment Variables (Vercel Dashboard)

Key-value pairs injected at build time. Managed in Vercel dashboard, not in repository.

| Key | Scope | Visibility | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | Public (client-side) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development | Public (client-side) | Supabase anonymous API key |

**Storage**: Vercel dashboard → Project Settings → Environment Variables. Encrypted at rest.

### GitHub Integration Settings (Vercel Dashboard)

Project connection settings between GitHub and Vercel.

| Setting | Value | Description |
|---|---|---|
| Git Repository | `ChanOoDev/specflow-lite` | Connected GitHub repo |
| Production Branch | `main` | Branch that triggers production deploys |
| PR Preview | Enabled | Creates preview for every PR |
| PR Comments | Enabled | Vercel bot posts preview URL on PRs |
| Auto Cancel | Enabled | Cancel in-progress deploys on new push |

### Deployment Lifecycle

State transitions for a deployment:

```text
                  push/merge
                      │
                      ▼
                 [queued]
                      │
                      ▼
                 [building]  ←── npm install → next build
                      │
                 ┌────┴────┐
                 ▼         ▼
             [ready]    [error]
                         │
                         ▼
                (previous deployment stays live)
```

**Ready**: Deployment is live at URL. Users see new version.
**Error**: Build or deploy failed. Previous deployment remains live (zero-downtime rollback).

### Preview URL Pattern

```
https://specflow-lite-git-<branch-slug>-<scope>.vercel.app
```

- `branch-slug`: Branch name with `/` replaced by `-`
- `scope`: Team or personal account slug

For example: `https://specflow-lite-git-006-project-info-chanoodev.vercel.app`

### Deployment Status Check

Displayed on GitHub commits and PRs:

| State | GitHub Check | Description |
|---|---|---|
| Queued/Building | 🟡 Pending | Deployment in progress |
| Ready | 🟢 Success | Deployment successful, URL available |
| Error | 🔴 Failure | Build or deployment failed |
