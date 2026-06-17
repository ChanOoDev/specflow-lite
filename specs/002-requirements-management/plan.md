# Implementation Plan: Requirements Management

**Branch**: `002-requirements-management` | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-requirements-management/spec.md`

## Summary

Implement CRUD for requirements within projects — the second artifact in the SpecFlow Lite workflow. Users create, browse, view, edit, and soft-delete requirements scoped to a project. Requirements have type (functional/non-functional/technical/UX), priority (P1–P5), and status with a defined state machine (draft → approved → implemented, draft → deferred). The feature nests under existing project routes, reuses the established stack (Next.js App Router, Supabase RLS, Mantine UI, TanStack Query, Zod, Playwright), and updates the project detail page with real requirement counts.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: Next.js 14+ (App Router), Supabase (auth + database), Mantine UI 9.x, TanStack Query 5.x, Zod 4.x, Playwright 1.61

**Storage**: PostgreSQL 15 (via Supabase), with RLS policies and database triggers

**Testing**: Playwright (E2E), Vitest (unit/integration)

**Target Platform**: Web — Vercel deployment, modern browsers

**Project Type**: Web application — Next.js App Router with server components

**Performance Goals**: Requirement list <500ms p95 (50 items), create <300ms p95, search/filter <300ms p95

**Constraints**: RLS-enforced single-owner access, optimistic locking via `updated_at`, soft-delete with 30-day retention, offset pagination (page size 20), nested under project routes

**Scale/Scope**: Single-user ownership, flat requirement list, 6 user stories across 3 priority levels

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check (Phase 0)

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Specification-First | ✅ PASS | Spec at `specs/002-requirements-management/spec.md` with 6 user stories, 18 FRs, 5 success criteria |
| II. Test-First with UI Verification | ✅ PASS | Plan includes Playwright E2E per story; QA + Reviewer gates |
| III. Security by Default | ✅ PASS | RLS via owner_id (mirrored from parent project); Zod on all routes; generic 404 for non-owners |
| IV. AI-Assisted but Human-Reviewed | ✅ PASS | Spec/plan reviewed by human before implementation |
| V. Component Simplicity | ✅ PASS | Components under 150 lines: RequirementCard, RequirementList, RequirementForm, etc. |

**GATE RESULT: ALL PASSES**

## Project Structure

### Documentation (this feature)

```text
specs/002-requirements-management/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── requirements-api.yaml
│   └── zod-schemas.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output
```

### Source Code (changes from 001)

```text
app/
├── api/
│   └── projects/
│       └── [projectId]/
│           └── requirements/                    # NEW
│               ├── route.ts                     # GET list + POST create
│               └── [requirementId]/
│                   └── route.ts                 # GET detail + PATCH update + DELETE
├── projects/
│   └── [projectId]/
│       ├── page.tsx                              # UPDATE: real requirement count
│       └── requirements/                        # NEW
│           ├── page.tsx                          # Requirement list page
│           ├── new/
│           │   └── page.tsx                      # Create requirement form
│           └── [requirementId]/
│               ├── page.tsx                      # Requirement detail
│               └── edit/
│                   └── page.tsx                  # Edit requirement form
└── components/
    └── requirements/                            # NEW
        ├── requirement-card.tsx
        ├── requirement-list.tsx
        ├── requirement-form.tsx
        ├── requirement-detail.tsx
        ├── requirement-delete-confirm.tsx
        ├── type-badge.tsx
        ├── priority-badge.tsx
        └── requirement-empty-state.tsx

lib/
├── constants/
│   └── requirement.ts                           # NEW: enums, transitions, limits
├── helpers/
│   └── requirement-response.ts                  # NEW: shared response builder
├── hooks/
│   ├── use-requirements.ts                      # NEW: TanStack Query list hook
│   ├── use-requirement.ts                       # NEW: TanStack Query single hook
│   └── use-requirement-mutations.ts             # NEW: create/update/delete mutations
├── types/
│   └── requirement.ts                           # NEW: TypeScript interfaces
└── validators/
    └── requirement.ts                           # NEW: Zod schemas + transition validator

tests/
├── e2e/
│   ├── requirements-create.spec.ts
│   ├── requirements-list.spec.ts
│   ├── requirements-detail.spec.ts
│   ├── requirements-edit.spec.ts
│   └── requirements-delete.spec.ts
├── integration/
│   └── requirements-api.test.ts
└── unit/
    ├── requirement-validator.test.ts
    └── requirement-status.test.ts

supabase/
└── migrations/
    └── 002_create_requirements.sql               # NEW
```

### Post-Design Check (Phase 1)

*Re-checked after data-model.md and contracts generated.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Specification-First | ✅ PASS | Spec unchanged; design artifacts trace to spec FR-001–FR-018 |
| II. Test-First with UI Verification | ✅ PASS | 5 E2E specs, 2 integration, 2 unit tests planned; quickstart validates per-story |
| III. Security by Default | ✅ PASS | RLS with denormalized `owner_id` (set by DB trigger); Zod on all API inputs; generic 404 for non-owners |
| IV. AI-Assisted but Human-Reviewed | ✅ PASS | Plan will feed into tasks → implementation → QA → reviewer pipeline |
| V. Component Simplicity | ✅ PASS | 8 components planned, each <150 lines: RequirementCard, RequirementList, RequirementForm, RequirementDetail, RequirementDeleteConfirm, TypeBadge, PriorityBadge, RequirementEmptyState |

**GATE RESULT: ALL PASSES (POST-DESIGN)**

## Complexity Tracking

> No constitution violations to justify. All principles pass both pre-design and post-design checks.

## Phase 0 Research Summary

All research decisions resolved in [research.md](./research.md):

| ID | Topic | Decision |
|----|-------|----------|
| R1 | RLS Policy | Denormalize `owner_id` on requirements, same `auth.uid()` pattern |
| R2 | TanStack Query | Hierarchical keys `['projects', projectId, 'requirements', ...]` |
| R3 | Forms + Zod | `@mantine/form` + `mantine-form-zod-resolver` |
| R4 | Route Structure | Nested under `projects/[projectId]/requirements/` |
| R5 | Optimistic Locking | `updated_at` comparison, 409 CONFLICT on mismatch |
| R6 | Soft Delete | `deleted_at` marker, parent project filter handles cascade |
| R7 | Status Machine | Application-layer validation, shared between client/server |

## Generated Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Research | `specs/002-requirements-management/research.md` | ✅ |
| Data Model | `specs/002-requirements-management/data-model.md` | ✅ |
| API Contract | `specs/002-requirements-management/contracts/requirements-api.yaml` | ✅ |
| Zod Schemas | `specs/002-requirements-management/contracts/zod-schemas.md` | ✅ |
| Quickstart | `specs/002-requirements-management/quickstart.md` | ✅ |
| Quality Checklist | `specs/002-requirements-management/checklists/requirements.md` | ✅ |
