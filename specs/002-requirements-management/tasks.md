# Tasks: Requirements Management

**Input**: Design documents from `specs/002-requirements-management/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Included per plan.md — 5 E2E specs, 2 integration tests, 2 unit tests. Constitution Principle II mandates test-first.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps to user story from spec.md (US1–US6)
- All tasks include exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migration and foundational type definitions

- [ ] T001 Create requirements table migration with enums, indexes, triggers, and RLS policies in `supabase/migrations/002_create_requirements.sql`
- [ ] T002 [P] Create TypeScript types and interfaces in `lib/types/requirement.ts`
- [ ] T003 [P] Create requirement constants (enums, transition map, limits) in `lib/constants/requirement.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared validation, helpers, and data-fetching hooks that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create Zod validation schemas and status transition validator in `lib/validators/requirement.ts`
- [ ] T005 [P] Create requirement response builder helper in `lib/helpers/requirement-response.ts`
- [ ] T006 [P] Create TanStack Query hooks (list, single, mutations) in `lib/hooks/use-requirements.ts`, `lib/hooks/use-requirement.ts`, and `lib/hooks/use-requirement-mutations.ts`
- [ ] T007 [P] Write unit tests for requirement validator in `tests/unit/requirement-validator.test.ts`
- [ ] T008 [P] Write unit tests for status transitions in `tests/unit/requirement-status.test.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Create a Requirement (Priority: P1) 🎯 MVP

**Goal**: Project owner can create a requirement with title, type, priority, and optional description — starts as "draft"

**Independent Test**: Open a project, click "Add Requirement," fill in title/type/priority, submit, verify requirement appears with "draft" status

### Tests for User Story 1

> **Write these FIRST, ensure they FAIL before implementation**

- [ ] T009 [P] [US1] Write E2E test for requirement creation in `tests/e2e/requirements-create.spec.ts`
- [ ] T010 [P] [US1] Write integration test for requirements API in `tests/integration/requirements-api.test.ts`

### Implementation for User Story 1

- [ ] T011 [US1] Implement POST create endpoint in `app/api/projects/[projectId]/requirements/route.ts` (also scaffold GET stub for US2)
- [ ] T012 [US1] Create RequirementForm client component in `app/components/requirements/requirement-form.tsx`
- [ ] T013 [US1] Create new requirement page in `app/projects/[projectId]/requirements/new/page.tsx`
- [ ] T014 [US1] Create TypeBadge component in `app/components/requirements/type-badge.tsx`
- [ ] T015 [P] [US1] Create PriorityBadge component in `app/components/requirements/priority-badge.tsx`

**Checkpoint**: User can create a requirement via form, see it persisted via API. US1 independently functional.

---

## Phase 4: User Story 2 — Browse Requirements in a Project (Priority: P1)

**Goal**: Project owner views all requirements ordered by recent update, with search by title and filters by type/priority/status, plus pagination

**Independent Test**: Create 3 requirements, verify they appear ordered by recent update, test search and each filter, verify empty state for zero-requirement project

### Tests for User Story 2

> **Write these FIRST, ensure they FAIL before implementation**

- [ ] T016 [P] [US2] Write E2E test for requirements list/search/filter/pagination in `tests/e2e/requirements-list.spec.ts`

### Implementation for User Story 2

- [ ] T017 [US2] Implement GET list endpoint with search, filter, pagination in `app/api/projects/[projectId]/requirements/route.ts` (extends T011)
- [ ] T018 [US2] Create RequirementCard component in `app/components/requirements/requirement-card.tsx`
- [ ] T019 [US2] Create RequirementList component (search + filter + pagination) in `app/components/requirements/requirement-list.tsx`
- [ ] T020 [US2] Create RequirementEmptyState component in `app/components/requirements/requirement-empty-state.tsx`
- [ ] T021 [US2] Create requirements list page in `app/projects/[projectId]/requirements/page.tsx`
- [ ] T022 [US2] Update project detail page to show real requirement count via `app/projects/[projectId]/page.tsx` (replace hardcoded 0)

**Checkpoint**: User can browse, search, filter, and paginate requirements. US1 + US2 together provide core CRUD.

---

## Phase 5: User Story 3 — View Requirement Detail (Priority: P2)

**Goal**: Project owner clicks a requirement to see full detail: all fields plus creation/update dates

**Independent Test**: Open an existing requirement, verify all fields (title, description, type, priority, status, dates) rendered correctly

### Tests for User Story 3

> **Write these FIRST, ensure they FAIL before implementation**

- [ ] T023 [P] [US3] Write E2E test for requirement detail view in `tests/e2e/requirements-detail.spec.ts`

### Implementation for User Story 3

- [ ] T024 [US3] Implement GET detail endpoint in `app/api/projects/[projectId]/requirements/[requirementId]/route.ts` (scaffold PATCH + DELETE stubs)
- [ ] T025 [US3] Create RequirementDetail component in `app/components/requirements/requirement-detail.tsx`
- [ ] T026 [US3] Create requirement detail page in `app/projects/[projectId]/requirements/[requirementId]/page.tsx`

**Checkpoint**: User can click into a requirement to see full detail. US3 independently functional.

---

## Phase 6: User Story 4 — Edit Requirement (Priority: P2)

**Goal**: Project owner updates title, description, type, priority, or status with optimistic locking and transition enforcement

**Independent Test**: Open a requirement, change title and status, verify changes persist. Attempt invalid transition and verify error.

### Tests for User Story 4

> **Write these FIRST, ensure they FAIL before implementation**

- [ ] T027 [P] [US4] Write E2E test for requirement editing in `tests/e2e/requirements-edit.spec.ts`

### Implementation for User Story 4

- [ ] T028 [US4] Implement PATCH update endpoint with optimistic locking and status transition validation in `app/api/projects/[projectId]/requirements/[requirementId]/route.ts` (extends T024)
- [ ] T029 [US4] Create edit requirement page (reuses RequirementForm) in `app/projects/[projectId]/requirements/[requirementId]/edit/page.tsx`
- [ ] T030 [US4] Add status dropdown with valid-transition-only options to RequirementForm in `app/components/requirements/requirement-form.tsx` (extends T012)

**Checkpoint**: User can edit requirements with conflict detection and transition rules. US4 independently functional.

---

## Phase 7: User Story 5 — Delete a Requirement (Priority: P3)

**Goal**: Project owner soft-deletes a requirement with typed confirmation; requirement hidden but recoverable

**Independent Test**: Create a requirement, delete with confirmation, verify it disappears from list, verify direct URL returns 404

### Tests for User Story 5

> **Write these FIRST, ensure they FAIL before implementation**

- [ ] T031 [P] [US5] Write E2E test for requirement deletion in `tests/e2e/requirements-delete.spec.ts`

### Implementation for User Story 5

- [ ] T032 [US5] Implement DELETE (soft-delete) endpoint in `app/api/projects/[projectId]/requirements/[requirementId]/route.ts` (extends T024/T028)
- [ ] T033 [US5] Create RequirementDeleteConfirm component (typed confirmation modal) in `app/components/requirements/requirement-delete-confirm.tsx`
- [ ] T034 [US5] Integrate delete button + confirmation modal into requirement detail page in `app/projects/[projectId]/requirements/[requirementId]/page.tsx` (extends T026)

**Checkpoint**: User can soft-delete requirements with typed confirmation. US5 independently functional.

---

## Phase 8: User Story 6 — Requirement Status Workflow (Priority: P3)

**Goal**: Status workflow is enforced — only valid next-status options appear in the dropdown; invalid transitions rejected server-side

**Independent Test**: Advance a requirement through draft → approved → implemented, defer a draft, reopen an implemented requirement back to draft

### Tests for User Story 6

> **Already covered**: T008 (unit test for status transitions) + T027 (E2E edit tests cover status transitions). No new test files needed.

### Implementation for User Story 6

- [ ] T035 [US6] Verify status transition validation in `lib/validators/requirement.ts` covers all transitions: draft→approved, draft→deferred, approved→implemented, approved→draft, implemented→draft, deferred→draft (validate T004 completeness)
- [ ] T036 [US6] Ensure archived-project requirements are read-only — form actions hidden, API rejects modifications — in `app/projects/[projectId]/requirements/[requirementId]/page.tsx` and API routes

**Checkpoint**: Full status lifecycle works end-to-end. All transitions enforced both client and server side.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, integration, and quality assurance across all stories

- [x] T037 [P] Validate all E2E tests pass: `npx playwright test tests/e2e/requirements-*`
- [x] T038 [P] Validate all unit and integration tests pass: `npx test tests/unit/ tests/integration/`
- [x] T039 Run full quickstart.md manual validation scenarios from `specs/002-requirements-management/quickstart.md`
- [x] T040 [P] Verify TypeScript strict mode — no type errors, no `any` types without justification
- [x] T041 [P] Verify responsive layout on mobile (375px) and desktop (1280px) using Playwright MCP
- [x] T042 [P] Verify no browser console errors on all requirements pages using Playwright MCP
- [x] T043 [P] Verify RLS policies: non-owner gets 404 on all requirements endpoints
- [x] T044 Run QA Agent review against spec acceptance criteria
- [x] T045 Run Reviewer Agent final code review

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — No story dependencies
- **User Story 2 (Phase 4)**: Depends on Foundational — Shares `route.ts` with US1; coordinate file edits
- **User Story 3 (Phase 5)**: Depends on Foundational — No story dependencies
- **User Story 4 (Phase 6)**: Depends on Foundational + US3 (extends `[requirementId]/route.ts` from T024)
- **User Story 5 (Phase 7)**: Depends on Foundational + US3 (extends `[requirementId]/route.ts` from T024/T028)
- **User Story 6 (Phase 8)**: Depends on Foundational + US4 (validates T004 completeness, extends page from US3)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Independent — creates `route.ts` (shared file, US2 extends it)
- **US2 (P1)**: Extends `route.ts` from US1 — best done after US1 or coordinated
- **US3 (P2)**: Independent — creates `[requirementId]/route.ts` (shared file, US4/US5 extend it)
- **US4 (P2)**: Extends `[requirementId]/route.ts` from US3 — best done after US3
- **US5 (P3)**: Extends `[requirementId]/route.ts` from US3 — can parallel with US4
- **US6 (P3)**: Validates and polishes — best done after US3+US4

### Within Each User Story

- Tests MUST be written and observed to FAIL before implementation
- API endpoints before pages (pages depend on API)
- Components before pages (pages compose components)
- Core implementation before integration

### Parallel Opportunities

- T002, T003 can run in parallel (Phase 1)
- T005, T006, T007, T008 can run in parallel (Phase 2, after T004)
- T009, T010 can run in parallel (US1 tests)
- T014, T015 can run in parallel (US1 display components)
- US1 and US3 can run in parallel (different files, no shared dependencies)
- T037–T043 can all run in parallel (Phase 9)
- US4 and US5 can run in parallel after US3 (both extend [requirementId]/route.ts but touch different methods)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write E2E test for requirement creation in tests/e2e/requirements-create.spec.ts"
Task: "Write integration test for requirements API in tests/integration/requirements-api.test.ts"

# Launch all display components together:
Task: "Create TypeBadge component in app/components/requirements/type-badge.tsx"
Task: "Create PriorityBadge component in app/components/requirements/priority-badge.tsx"
```

---

## Parallel Example: Foundational Phase

```bash
# After T004 (validators) is done, launch in parallel:
Task: "Create requirement response builder helper in lib/helpers/requirement-response.ts"
Task: "Create TanStack Query hooks in lib/hooks/use-requirements.ts, lib/hooks/use-requirement.ts, lib/hooks/use-requirement-mutations.ts"
Task: "Write unit tests for requirement validator in tests/unit/requirement-validator.test.ts"
Task: "Write unit tests for status transitions in tests/unit/requirement-status.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T008) — CRITICAL
3. Complete Phase 3: User Story 1 (T009–T015)
4. **STOP and VALIDATE**: Create a requirement via form, verify persisted
5. Deploy/demo if ready

### Recommended Delivery Order

1. Setup + Foundational → Foundation ready
2. US1 + US2 → Core create + browse (MVP!) — the minimum spec-driven workflow
3. US3 → Detail view — context for editing
4. US4 + US6 → Edit + status workflow — lifecycle management
5. US5 → Delete — cleanup capability
6. Polish → Quality gates

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 → Create via form → Deploy (bare MVP)
3. Add US2 → List with search/filter → Deploy (usable MVP!)
4. Add US3 → Detail view → Deploy
5. Add US4+US6 → Edit with status → Deploy (feature complete - core)
6. Add US5 → Delete → Deploy (feature complete - full)
7. Polish → Production ready

---

## Notes

- [P] tasks = different files, no dependencies on incomplete [P] tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests MUST be written first and observed to FAIL (Constitution Principle II)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Shared API route files (`route.ts`) are created in earliest story, extended by later stories — coordinate edits
- All components target ≤150 lines (Constitution Principle V)
- Status badge component reuses existing `StatusBadge` pattern from `app/components/projects/status-badge.tsx`
