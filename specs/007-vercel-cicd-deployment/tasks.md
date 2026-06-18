# Tasks: Vercel CI/CD Deployment

**Input**: Design documents from `specs/007-vercel-cicd-deployment/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Config file**: Repository root (`vercel.json`)
- **Dashboard**: Vercel web dashboard (no file changes)

---

## Phase 1: Setup — Repository Configuration

**Purpose**: Create the only repository-side file required for deployment

- [ ] T001 Create `vercel.json` at repository root with build command, install command, framework detection, and output directory per research.md

**Checkpoint**: `vercel.json` committed and pushed — Vercel can read project configuration

---

## Phase 2: User Story 1 — Automatic Production Deployment on Push (Priority: P1) 🎯 MVP

**Goal**: Every push to `main` triggers an automatic production deployment with zero manual steps

**Independent Test**: Push a commit to `main` and verify the production URL reflects the change within 3 minutes

### Implementation for User Story 1

- [ ] T002 [US1] Import the `specflow-lite` GitHub repository into Vercel via the Vercel dashboard (vercel.com/new, sign in with GitHub, select repo)
- [ ] T003 [US1] Confirm Vercel auto-detects Next.js framework and reads settings from `vercel.json` (build command: `next build`, output: `.next`)
- [ ] T004 [US1] Set production branch to `main` in Vercel project settings (Git → Production Branch)
- [ ] T005 [US1] Trigger initial production deployment by pushing a test commit to `main`
- [ ] T006 [US1] Verify production URL loads all routes: `/`, `/projects`, `/project-info` (no build errors, no runtime errors)

**Checkpoint**: Production deploys automatically on push to main. Production URL is live and functional.

---

## Phase 3: User Story 2 — Preview Deployments for Pull Requests (Priority: P1) 🎯 MVP

**Goal**: Every PR gets a unique preview deployment URL posted as a comment/status check

**Independent Test**: Open a PR from any feature branch and verify a preview URL appears within 2 minutes

### Implementation for User Story 2

- [ ] T007 [US2] Enable PR preview deployments in Vercel project settings (Git → Pull Requests → Enable)
- [ ] T008 [US2] Enable Vercel bot PR comments with preview URLs in Vercel project settings (Git → Pull Request Comments)
- [ ] T009 [US2] Create a test branch, push it, and open a PR to verify:
  - Vercel bot posts a comment with the preview URL
  - GitHub deployment status check appears on the PR
- [ ] T010 [US2] Push an additional commit to the test PR branch and verify the preview URL updates to the latest commit

**Checkpoint**: Every PR receives a preview URL automatically. Pushing new commits updates the preview.

---

## Phase 4: User Story 3 — Environment Variable Management (Priority: P2)

**Goal**: Supabase credentials are securely injected at build time; app functions in both production and preview

**Independent Test**: Deployed app successfully connects to Supabase (projects list loads, no connection errors in console)

### Implementation for User Story 3

- [ ] T011 [US3] Add `NEXT_PUBLIC_SUPABASE_URL` to Vercel environment variables for Production, Preview, and Development environments
- [ ] T012 [US3] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel environment variables for Production, Preview, and Development environments
- [ ] T013 [US3] Verify env vars loaded: visit production URL → navigate to `/projects` → confirm Supabase data loads without console errors
- [ ] T014 [US3] Verify env vars in preview: visit a PR preview URL → confirm Supabase data loads

**Checkpoint**: Production and preview deployments both connect to Supabase successfully.

---

## Phase 5: User Story 4 — Build Configuration (Priority: P2)

**Goal**: Build is correctly configured and all routes resolve; caching is optimal

**Independent Test**: `next build` completes in the deployment environment, all routes render correctly

### Implementation for User Story 4

- [ ] T015 [US4] Verify build logs in Vercel dashboard show: Next.js framework detected, `next build` runs, output is `.next`
- [ ] T016 [US4] Verify all routes resolve on production URL: `/`, `/projects`, `/projects/new`, `/project-info`, `/auth/login`
- [ ] T017 [US4] Verify static assets (JS, CSS) are served with appropriate cache headers (check Network tab for cache-hit on reload)

**Checkpoint**: Build is optimized and all routes work. Configuration matches local production builds.

---

## Phase 6: User Story 5 — Deployment Monitoring and Notifications (Priority: P3)

**Goal**: Deployment status is visible on GitHub; failed deployment logs are accessible

**Independent Test**: Trigger a failed deployment and verify the failure is visible as a GitHub status check with accessible logs

### Implementation for User Story 5

- [ ] T018 [US5] Verify deployment status checks appear on GitHub commits to `main` (green check for success, red X for failure)
- [ ] T019 [US5] Verify Vercel dashboard → Deployments tab shows deployment history with timestamps, commit SHAs, and statuses
- [ ] T020 [US5] Intentionally push a broken commit to a test branch, open a PR, and verify:
  - Build failure is reported as a GitHub status check (red X)
  - Vercel build logs are accessible and show the error output
  - The previous production deployment remains live (zero-downtime rollback)

**Checkpoint**: Deployment monitoring is functional. Failures are visible and diagnosable.

---

## Phase 7: Polish & Cleanup

**Purpose**: Final verification, documentation, and cleanup

- [ ] T021 Delete test branches and preview PRs created during verification
- [ ] T022 Run full quickstart.md validation: all 4 test scenarios (VS-001 through VS-004) pass
- [ ] T023 Update `.env.local.example` comments to reference Vercel env var setup if needed

**Checkpoint**: Feature complete. CI/CD is fully operational. Test artifacts cleaned up.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — create `vercel.json` immediately
- **US1 (Phase 2)**: Depends on Setup (T001) — `vercel.json` must be pushed before Vercel import
- **US2 (Phase 3)**: Depends on US1 (T002) — Vercel project must exist to enable PR previews
- **US3 (Phase 4)**: Depends on US1 (T002) — Vercel project must exist to add env vars
- **US4 (Phase 5)**: Depends on US1 (T006) — production deployment must be live to verify routes
- **US5 (Phase 6)**: Depends on US1+US2 — monitoring checks require production + preview setup
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup — No dependencies on other stories. **BLOCKS US2, US3, US4, US5**
- **User Story 2 (P2)**: Can start after US1 project exists — Independent of US3/US4
- **User Story 3 (P2)**: Can start after US1 project exists — Independent of US2/US4
- **User Story 4 (P2)**: Can start after US1 deploy is live — Independent of US2/US3
- **User Story 5 (P3)**: Can start after US1+US2 complete — Needs both production and preview setup

### Parallel Opportunities

- US2, US3, US4 can all be configured in parallel after US1 project import is complete
- All verification tasks within a story are sequential (each depends on the prior step)
- T011 and T012 (env var config) can run in parallel (same dashboard page)

---

## Parallel Example: After US1 Complete

```bash
# Once Vercel project is imported (T002), these can run in parallel:
Task: "Enable PR preview deployments (US2)"
Task: "Configure environment variables (US3)"
Task: "Wait for production deploy, then verify routes (US4)"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup — `vercel.json`
2. Complete Phase 2: US1 — Import to Vercel, production deploy
3. Complete Phase 3: US2 — PR preview deployments
4. **STOP and VALIDATE**: Push to main deploys production; PRs get preview URLs
5. This is the minimum viable CI/CD — everything else is refinement

### Incremental Delivery

1. Setup + US1 → Production deploys on push → Deploy (MVP!)
2. US2 → Preview URLs on PRs → Deploy
3. US3 → Env vars configured → Deploy
4. US4 → Build verified → Deploy
5. US5 → Monitoring verified → Deploy
6. Polish → Cleanup + final verification → Done

### Single Developer Strategy

All tasks are sequential dashboard configuration. Total effort: ~30 minutes
1. T001: Create and push `vercel.json` (2 min)
2. T002–T006: Import to Vercel + verify production deploy (10 min)
3. T007–T010: Enable PR previews + verify (5 min)
4. T011–T014: Configure env vars + verify (5 min)
5. T015–T017: Verify build config + routes (3 min)
6. T018–T020: Verify monitoring + rollback (5 min)
7. T021–T023: Cleanup + final validation (5 min)

---

## Notes

- Only 1 file created (`vercel.json`) — all other tasks are Vercel dashboard configuration
- The GitHub integration requires OAuth authorization — must be done by the repo owner
- Environment variable values are the same across production and preview (both use the same Supabase project)
- No GitHub Actions workflows needed — Vercel GitHub App handles everything
- Preview URLs are auto-generated; no manual URL configuration needed
- The Vercel bot name in PR comments is "vercel" (or "vercel[bot]")
- Deployment logs are accessible at: Vercel Dashboard → Project → Deployments → click deployment → Build Logs
