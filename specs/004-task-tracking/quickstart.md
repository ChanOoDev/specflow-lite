# Quickstart: Task & Implementation Tracking

**Feature**: 004-task-tracking
**Date**: 2026-06-18

## Prerequisites

- Projects (001), requirements (002), and specifications (003) implemented and running
- Dev server: `npm run dev`
- Supabase local or remote instance with migrations applied
- At least one project with at least one specification

## Setup

### 1. Apply Database Migration

Apply the migration in Supabase dashboard or CLI:

```bash
# If using Supabase CLI:
npx supabase db push

# Or manually run in Supabase SQL editor:
# Copy contents of supabase/migrations/004_create_tasks.sql
```

### 2. Start Dev Server

```bash
npm run dev
# → http://localhost:3000
```

## Manual Validation Scenarios

### US1: Create a Task

1. Navigate to a project → Specifications → click a specification
2. Click "Add Task" button (or navigate to `/projects/<projectId>/specifications/<specificationId>/tasks/new`)
3. Fill in title (e.g., "Set up database schema")
4. Enter description: "Create the tasks table with indexes and RLS policies"
5. Click "Create Task"
6. ✅ **Expected**: Redirected to task list; new task appears with "todo" status and last position
7. Try submitting with empty title → ✅ validation error displayed
8. Try submitting title >200 chars → ✅ validation error displayed

### US2: Browse & Filter Tasks

1. Create 5 tasks with varied titles
2. Navigate to the task list (embedded in spec detail or standalone `/tasks`)
3. ✅ **Expected**: All 5 appear ordered by position (1, 2, 3, 4, 5) with status badges
4. Mark task 2 as "done"
5. Type a partial title in the search box
6. ✅ **Expected**: List filters to matching tasks (case-insensitive)
7. Select status filter "done"
8. ✅ **Expected**: Only tasks with "done" status shown
9. Check pagination (if >20 tasks)
10. ✅ **Expected**: Pagination controls appear and load next page
11. Delete all tasks from a specification → ✅ empty state with "Add Your First Task" CTA

### US3: Edit Task & Reorder

1. Click a "todo" task in the list → task detail view
2. Click "Edit"
3. Change title, change status to "in_progress"
4. ✅ **Expected**: Status badge updates to blue "in_progress"
5. Change status to "done" → ✅ badge updates to green "done"
6. Attempt to change a "todo" task directly to "done"
7. ✅ **Expected**: Error message explaining the transition must go through in_progress
8. Change position from 3 to 1
9. ✅ **Expected**: Task moves to position 1, other tasks shift
10. Open the same task in two tabs; edit in one, save; edit in the other, save
11. ✅ **Expected**: Second save shows conflict error

### US4: View Task Detail

1. Click a task in the task list
2. ✅ **Expected**: Detail view shows title, description, status badge, position, parent specification name, created date, updated date
3. Sign in as a different user, navigate to the same URL
4. ✅ **Expected**: "Task Not Found" page (404)

### US5: Delete a Task

1. View a task with position 2 (of 3 tasks)
2. Click "Delete"
3. ✅ **Expected**: Confirmation modal appears, prompts to type task title
4. Cancel the confirmation → ✅ task remains unchanged
5. Type the exact title and confirm
6. ✅ **Expected**: Redirected to task list; task gone; remaining tasks show positions 1, 2

### US6: Task Progress Tracking

1. View a specification with 3 tasks (1 done, 1 in_progress, 1 todo)
2. ✅ **Expected**: Spec detail shows "1 of 3 tasks done"
3. Change in_progress task to done
4. ✅ **Expected**: Spec detail updates to "2 of 3 tasks done" within 3 seconds
5. View the project detail page
6. ✅ **Expected**: Task cards show real total and completed counts (not stubbed zeros)
7. Create a spec with 0 tasks → ✅ shows "0 of 0 tasks"

### Cross-Cutting Checks

- ✅ No browser console errors on all task pages
- ✅ Responsive layout at 375px mobile and 1280px desktop
- ✅ TypeScript `tsc --noEmit` passes clean
- ✅ Approved specification: task create/edit/delete all rejected
- ✅ Archived project: task create/edit/delete all rejected

## Running Tests

```bash
# Unit tests
npx vitest run tests/unit/task-validator.test.ts
npx vitest run tests/unit/task-status.test.ts

# Integration tests
npx vitest run tests/integration/tasks-api.test.ts

# E2E tests
npx playwright test tests/e2e/tasks-create.spec.ts
npx playwright test tests/e2e/tasks-list.spec.ts
npx playwright test tests/e2e/tasks-detail.spec.ts
npx playwright test tests/e2e/tasks-edit.spec.ts
npx playwright test tests/e2e/tasks-delete.spec.ts
```
