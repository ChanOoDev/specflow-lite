# Quickstart: Specification Management

**Feature**: 003-specifications
**Date**: 2026-06-17

## Prerequisites

- Project 001 (projects) and 002 (requirements) implemented and running
- Dev server: `npm run dev`
- Supabase local or remote instance with migrations applied
- At least one project with at least one approved requirement

## Setup

### 1. Apply Database Migration

Apply the migration in Supabase dashboard or CLI:

```bash
# If using Supabase CLI (if configured):
supabase db push

# Or manually run in Supabase SQL editor:
# Copy contents of supabase/migrations/003_create_specifications.sql
```

### 2. Start Dev Server

```bash
npm run dev
# → http://localhost:3000
```

## Manual Validation Scenarios

### US1: Create a Specification

1. Navigate to a project → Requirements list
2. Approve at least one requirement (click, Edit, change status to Approved, Save)
3. Navigate to `http://localhost:3000/projects/<projectId>/specifications`
4. Click "New Specification"
5. Fill in title (e.g., "Login System Spec")
6. Enter description: "Technical specification for the authentication system"
7. Optionally select approved requirements to link
8. Click "Create Specification"
9. ✅ **Expected**: Redirected to specifications list; new spec appears with "draft" status

### US2: Browse & Search Specifications

1. Create 3 specifications with different titles
2. Navigate to specifications list
3. ✅ **Expected**: All 3 appear, ordered by most recently updated
4. Type partial title in search box
5. ✅ **Expected**: List filters to matching specs (case-insensitive)
6. Select a status filter
7. ✅ **Expected**: Only specs with that status shown
8. Check pagination (if > 20 specs)
9. ✅ **Expected**: Pagination controls appear and load next page

### US3: View Specification Detail

1. Click a specification in the list
2. ✅ **Expected**: Detail page shows title, description, status badge, linked requirements (each with title/type/priority/status), created date, updated date
3. ✅ **Expected**: Edit and Delete buttons visible
4. Sign in as a different user, navigate to the same URL
5. ✅ **Expected**: "Specification Not Found" page (404)

### US4: Edit Specification & Link Requirements

1. View a "draft" specification
2. Click "Edit"
3. Change title, link approved requirements, change status to "in_progress"
4. Click "Save Changes"
5. ✅ **Expected**: Detail page shows updated title, new status "in_progress", linked requirements
6. Attempt invalid transition (e.g., completed → in_progress)
7. ✅ **Expected**: Error message with allowed transitions

### US5: Delete a Specification

1. View a specification with linked requirements
2. Click "Delete"
3. ✅ **Expected**: Confirmation modal appears, prompts to type spec title
4. Type the exact title and confirm
5. ✅ **Expected**: Redirected to list; spec gone from list
6. Navigate to the linked requirements' pages
7. ✅ **Expected**: Requirements still exist, no longer linked to this spec

### US6: Status Workflow

1. Create a spec → status: draft
2. Edit → change to "in_progress" → ✅ allowed
3. Edit → change to "completed" → ✅ allowed
4. Edit → change to "approved" → ✅ allowed
5. Edit → verify no status options available (terminal)
6. ✅ **Expected**: Approved specs show "approved" badge but cannot be edited further

### Cross-Cutting Checks

- ✅ No browser console errors on all spec pages
- ✅ Responsive layout at 375px mobile and 1280px desktop
- ✅ TypeScript `tsc --noEmit` passes clean
- ✅ All unit tests pass: `npx vitest run tests/unit/specification-*.test.ts`
- ✅ All integration tests pass: `npx vitest run tests/integration/specifications-*.test.ts`

## Running Tests

```bash
# Unit tests
npx vitest run tests/unit/specification-validator.test.ts
npx vitest run tests/unit/specification-status.test.ts

# Integration tests
npx vitest run tests/integration/specifications-api.test.ts

# E2E tests
npx playwright test tests/e2e/specifications-create.spec.ts
npx playwright test tests/e2e/specifications-list.spec.ts
npx playwright test tests/e2e/specifications-detail.spec.ts
npx playwright test tests/e2e/specifications-edit.spec.ts
npx playwright test tests/e2e/specifications-delete.spec.ts
```
