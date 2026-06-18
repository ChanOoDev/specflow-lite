# Quickstart: Vercel CI/CD Deployment

**Feature**: 007-vercel-cicd-deployment
**Date**: 2026-06-18

## Prerequisites

- GitHub repository: `github.com/ChanOoDev/specflow-lite`
- Vercel account (sign up at vercel.com with GitHub)
- Admin/owner access to the GitHub repository
- Supabase project URL and anon key (from `.env.local` or Supabase dashboard)

## Setup Steps

### Step 1: Create vercel.json

Create `vercel.json` at the project root with the following content. This configures Vercel to build the Next.js project correctly.

```json
{
  "buildCommand": "next build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

**Validation**: Commit and push this file. It will be used in all subsequent deployments.

### Step 2: Connect GitHub to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub
3. Click "Import" on the `specflow-lite` repository
4. Vercel auto-detects Next.js and reads `vercel.json`
5. Configure project settings:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `.` (default)
   - **Build Command**: `next build` (from vercel.json)
   - **Output Directory**: `.next` (from vercel.json)

**Validation**: Vercel triggers an initial production deployment after import.

### Step 3: Configure Environment Variables

In Vercel dashboard → Project → Settings → Environment Variables:

| Key | Value | Environments |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://avgtvtpjiswrgndvirvu.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (from `.env.local`) | Production, Preview, Development |

Click "Save" — this triggers a redeploy with the new variables.

**Validation**: After redeploy, visit the production URL and verify the application loads data from Supabase (e.g., projects list renders).

### Step 4: Verify Production Deployment

1. Push any commit to the `main` branch
2. Go to the Vercel dashboard → Deployments tab
3. Verify a deployment starts automatically
4. Wait for "Ready" status (typically 1-2 minutes)
5. Visit the production URL shown in the dashboard

**Validation**: The application loads at the Vercel production URL with all pages functional.

### Step 5: Verify Preview Deployments

1. Create a new branch and push it: `git checkout -b test-preview && git push -u origin test-preview`
2. Open a pull request from `test-preview` to `main` on GitHub
3. Wait for Vercel bot to post a comment with the preview URL on the PR
4. Click the preview URL and verify the app loads

**Validation**: The PR shows a ✅ deployment status check and a comment with the preview URL.

### Step 6: Verify Failed Deployment Rollback

1. Push a commit to `main` that introduces a build error (e.g., broken import)
2. Wait for the deployment to fail
3. Visit the production URL — the previous working deployment should still be live
4. Revert the broken commit and push — deployment succeeds again

**Validation**: Failed deployments do not cause production downtime.

## Test Scenarios

### VS-001: Production Deploy on Push

```bash
git checkout main
echo "// test" >> README.md
git add README.md && git commit -m "test: verify auto deploy"
git push
```
**Expect**: Vercel dashboard shows a new deployment triggered within 60 seconds. Production URL reflects the change.

### VS-002: Preview Deploy on PR

```bash
git checkout -b preview-test
echo "// test" >> README.md
git add README.md && git commit -m "test: verify preview deploy"
git push -u origin preview-test
# Then open a PR on GitHub
```
**Expect**: Vercel bot posts a comment with preview URL on the PR within 2 minutes.

### VS-003: Environment Variables Loaded

1. Visit the production deployment URL
2. Navigate to `/projects` (or any page that fetches from Supabase)
3. Open browser DevTools → Network tab
4. Verify Supabase API requests succeed (200 responses)

**Expect**: Application successfully connects to Supabase — no connection errors in console.

### VS-004: All Routes Functional

Visit each route on the production URL and verify it renders:
- `/` — Dashboard
- `/projects` — Project list
- `/projects/new` — Create project form
- `/project-info` — Project info page

**Expect**: All routes render without errors.
