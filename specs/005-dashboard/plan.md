# Implementation Plan: Dashboard

**Branch**: `feature/005-dashboard` | **Date**: 2026-06-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-dashboard/spec.md`

## Summary

Build a dashboard as the default post-login landing page showing aggregated project health metrics, recent project quick-access, and an open tasks list — all scoped to the authenticated user. A new `GET /api/dashboard` endpoint returns all dashboard data in a single response. Recent project tracking uses browser localStorage. The existing `app/page.tsx` root route is repurposed from a `/projects` redirect to render the dashboard.

## Technical Context

**Language/Version**: TypeScript 6.0 (strict mode)

**Primary Dependencies**: Next.js 16, Mantine UI 9, TanStack Query 5, Supabase (ssr + supabase-js), Zod 4

**Storage**: Supabase PostgreSQL (read-only queries against existing `projects`, `requirements`, `specifications`, `tasks` tables) + browser localStorage (recent projects)

**Testing**: Vitest (unit), Playwright (E2E)

**Target Platform**: Web (Next.js App Router, server + client components)

**Project Type**: Web application (Next.js full-stack)

**Performance Goals**: Dashboard loads within 3 seconds (SC-001); single API call returns all dashboard data

**Constraints**: Dashboard data scoped to authenticated user via RLS; no real-time updates (page load + manual refresh); read-only view

**Scale/Scope**: Single-page dashboard with 3 sections; supports users with up to 50+ projects; max 5 recent projects, max 10 open tasks shown

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Specification-First | ✅ PASS | spec.md approved with 3 user stories, 11 FRs, 5 SCs |
| II. Test-First with UI Verification | ✅ PASS | Playwright E2E scenarios in quickstart.md; QA + Reviewer review before merge |
| III. Security by Default | ✅ PASS | API authenticated via Supabase session; RLS enforced on all queried tables; Zod validation on API response; no secrets in code |
| IV. AI-Assisted but Human-Reviewed | ✅ PASS | Sequential Thinking used for design; plan reviewed; multi-agent review before merge |
| V. Component Simplicity | ✅ PASS | Dashboard decomposed into small focused components (summary cards, recent projects, open tasks); server API route, client page |

**Post-Design Re-check**: ✅ All principles remain satisfied. Data model introduces no new tables (read-only). Contracts define single API endpoint. Components are small and single-purpose.

## Project Structure

### Documentation (this feature)

```text
specs/005-dashboard/
├── plan.md              # This file
├── research.md          # Phase 0: architecture decisions
├── data-model.md        # Phase 1: entity definitions
├── quickstart.md        # Phase 1: validation scenarios
├── contracts/           # Phase 1: API contract
│   └── dashboard-api.md
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
app/
├── page.tsx                        # REPURPOSED: dashboard page (was redirect to /projects)
├── layout.tsx                      # UNCHANGED: root layout with providers
├── providers.tsx                   # UNCHANGED: TanStack Query + Mantine
├── api/
│   └── dashboard/
│       └── route.ts                # NEW: GET /api/dashboard
├── components/
│   ├── layout/
│   │   ├── app-shell.tsx           # UNCHANGED
│   │   └── navbar.tsx              # UPDATED: add "Dashboard" nav item
│   └── dashboard/
│       ├── dashboard-page.tsx      # NEW: main dashboard client component
│       ├── dashboard-skeleton.tsx  # NEW: loading skeleton
│       ├── dashboard-empty.tsx     # NEW: empty state for new users
│       ├── summary-cards.tsx       # NEW: aggregate count cards
│       ├── recent-projects.tsx     # NEW: recent projects section
│       └── open-tasks.tsx          # NEW: open tasks list section
├── projects/
│   ├── layout.tsx                  # UPDATED: track recent project access
│   └── [projectId]/
│       └── layout.tsx              # UPDATED: track recent project access
lib/
├── hooks/
│   └── use-dashboard.ts            # NEW: TanStack Query hook for dashboard
├── types/
│   └── dashboard.ts                # NEW: DashboardResponse type
└── validators/
    └── dashboard.ts                # NEW: dashboard response validation schema
```

**Structure Decision**: Web application (Option 2). Single Next.js app with App Router. Dashboard is a new page under the existing app shell layout. Components follow the existing pattern (`app/components/dashboard/`). API route follows the existing pattern (`app/api/dashboard/`). Types, hooks, and validators follow the established `lib/` conventions.

## Complexity Tracking

> No Constitution violations — this section intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
