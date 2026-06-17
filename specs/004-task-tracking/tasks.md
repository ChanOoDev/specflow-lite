# Tasks: Task & Implementation Tracking

**Input**: Design documents from `specs/004-task-tracking/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included per Constitution Principle II (Test-First with UI Verification).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app (Next.js App Router)**: `app/`, `lib/`, `supabase/`, `tests/` at repository root
- Paths follow the established pattern from features 001–003

---

## Phase 1: Setup (Database & Core Types)

**Purpose**: Database migration and shared type/constant/validator definitions

- [ ] T001 Create database migration with `tasks` table, `task_status` enum, indexes, RLS policies, and all triggers (`set_task_owner_and_project`, `check_task_mutable`, `trg_tasks_updated_at`) in `supabase/migrations/004_create_tasks.sql`
- [ ] T002 [P] Create task TypeScript types (`Task`, `TaskListQueryParams`, `TaskListResponse`) in `lib/types/task.ts`
- [ ] T003 [P] Create task constants (TASK_STATUS enum, ALLOWED_TRANSITIONS, PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, TITLE_MAX_LENGTH, DESCRIPTION_MAX_LENGTH) in `lib/constants/task.ts`
- [ ] T004 [P] Create task Zod validators (`taskStatusSchema`, `createTaskSchema`, `updateTaskSchema`, `taskListQuerySchema`, `validateTaskStatusTransition`) in `lib/validators/task.ts`

---

## Phase 2: Foundational (API Routes & Hooks)

**Purpose**: Core backend and data-fetching infrastructure that MUST be complete before ANY user story UI can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create task response builder (`buildTaskResponse`, `TaskRow` interface) in `lib/helpers/task-response.ts`
- [ ] T006 Create task query hooks (`useTasks`, `useTask`, `useCreateTask`, `useUpdateTask`, `useDeleteTask`) using TanStack Query in `lib/hooks/use-tasks.ts`, `lib/hooks/use-task.ts`, and `lib/hooks/use-task-mutations.ts`
- [ ] T007 Create GET (list with search/filter/pagination) and POST (create with validation) API route in `app/api/projects/[projectId]/specifications/[specificationId]/tasks/route.ts`
- [ ] T008 Create GET (detail), PATCH (update with optimistic locking + status transitions + position reorder), and DELETE (soft-delete with position compaction) API route in `app/api/projects/[projectId]/specifications/[specificationId]/tasks/[taskId]/route.ts`

**Checkpoint**: Foundation ready — API routes and hooks are functional; user story UI implementation can now begin

---

## Phase 3: User Story 1 - Create Tasks in a Specification (Priority: P1) 🎯 MVP

**Goal**: Project owners can create tasks within a specification with title and optional description. Tasks default to "todo" status and appear at the end of the task list.

**Independent Test**: Open a specification, click "Add Task," fill in title and submit, verify the task appears in the specification's task list with "todo" status.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T009 [P] [US1] Write unit tests for task validators (create schema: title required, title max 200, description max 5000) in `tests/unit/task-validator.test.ts`
- [ ] T010 [P] [US1] Write integration tests for task API (POST create returns 201, empty title returns 400, non-owner returns 404, archived project returns 400, approved spec returns 400) in `tests/integration/tasks-api.test.ts`

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create task status badge component with color mapping (todo=gray, in_progress=blue, done=green) in `app/components/tasks/task-status-badge.tsx`
- [ ] T012 [US1] Create task form component with title (1–200 chars), description (0–5000 chars), and Zod schema validation using `@mantine/form` in `app/components/tasks/task-form.tsx`
- [ ] T013 [US1] Create new task page at `app/projects/[projectId]/specifications/[specificationId]/tasks/new/page.tsx`

**Checkpoint**: User Story 1 should be fully functional — create a task and see it appear with "todo" status

---

## Phase 4: User Story 2 - Browse and Filter Tasks (Priority: P1)

**Goal**: Project owners can view all tasks within a specification ordered by position, filter by status, search by title, and see pagination for large lists. Zero tasks shows an empty state.

**Independent Test**: Create 5 tasks in a specification with varied statuses, verify they appear ordered by position, test status filter and title search, verify empty state for a specification with no tasks.

### Tests for User Story 2

- [ ] T014 [P] [US2] Write E2E test for task list (order by position, search filter, status filter, pagination, empty state) in `tests/e2e/tasks-list.spec.ts`

### Implementation for User Story 2

- [ ] T015 [P] [US2] Create task card component (displays title, status badge, position number) in `app/components/tasks/task-card.tsx`
- [ ] T016 [P] [US2] Create task empty state component with "Add Your First Task" CTA button in `app/components/tasks/task-empty-state.tsx`
- [ ] T017 [US2] Create task list component (maps tasks to TaskCard, integrates search/status filter/pagination controls) in `app/components/tasks/task-list.tsx`
- [ ] T018 [US2] Create task list page (standalone view) at `app/projects/[projectId]/specifications/[specificationId]/tasks/page.tsx`

**Checkpoint**: User Stories 1 AND 2 should both work independently — create tasks and browse/filter them

---

## Phase 5: User Story 3 - Edit Tasks and Reorder (Priority: P2)

**Goal**: Project owners can update a task's title, description, status (following valid transitions), and position. Invalid status transitions are rejected. Approved specifications block all edits.

**Independent Test**: Open a task, change its title and status, save, verify changes persist. Change a task's position, verify reordering. Attempt invalid transition (todo → done directly) and verify error.

### Tests for User Story 3

- [ ] T019 [P] [US3] Write unit tests for status transitions (todo→in_progress valid, in_progress→done valid, done→in_progress valid, todo→done invalid, done→todo invalid, approved spec locked) in `tests/unit/task-status.test.ts`

### Implementation for User Story 3

- [ ] T020 [US3] Create edit task page (reuses TaskForm for title/description, adds status dropdown with valid transitions only, adds position field) at `app/projects/[projectId]/specifications/[specificationId]/tasks/[taskId]/edit/page.tsx`
- [ ] T021 [US3] Add E2E test for task edit (title update, status transitions, position reorder, invalid transition rejection, approved spec blocking, concurrent edit conflict) in `tests/e2e/tasks-edit.spec.ts`

**Checkpoint**: Tasks can be created, browsed, filtered, edited, and reordered. Status workflow is enforced.

---

## Phase 6: User Story 4 - View Task Detail (Priority: P2)

**Goal**: Project owners can view a task's full detail: title, description, status, position, parent specification name, created date, and updated date. Non-owners receive 404. Archived projects show read-only view.

**Independent Test**: Open an existing task, verify all fields (title, description, status, position, dates) are rendered correctly.

### Tests for User Story 4

- [ ] T022 [P] [US4] Write E2E test for task detail (all fields rendered, non-owner gets 404, archived project shows read-only) in `tests/e2e/tasks-detail.spec.ts`

### Implementation for User Story 4

- [ ] T023 [P] [US4] Create task detail component (displays all task fields with status badge and parent specification name) in `app/components/tasks/task-detail.tsx`
- [ ] T024 [US4] Create task detail page at `app/projects/[projectId]/specifications/[specificationId]/tasks/[taskId]/page.tsx`

**Checkpoint**: Task detail view is functional with full context and proper authorization

---

## Phase 7: User Story 5 - Delete a Task (Priority: P3)

**Goal**: Project owners can soft-delete a task with typed title confirmation. Task disappears from the list and remaining positions are compacted. Deleted tasks are recoverable within 30 days.

**Independent Test**: Create a task, delete with typed confirmation, verify it disappears from the task list, verify remaining tasks have compacted positions.

### Tests for User Story 5

- [ ] T025 [P] [US5] Write E2E test for task delete (typed confirmation, cancel aborts, successful delete hides task, remaining positions compacted) in `tests/e2e/tasks-delete.spec.ts`

### Implementation for User Story 5

- [ ] T026 [P] [US5] Create task delete confirmation component (modal with typed title confirmation, disabled delete button until title matches) in `app/components/tasks/task-delete-confirm.tsx`
- [ ] T027 [US5] Integrate delete button and confirmation modal into task detail page; verify position compaction works after delete in `app/projects/[projectId]/specifications/[specificationId]/tasks/[taskId]/page.tsx`

**Checkpoint**: Full task lifecycle operational — create, browse, edit, view detail, delete all work

---

## Phase 8: User Story 6 - Task Progress Tracking (Priority: P3)

**Goal**: The specification detail view shows a task completion summary (e.g., "3 of 8 tasks done"). The project detail page shows real task counts (total + completed) updated within 3 seconds of mutations.

**Independent Test**: Create 5 tasks in a specification, mark 2 as done, verify the specification shows "2 of 5 tasks done" and the project detail page shows 5 tasks / 2 completed.

### Implementation for User Story 6

- [ ] T028 [US6] Add task counts (total `count(*)` + done `count(*)` from tasks table, filtered by `deleted_at IS NULL`) to the project detail GET API response, and update the project detail page task count cards at `app/projects/[projectId]/page.tsx` to use real values instead of stubbed zeros
- [ ] T029 [US6] Add task completion summary (total + done counts for the specification) to the specification detail API response, and update the specification detail page at `app/projects/[projectId]/specifications/[specificationId]/page.tsx` to display "X of Y tasks done"

**Checkpoint**: Progress tracking is visible at both specification and project levels, updating in real time

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, type safety, and quality assurance

- [ ] T030 Run TypeScript type check (`tsc --noEmit`) and fix any errors across all new task files
- [ ] T031 Run quickstart.md manual validation scenarios end-to-end: create, list, edit, detail, delete, progress counts, approved-spec locking
- [ ] T032 [P] Run Playwright E2E tests for all stories: `npx playwright test tests/e2e/tasks-*.spec.ts`
- [ ] T033 Code review against Constitution principles (RLS, Zod validation, component size <150 lines, no secrets in code)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3–8)**: All depend on Foundational phase completion
  - US1 (P1) and US2 (P1) can proceed in parallel after Phase 2
  - US3 (P2) depends on US1 (needs TaskForm component)
  - US4 (P2) can start after Phase 2 (no dependency on US1/US2)
  - US5 (P3) depends on US4 (delete is integrated into detail page)
  - US6 (P3) can start after Phase 2 (needs API routes but no UI dependency)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) — Uses TaskForm from US1; can begin after T012
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) — Uses TaskStatusBadge from US1, hooks from Phase 2
- **User Story 5 (P3)**: Depends on US4 (detail page must exist for delete integration)
- **User Story 6 (P3)**: Can start after Phase 2 — API-level changes only; no UI dependency on other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation (Constitution Principle II)
- Reusable components (badge, card, empty state, form) before pages
- Pages before integration (delete into detail, counts into project/spec pages)

### Parallel Opportunities

- All Setup tasks T002–T004 can run in parallel (different files)
- T006, T007, T008 in Foundational can run in parallel (different files)
- T009, T010 in US1 can run in parallel (different test files)
- US1 and US2 can be implemented in parallel after Phase 2
- US4 and US6 can be implemented in parallel with US3 (different files)
- T015, T016 in US2 can run in parallel (different component files)
- T011 (badge) and UI test files are always parallelizable
- T032 and T033 in Polish can run in parallel

---

## Parallel Example: User Story 1 & 2 (both P1)

```bash
# After Phase 2 completes, launch US1 and US2 in parallel:

# Developer A: User Story 1
Task: "T009 [P] [US1] Write unit tests in tests/unit/task-validator.test.ts"
Task: "T010 [P] [US1] Write integration tests in tests/integration/tasks-api.test.ts"
Task: "T011 [P] [US1] Create task status badge in app/components/tasks/task-status-badge.tsx"
Task: "T012 [US1] Create task form in app/components/tasks/task-form.tsx"
Task: "T013 [US1] Create new task page in app/projects/.../tasks/new/page.tsx"

# Developer B: User Story 2
Task: "T014 [P] [US2] Write E2E test in tests/e2e/tasks-list.spec.ts"
Task: "T015 [P] [US2] Create task card in app/components/tasks/task-card.tsx"
Task: "T016 [P] [US2] Create empty state in app/components/tasks/task-empty-state.tsx"
Task: "T017 [US2] Create task list in app/components/tasks/task-list.tsx"
Task: "T018 [US2] Create task list page in app/projects/.../tasks/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T008) — CRITICAL
3. Complete Phase 3: User Story 1 (T009–T013)
4. **STOP and VALIDATE**: Create a task end-to-end, verify it appears
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Create) → Test independently → **MVP: tasks can be created!**
3. Add US2 (Browse) → Test independently → Tasks can be listed and filtered
4. Add US3 (Edit) → Test independently → Tasks can be updated and reordered
5. Add US4 (Detail) → Test independently → Full task context view
6. Add US5 (Delete) → Test independently → Tasks can be cleaned up
7. Add US6 (Progress) → Test independently → Task counts visible across app
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Create)
   - Developer B: User Story 2 (Browse)
3. After US1 complete:
   - Developer A: User Story 3 (Edit, reuses TaskForm)
   - Developer B: User Story 4 (Detail) + User Story 6 (Progress)
4. After US4 complete:
   - Either developer: User Story 5 (Delete)
5. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests must be written first and observed to FAIL before implementation (Constitution II)
- Commit after each task or logical group (Conventional Commits: `feat:`, `fix:`, `test:`)
- Stop at any checkpoint to validate story independently
- All API routes must verify project ownership → 404 for non-owners (Constitution III)
- All mutations must invalidate TanStack Query caches for both the task list and parent project/specification
- Position compaction on delete happens in the API DELETE handler (not a separate task)
- Approved-spec locking is enforced in both the DB trigger and API route (defense in depth)
