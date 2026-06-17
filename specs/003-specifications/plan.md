# Implementation Plan: Specification Management

**Branch**: `feature/003-specifications` | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-specifications/spec.md`

## Summary

Implement CRUD for specifications within projects — the third artifact in the SpecFlow Lite workflow. Users create, browse, view, edit, and soft-delete specifications scoped to a project. Specifications can link to approved requirements via a junction table, creating traceability from requirements through to implementation. Specifications have a four-status lifecycle (draft → in_progress → completed → approved) with enforced transitions. The feature nests under existing project routes, reuses the established stack (Next.js App Router, Supabase RLS, Mantine UI, TanStack Query, Zod, Vitest/Playwright), and updates the project detail page with real specification counts.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: Next.js 16 (App Router), Supabase (auth + database), Mantine UI 9.x, TanStack Query 5.x, Zod 4.x, Playwright 1.61

**Storage**: PostgreSQL 15 (via Supabase), with RLS policies, database triggers, and a junction table (specification_requirements)

**Testing**: Playwright (E2E), Vitest (unit/integration)

**Target Platform**: Web — Vercel deployment, modern browsers

**Project Type**: Web application — Next.js App Router with server components

**Performance Goals**: Specification list <500ms p95 (50 items), create <300ms p95, link/unlink requirements <200ms p95

**Constraints**: RLS-enforced single-owner access, optimistic locking via `updated_at`, soft-delete with 30-day retention, offset pagination (page size 20), nested under project routes, only approved requirements can be linked

**Scale/Scope**: Single-user ownership, flat specification list, 6 user stories across 3 priority levels, junction to requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check (Phase 0)

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Specification-First | ✅ PASS | Spec at `specs/003-specifications/spec.md` with 6 user stories, 18 FRs, 6 success criteria |
| II. Test-First with UI Verification | ✅ PASS | Plan includes Playwright E2E per story; unit tests for validators/status; QA + Reviewer gates |
| III. Security by Default | ✅ PASS | RLS via denormalized `owner_id` (mirrored from parent project); Zod on all routes; generic 404 for non-owners; junction table scoped to project |
| IV. AI-Assisted but Human-Reviewed | ✅ PASS | Spec/plan reviewed by human before implementation |
| V. Component Simplicity | ✅ PASS | Components under 150 lines: SpecificationCard, SpecificationList, SpecificationForm, SpecificationDetail, SpecificationDeleteConfirm, SpecificationEmptyState |

**GATE RESULT: ALL PASSES**

## Project Structure

### Documentation (this feature)

```text
specs/003-specifications/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── specifications-api.yaml
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
│   └── 003_create_specifications.sql # NEW

app/
├── api/projects/
│   └── [projectId]/
│       └── specifications/           # NEW nested route
│           ├── route.ts              # GET list + POST create
│           └── [specificationId]/
│               └── route.ts          # GET, PATCH, DELETE
├── projects/[projectId]/
│   ├── page.tsx                      # Update: real spec counts
│   └── specifications/               # NEW pages
│       ├── page.tsx                  # List page
│       ├── new/
│       │   └── page.tsx              # Create form
│       └── [specificationId]/
│           ├── page.tsx              # Detail view
│           └── edit/
│               └── page.tsx          # Edit form
├── components/specifications/        # NEW components
│   ├── specification-card.tsx
│   ├── specification-list.tsx
│   ├── specification-form.tsx
│   ├── specification-detail.tsx
│   ├── specification-empty-state.tsx
│   ├── specification-delete-confirm.tsx
│   ├── spec-status-badge.tsx
│   └── requirement-link-selector.tsx # Multi-select for linking requirements

lib/
├── types/
│   └── specification.ts              # NEW
├── constants/
│   └── specification.ts              # NEW
├── validators/
│   └── specification.ts              # NEW
├── helpers/
│   └── specification-response.ts     # NEW
└── hooks/
    ├── use-specifications.ts         # NEW list hook
    ├── use-specification.ts          # NEW single hook
    └── use-specification-mutations.ts # NEW mutations

tests/
├── unit/
│   ├── specification-validator.test.ts
│   └── specification-status.test.ts
├── integration/
│   └── specifications-api.test.ts
└── e2e/
    ├── specifications-create.spec.ts
    ├── specifications-list.spec.ts
    ├── specifications-detail.spec.ts
    ├── specifications-edit.spec.ts
    └── specifications-delete.spec.ts
```

**Structure Decision**: Single-project Next.js App Router layout as established by 001 and 002. Specifications nest under projects (`app/api/projects/[projectId]/specifications/`) following the exact pattern from requirements. A junction table (`specification_requirements`) links specifications to requirements. Pages follow the `[projectId]/specifications/[specificationId]` nested pattern.

## Complexity Tracking

> No constitution violations. All principles pass pre-design.
