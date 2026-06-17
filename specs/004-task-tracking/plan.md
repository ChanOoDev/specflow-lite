# Implementation Plan: Task & Implementation Tracking

**Branch**: `feature/004-task-tracking` | **Date**: 2026-06-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-task-tracking/spec.md`

## Summary

Implement CRUD for tasks within specifications — the fourth and final artifact in the SpecFlow Lite workflow. Users create, browse, view, edit, reorder, and soft-delete tasks scoped to a specification. Tasks track implementation progress with a three-status lifecycle (todo → in_progress → done) and position-based manual ordering. The feature nests under existing specification pages, extends the project detail with real task counts, and adds a task completion summary to the specification detail view. All patterns are established: the task table follows the same RLS denormalization, soft-delete, optimistic locking, and nested routing conventions as requirements (002) and specifications (003).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: Next.js 16 (App Router), Supabase (auth + database), Mantine UI 9.x, TanStack Query 5.x, Zod 4.x, Playwright 1.61

**Storage**: PostgreSQL 15 (via Supabase), with RLS policies, database triggers, position-based ordering (integer column)

**Testing**: Playwright (E2E), Vitest (unit/integration)

**Target Platform**: Web — Vercel deployment, modern browsers

**Project Type**: Web application — Next.js App Router with client components

**Performance Goals**: Task list <500ms p95 (50 items), create <300ms p95, status update <200ms p95, count refresh within 3 seconds of mutation

**Constraints**: RLS-enforced single-owner access, optimistic locking via `updated_at`, soft-delete with 30-day retention, offset pagination (page size 20, max 50), nested under specification routes, tasks locked when parent spec is approved

**Scale/Scope**: Single-user ownership, per-specification task list, 6 user stories across 3 priority levels, 3 statuses, position-based ordering

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check (Phase 0)

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Specification-First | ✅ PASS | Spec at `specs/004-task-tracking/spec.md` with 6 user stories, 18 FRs, 7 success criteria |
| II. Test-First with UI Verification | ✅ PASS | Plan includes Playwright E2E per story; unit tests for validators/status; QA + Reviewer gates |
| III. Security by Default | ✅ PASS | RLS via denormalized `owner_id` (from specification → project); Zod on all routes; generic 404 for non-owners; no unauthenticated access paths |
| IV. AI-Assisted but Human-Reviewed | ✅ PASS | Spec/plan reviewed by human before implementation |
| V. Component Simplicity | ✅ PASS | Components under 150 lines: TaskCard, TaskList, TaskForm, TaskDetail, TaskDeleteConfirm, TaskEmptyState, TaskStatusBadge |

**GATE RESULT: ALL PASSES**

## Project Structure

### Documentation (this feature)

```text
specs/004-task-tracking/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── tasks-api.yaml
├── checklists/          # Quality checklists
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
supabase/
├── migrations/
│   ├── 001_create_projects.sql       # Existing
│   ├── 002_create_requirements.sql   # Existing
│   ├── 003_create_specifications.sql # Existing
│   └── 004_create_tasks.sql          # NEW

app/
├── api/projects/
│   └── [projectId]/
│       ├── specifications/
│       │   └── [specificationId]/
│       │       └── tasks/              # NEW nested route
│       │           ├── route.ts        # GET list + POST create
│       │           └── [taskId]/
│       │               └── route.ts    # GET, PATCH, DELETE
├── projects/[projectId]/
│   ├── page.tsx                        # UPDATE: real task counts (was stubbed)
│   └── specifications/
│       └── [specificationId]/
│           ├── page.tsx                # UPDATE: add task list + completion summary
│           └── tasks/                  # NEW pages
│               ├── page.tsx            # Task list page (standalone view)
│               ├── new/
│               │   └── page.tsx        # Create task form
│               └── [taskId]/
│                   ├── page.tsx        # Task detail view
│                   └── edit/
│                       └── page.tsx    # Edit task form
├── components/tasks/                   # NEW components
│   ├── task-card.tsx
│   ├── task-list.tsx
│   ├── task-form.tsx
│   ├── task-detail.tsx
│   ├── task-empty-state.tsx
│   ├── task-delete-confirm.tsx
│   └── task-status-badge.tsx

lib/
├── types/
│   └── task.ts                         # NEW
├── constants/
│   └── task.ts                         # NEW
├── validators/
│   └── task.ts                         # NEW
├── helpers/
│   └── task-response.ts                # NEW
└── hooks/
    ├── use-tasks.ts                    # NEW list hook
    ├── use-task.ts                     # NEW single hook
    └── use-task-mutations.ts           # NEW mutations

tests/
├── unit/
│   ├── task-validator.test.ts
│   └── task-status.test.ts
├── integration/
│   └── tasks-api.test.ts
└── e2e/
    ├── tasks-create.spec.ts
    ├── tasks-list.spec.ts
    ├── tasks-detail.spec.ts
    ├── tasks-edit.spec.ts
    └── tasks-delete.spec.ts
```

**Structure Decision**: Single-project Next.js App Router layout as established by 001–003. Tasks nest under specifications (`app/api/projects/[projectId]/specifications/[specificationId]/tasks/`) following the established nested route pattern. No junction table needed (tasks don't link to other entities). The specification detail page is extended with task progress tracking; a standalone task list page provides a focused working surface.

## Complexity Tracking

> No constitution violations. All principles pass pre-design.
