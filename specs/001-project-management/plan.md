# Implementation Plan: Project Management

**Branch**: `001-project-management` | **Date**: 2026-06-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-project-management/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement full CRUD for project management in SpecFlow Lite — the top-level organizational container for all spec-driven development artifacts. Users can create, view, edit, archive, restore, and soft-delete projects with optimistic concurrency control, search/filter, and pagination. The feature uses Next.js App Router with server components, Supabase with Row-Level Security, Mantine UI for the component library, TanStack Query for server state, Zod for validation, and Playwright for E2E testing.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: Next.js 14+ (App Router), Supabase (auth + database), Mantine UI 7.x, TanStack Query 5.x, Zod 3.x, Playwright 1.x

**Storage**: PostgreSQL 15 (via Supabase), with RLS policies and database triggers

**Testing**: Playwright (E2E), Vitest (unit/integration)

**Target Platform**: Web — Vercel deployment, modern browsers (Chrome, Firefox, Safari, Edge)

**Project Type**: Web application — Next.js App Router with server components (backend + frontend monolith)

**Performance Goals**: Project list <300ms p95 (20 items), create <500ms p95, search/filter <400ms p95

**Constraints**: RLS-enforced single-owner access, optimistic locking via `updated_at`, soft-delete with 30-day retention, offset pagination (page size 20)

**Scale/Scope**: Single-user ownership per project, flat project list, 6 user stories across 3 priority levels

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check (Phase 0)

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Specification-First | ✅ PASS | Spec approved at `specs/001-project-management/spec.md` with 6 user stories, 21 FRs, 7 success criteria |
| II. Test-First with UI Verification | ✅ PASS | Plan includes Playwright E2E tests per story; QA Agent + Reviewer Agent gates in task workflow |
| III. Security by Default | ✅ PASS | RLS policies planned for all tables; Zod validation on all routes; `owner_id` scoping; generic 404 for non-owners |
| IV. AI-Assisted but Human-Reviewed | ✅ PASS | BA Agent produced analysis; Architect Agent produces this plan; QA + Reviewer agents gate before merge |
| V. Component Simplicity | ✅ PASS | Components decomposed by responsibility: ProjectCard, ProjectList, ProjectForm, EmptyState, DeleteConfirmModal — each <150 lines |

### Post-Design Check (Phase 1)

*Re-checked after data-model.md and contracts generated.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Specification-First | ✅ PASS | Design artifacts trace to all 21 FRs |
| II. Test-First with UI Verification | ✅ PASS | Contracts define API shapes testable before implementation; quickstart.md defines E2E validation |
| III. Security by Default | ✅ PASS | data-model.md specifies RLS policies per table; contracts define Zod schemas; `updated_at` optimistic locking in update contract |
| IV. AI-Assisted but Human-Reviewed | ✅ PASS | Plan ready for Architect → Developer → QA → Reviewer pipeline |
| V. Component Simplicity | ✅ PASS | Component tree in quickstart.md confirms each component has single responsibility |

**GATE RESULT: ALL PASSES — No violations to justify.**

## Project Structure

### Documentation (this feature)

```text
specs/001-project-management/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── projects-api.yaml    # REST API contract (OpenAPI)
│   └── zod-schemas.md       # Zod validation schemas
├── checklists/          # Quality checklists
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
app/                          # Next.js App Router
├── layout.tsx                # Root layout (providers: Mantine, QueryClient, Supabase)
├── page.tsx                  # Root page (redirect to /projects)
├── auth/
│   ├── login/
│   │   └── page.tsx          # Login page
│   └── callback/
│       └── route.ts          # Auth callback handler
├── projects/
│   ├── page.tsx              # Project list (dashboard)
│   ├── new/
│   │   └── page.tsx          # Create project form
│   └── [projectId]/
│       ├── page.tsx          # Project detail view
│       └── settings/
│           └── page.tsx      # Edit project metadata
├── api/
│   └── projects/
│       ├── route.ts           # GET (list) + POST (create)
│       └── [projectId]/
│           ├── route.ts       # GET (detail) + PATCH (update) + DELETE
│           ├── archive/
│           │   └── route.ts   # POST archive / restore
│           └── status/
│               └── route.ts   # PATCH status transition
└── components/
    ├── projects/
    │   ├── project-card.tsx       # Single project display card
    │   ├── project-list.tsx       # Project list with search + filter
    │   ├── project-form.tsx       # Create/edit project form
    │   ├── empty-state.tsx        # Empty-state onboarding
    │   ├── delete-confirm.tsx     # Delete confirmation modal
    │   └── status-badge.tsx       # Status indicator badge
    ├── ui/
    │   ├── search-input.tsx       # Debounced search input
    │   └── status-filter.tsx      # Status dropdown filter
    └── layout/
        ├── app-shell.tsx         # Mantine AppShell wrapper
        └── navbar.tsx            # Navigation sidebar

lib/
├── supabase/
│   ├── client.ts            # Supabase browser client
│   ├── server.ts            # Supabase server client
│   └── middleware.ts        # Auth middleware
├── validators/
│   └── project.ts           # Zod schemas for projects
├── hooks/
│   ├── use-projects.ts      # TanStack Query hooks for project list
│   ├── use-project.ts       # TanStack Query hook for single project
│   └── use-project-mutations.ts  # Create/update/archive/delete mutations
├── types/
│   └── project.ts           # TypeScript types (inferred from Zod)
└── constants/
    └── project.ts           # Status enum, page size, validation limits

tests/
├── e2e/
│   ├── projects-create.spec.ts
│   ├── projects-list.spec.ts
│   ├── projects-detail.spec.ts
│   ├── projects-edit.spec.ts
│   ├── projects-archive.spec.ts
│   └── projects-delete.spec.ts
├── integration/
│   └── projects-api.test.ts
└── unit/
    ├── project-validator.test.ts
    └── project-status.test.ts

supabase/
└── migrations/
    └── 001_create_projects.sql
```

**Structure Decision**: Web application (Option 2) using Next.js App Router. Server components handle data fetching; client components handle interactivity (forms, modals, search). API routes under `app/api/` serve as the backend layer. Supabase migrations manage the database schema. Tests split by E2E (Playwright), integration (Vitest + Supertest), and unit (Vitest).

## Complexity Tracking

> No constitution violations to justify. All principles pass.
