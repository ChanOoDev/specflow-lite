# Tasks: Project Management

**Input**: Design documents from `specs/001-project-management/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: E2E tests are REQUIRED per Constitution Principle II (Test-First with UI Verification). Each user story gets Playwright tests written BEFORE implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Next.js App Router — `app/`, `lib/`, `tests/`, `supabase/`
- Server components default; `[P]` client components annotated as such
- Paths assume repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependencies, and configuration scaffolding

- [ ] T001 Initialize Next.js 14+ with TypeScript strict mode and App Router in empty project root
- [ ] T002 [P] Install and configure core dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `@mantine/core`, `@mantine/hooks`, `@mantine/form`, `mantine-form-zod-resolver`, `@tanstack/react-query`, `zod`
- [ ] T003 [P] Install and configure dev dependencies: `@playwright/test`, `vitest`, `@vitejs/plugin-react`, `jsdom`
- [ ] T004 [P] Configure environment variables template in `.env.local.example` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] T005 [P] Configure TypeScript strict mode in `tsconfig.json` (strict: true, noUncheckedIndexedAccess: true)
- [ ] T006 [P] Configure Playwright in `playwright.config.ts` with baseURL, webServer, and testDir pointing to `tests/e2e/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Create database migration `supabase/migrations/001_create_projects.sql` with `project_status` enum, `projects` table (all columns: id, name, description, status, owner_id, created_at, updated_at, archived_at, deleted_at), indexes, triggers (updated_at auto-update, archived_at setter, mutability check), and Row-Level Security policies (SELECT, INSERT, UPDATE using auth.uid())
- [ ] T008 [P] Create Supabase server client in `lib/supabase/server.ts` using `createServerClient` from `@supabase/ssr` with cookie handling for Next.js App Router
- [ ] T009 [P] Create Supabase browser client in `lib/supabase/client.ts` using `createBrowserClient` with env variables
- [ ] T010 [P] Create TypeScript types for `Project`, `ProjectStatus`, and `ProjectListQuery` in `lib/types/project.ts` inferred from Zod schemas in `contracts/zod-schemas.md`
- [ ] T011 [P] Create project constants in `lib/constants/project.ts`: `PROJECT_STATUS` enum, `ALLOWED_TRANSITIONS` map, `PAGE_SIZE_DEFAULT` (20), `NAME_MAX_LENGTH` (120), `DESCRIPTION_MAX_LENGTH` (2000)
- [ ] T012 [P] Create Supabase auth middleware in `lib/supabase/middleware.ts` using `createMiddlewareClient` to refresh sessions and protect `/projects/*` routes
- [ ] T013 Create root layout `app/layout.tsx` with MantineProvider, QueryClientProvider, and Supabase session provider wrapping children
- [ ] T014 [P] Create app shell layout component in `app/components/layout/app-shell.tsx` using Mantine AppShell with responsive sidebar
- [ ] T015 [P] Create navigation sidebar in `app/components/layout/navbar.tsx` with links to Projects, and placeholder links for future features
- [ ] T016 Create root page `app/page.tsx` as server component that redirects to `/projects`
- [ ] T017 [P] Create login page `app/auth/login/page.tsx` as client component with Supabase magic-link or OAuth sign-in form
- [ ] T018 [P] Create auth callback route `app/auth/callback/route.ts` to exchange auth code for session

**Checkpoint**: Foundation ready — user story implementation can now begin. Database schema deployed, auth flows work, app shell renders.

---

## Phase 3: User Story 1 - Create a Project (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can create a new project with name and optional description. On success, they are redirected to the project detail page.

**Independent Test**: Register a user → navigate to `/projects/new` → fill in name + description → submit → verify redirect to detail page showing the project name and "active" status. Also verify empty-name validation error and duplicate-name error.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T019 [P] [US1] E2E test for creating a project with valid data in `tests/e2e/projects-create.spec.ts`: navigate to `/projects/new`, fill form, submit, verify redirect and displayed data
- [ ] T020 [P] [US1] E2E test for validation errors in `tests/e2e/projects-create.spec.ts`: empty name → error message, name >120 chars → error message, duplicate name → error message

### Implementation for User Story 1

- [ ] T021 [US1] Create Zod validation schemas in `lib/validators/project.ts`: `createProjectSchema`, `projectResponseSchema`, `validationErrorSchema` per `contracts/zod-schemas.md`
- [ ] T022 [US1] Implement `POST /api/projects` route in `app/api/projects/route.ts`: parse body with Zod, insert into Supabase, return 201 with project response. Handle name uniqueness violation with 409
- [ ] T023 [P] [US1] Create `useProjectMutations` hook in `lib/hooks/use-project-mutations.ts` with `useCreateProject` mutation (mutationFn, onSuccess redirect, onError toast)
- [ ] T024 [P] [US1] Create ProjectForm component in `app/components/projects/project-form.tsx` using Mantine `useForm` + `zodResolver` with name + description fields, inline error display, and submit handler
- [ ] T025 [US1] Create New Project page `app/projects/new/page.tsx` as client component: render ProjectForm, handle submission via useCreateProject mutation, show loading state during submit
- [ ] T026 [US1] Add navigation item or button in navbar linking to `/projects/new`

**Checkpoint**: User can create a project end-to-end. Form validates input, duplicate names are caught, successful creation redirects to detail page.

---

## Phase 4: User Story 2 - View and Browse Projects (Priority: P2)

**Goal**: Authenticated users see all their non-archived, non-deleted projects in a list ordered by most recently updated. They can search by name and filter by status. Empty state is shown for new users.

**Independent Test**: Create 3 projects with different names and statuses → navigate to `/projects` → verify all 3 appear, ordered by recent update, with name, status badge, and counts. Type partial search → list filters. Select status filter → list filters. Clear all → full list restored.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T027 [P] [US2] E2E test for project list display in `tests/e2e/projects-list.spec.ts`: create 3 projects, verify they appear in correct order with status badges and counts
- [ ] T028 [P] [US2] E2E test for search and filter in `tests/e2e/projects-list.spec.ts`: search by name → filtered results, filter by status → filtered results, combined search+filter, clear → full list
- [ ] T029 [P] [US2] E2E test for empty state in `tests/e2e/projects-list.spec.ts`: new user with zero projects sees empty-state illustration and "Create Your First Project" CTA
- [ ] T030 [P] [US2] E2E test for pagination in `tests/e2e/projects-list.spec.ts`: create 21+ projects, verify page controls appear and page 2 shows next batch

### Implementation for User Story 2

- [ ] T031 [US2] Create Zod query schema in `lib/validators/project.ts`: `projectListQuerySchema` (search, status, page, pageSize, includeArchived) per `contracts/zod-schemas.md`
- [ ] T032 [US2] Implement `GET /api/projects` route in `app/api/projects/route.ts`: parse query params with Zod, query Supabase with owner_id filter + optional search (ilike) + status filter, offset pagination, return ProjectListResponse with pagination metadata
- [ ] T033 [US2] Create `useProjects` hook in `lib/hooks/use-projects.ts`: `useQuery` with `['projects', queryParams]` key, `queryFn` calling GET /api/projects, keepPreviousData for pagination
- [ ] T034 [P] [US2] Create StatusBadge component in `app/components/projects/status-badge.tsx`: renders Mantine Badge with color per status (active=green, paused=yellow, completed=blue, archived=gray)
- [ ] T035 [P] [US2] Create SearchInput component in `app/components/ui/search-input.tsx`: debounced text input using Mantine TextInput with search icon, calls onSearch callback
- [ ] T036 [P] [US2] Create StatusFilter component in `app/components/ui/status-filter.tsx`: Mantine Select dropdown with status options, calls onFilter callback
- [ ] T037 [P] [US2] Create ProjectCard component in `app/components/projects/project-card.tsx`: display name, description (truncated), StatusBadge, artifact counts, last updated date, links to detail page
- [ ] T038 [P] [US2] Create EmptyState component in `app/components/projects/empty-state.tsx`: illustration, "No projects yet" heading, "Create Your First Project" button linking to `/projects/new`. Use Magic UI MCP for styling
- [ ] T039 [US2] Create ProjectList component in `app/components/projects/project-list.tsx` as client component: search input, status filter, grid of ProjectCards, EmptyState when no results, Mantine Pagination when totalPages > 1
- [ ] T040 [US2] Create Projects dashboard page `app/projects/page.tsx`: server component that pre-fetches initial page of projects, renders ProjectList. Include search/filter state management via URL searchParams

**Checkpoint**: User can browse all their projects, search, filter, and paginate. Empty state renders for new users.

---

## Phase 5: User Story 3 - View Project Detail (Priority: P2)

**Goal**: User opens a project and sees its full metadata and computed artifact counts. Non-owners get 404. Archived projects show read-only.

**Independent Test**: Create a project → click it → verify detail page shows name, description, status, dates, and zero counts. Try viewing another user's project URL → verify 404.

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T041 [P] [US3] E2E test for project detail display in `tests/e2e/projects-detail.spec.ts`: open project, verify all fields rendered (name, description, status, created_at, updated_at, counts)
- [ ] T042 [P] [US3] E2E test for authorization in `tests/e2e/projects-detail.spec.ts`: attempt to view another user's project → verify 404 page. View soft-deleted project → verify 404

### Implementation for User Story 3

- [ ] T043 [US3] Implement `GET /api/projects/[projectId]` route in `app/api/projects/[projectId]/route.ts`: fetch single project by id + owner_id from Supabase, compute artifact counts (return 0 for now with graceful handling for missing child tables), return project response or 404
- [ ] T044 [US3] Create `useProject` hook in `lib/hooks/use-project.ts`: `useQuery` with `['projects', projectId]` key, `queryFn` calling GET /api/projects/:id, enabled only when projectId is present
- [ ] T045 [US3] Create Project Detail page `app/projects/[projectId]/page.tsx`: server component that renders project name, description, status badge, created/updated dates, artifact count cards (requirements, specs, tasks, completed tasks). Show read-only mode for archived projects. Include action buttons: Edit, Archive/Restore, Delete (only for non-archived, non-deleted projects)

**Checkpoint**: User can view project details. Authorization works. Read-only mode for archived projects.

---

## Phase 6: User Story 4 - Edit Project Metadata (Priority: P2)

**Goal**: Project owner can update name, description, and status with validation and optimistic-locking conflict detection.

**Independent Test**: Open project settings → change name → save → verify detail page shows new name. Try invalid status transition → verify error. Test concurrent edit → verify conflict message.

### Tests for User Story 4 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T046 [P] [US4] E2E test for editing project metadata in `tests/e2e/projects-edit.spec.ts`: change name + description, save, verify detail page reflects changes
- [ ] T047 [P] [US4] E2E test for status transitions in `tests/e2e/projects-edit.spec.ts`: valid transition succeeds, invalid transition (completed → paused) shows error
- [ ] T048 [P] [US4] E2E test for concurrent edit conflict in `tests/e2e/projects-edit.spec.ts`: open in two tabs, save in tab A, save in tab B → verify conflict message

### Implementation for User Story 4

- [ ] T049 [US4] Add `updateProjectSchema` and `validateStatusTransition` to `lib/validators/project.ts` per `contracts/zod-schemas.md`
- [ ] T050 [US4] Implement `PATCH /api/projects/[projectId]` route in `app/api/projects/[projectId]/route.ts`: validate body with Zod, check optimistic lock by comparing `updated_at` from body vs database, validate status transition, handle name uniqueness, return updated project or appropriate error (400/409/404)
- [ ] T051 [US4] Add `useUpdateProject` mutation to `lib/hooks/use-project-mutations.ts`: mutationFn with PATCH call, onSuccess invalidate queries, onError display conflict/dedup messages
- [ ] T052 [US4] Update ProjectForm component in `app/components/projects/project-form.tsx` to support edit mode: pre-fill from existing project data, include status dropdown with valid transition options only, include hidden `updated_at` field for optimistic locking
- [ ] T053 [US4] Create Edit Project Settings page `app/projects/[projectId]/settings/page.tsx` as client component: load project via useProject, render ProjectForm in edit mode, handle save with useUpdateProject

**Checkpoint**: User can edit project metadata. Status transitions are validated. Concurrent edits produce conflict message.

---

## Phase 7: User Story 5 - Archive and Restore Projects (Priority: P3)

**Goal**: Project owner can archive a project (hiding it from default list) and restore it back to active. Archived projects show read-only.

**Independent Test**: Archive an active project → verify it disappears from default list → enable "Show Archived" filter → verify it appears → restore → verify it's back in default list.

### Tests for User Story 5 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T054 [P] [US5] E2E test for archive flow in `tests/e2e/projects-archive.spec.ts`: archive project → verify hidden from default list, verify filter shows archived project, verify detail page is read-only
- [ ] T055 [P] [US5] E2E test for restore flow in `tests/e2e/projects-archive.spec.ts`: restore archived project → verify reappears in default list, verify status back to active, verify data intact

### Implementation for User Story 5

- [ ] T056 [US5] Implement `POST /api/projects/[projectId]/archive` route in `app/api/projects/[projectId]/archive/route.ts`: accept { action: 'archive' | 'restore' }, validate project is in archivable/restorable state, update status + archived_at, return updated project
- [ ] T057 [US5] Add `useArchiveProject` and `useRestoreProject` mutations to `lib/hooks/use-project-mutations.ts` with optimistic updates: onMutate updates project status in cache, onError rolls back, onSettled invalidates
- [ ] T058 [US5] Add archive/restore action button to project detail page `app/projects/[projectId]/page.tsx`: show "Archive" for active/paused/completed projects, show "Restore" for archived projects. Use optimistic mutation for instant UI feedback
- [ ] T059 [US5] Add `includeArchived` filter to ProjectList and ProjectList page `app/projects/page.tsx`: toggle to show/hide archived projects, default to hidden

**Checkpoint**: Archive and restore work end-to-end with optimistic UI. Archived projects are read-only.

---

## Phase 8: User Story 6 - Delete a Project (Priority: P3)

**Goal**: Project owner can soft-delete a project with typed-name confirmation. Project is hidden from all views. Non-owners get 404.

**Independent Test**: Create project → delete with confirmation → verify hidden from all views → attempt to access deleted project URL → verify 404.

### Tests for User Story 6 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T060 [P] [US6] E2E test for delete flow in `tests/e2e/projects-delete.spec.ts`: open project, click delete, type project name in confirmation dialog, confirm → verify project gone from list, verify direct URL returns 404
- [ ] T061 [P] [US6] E2E test for delete cancellation in `tests/e2e/projects-delete.spec.ts`: click delete, cancel dialog → verify project still exists and is unchanged

### Implementation for User Story 6

- [ ] T062 [US6] Implement `DELETE /api/projects/[projectId]` route in `app/api/projects/[projectId]/route.ts`: verify project exists and user is owner, set `deleted_at = now()` and `status = 'archived'`, return 200 (not 204 — client needs confirmation). Return 404 for non-existent or non-owned projects
- [ ] T063 [US6] Create DeleteConfirmModal component in `app/components/projects/delete-confirm.tsx` using Mantine Modal: display project name, require typing project name to confirm, destructive-styled confirm button (red), cancel button
- [ ] T064 [US6] Add `useDeleteProject` mutation to `lib/hooks/use-project-mutations.ts`: mutationFn with DELETE call, onSuccess invalidate list + redirect to /projects, onError toast
- [ ] T065 [US6] Wire delete button on project detail page `app/projects/[projectId]/page.tsx` to open DeleteConfirmModal. On confirm → execute useDeleteProject → redirect to /projects

**Checkpoint**: Users can soft-delete projects with confirmation. Deleted projects are inaccessible. Cancellation leaves project unchanged.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality gates

- [ ] T066 [P] Unit test for project validator in `tests/unit/project-validator.test.ts`: test createProjectSchema validation (valid, missing name, too-long name, too-long description), updateProjectSchema (valid, empty body), projectListQuerySchema (defaults, bounds)
- [ ] T067 [P] Unit test for status transitions in `tests/unit/project-status.test.ts`: test ALLOWED_TRANSITIONS map — verify all 7 transitions pass and 9 invalid transitions are rejected
- [ ] T068 [P] Integration test for projects API in `tests/integration/projects-api.test.ts`: full lifecycle — create → list → get → update → archive → restore → delete. Verify RLS by attempting cross-owner access
- [ ] T069 [P] Add loading skeletons to project list (`app/projects/page.tsx`) and project detail (`app/projects/[projectId]/page.tsx`) using Mantine Skeleton components
- [ ] T070 [P] Add toast notifications for all mutation outcomes in `lib/hooks/use-project-mutations.ts`: success toast for create/update/archive/restore/delete, error toast with specific message for each error code
- [ ] T071 Verify responsive layout via Playwright: test project list, detail, and forms at 375px (mobile) and 1280px (desktop) viewports
- [ ] T072 Run quickstart.md validation scenarios end-to-end and verify all pass
- [ ] T073 Code cleanup and refactoring: ensure all components under 150 lines (Principle V), remove any `any` types (Principle III), verify all Zod schemas used consistently

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — **BLOCKS all user stories**
- **User Story 1 (Phase 3)**: Depends on Foundational — no dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational — independent from US1
- **User Story 3 (Phase 5)**: Depends on Foundational — independent from US1/US2
- **User Story 4 (Phase 6)**: Depends on Foundational + US3 (needs detail page to add edit button)
- **User Story 5 (Phase 7)**: Depends on Foundational + US3 (needs detail page to add archive button)
- **User Story 6 (Phase 8)**: Depends on Foundational + US3 (needs detail page to add delete button)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories — pure creation flow
- **User Story 2 (P2)**: No dependencies on other stories — can list projects even before US1 is done (would show empty state)
- **User Story 3 (P2)**: No dependencies on other stories — can view detail even without edit/archive/delete buttons
- **User Story 4 (P2)**: Depends on US3 (detail page as host for edit button/settings link)
- **User Story 5 (P3)**: Depends on US3 (detail page as host for archive/restore button)
- **User Story 6 (P3)**: Depends on US3 (detail page as host for delete button)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Validators before API routes
- API routes before hooks
- Hooks before components
- Components before pages
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002–T006)
- All Foundational tasks marked [P] can run in parallel (T008–T012, T014–T015, T017–T018)
- Once Foundational phase completes, US1 and US2 can start in parallel (different pages, hooks, components)
- US3 can start in parallel with US1/US2
- All tests within a story marked [P] can run in parallel
- US4, US5, US6 share the detail page (US3) but their mutations/hooks are independent
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: "E2E test for project list display in tests/e2e/projects-list.spec.ts"
Task: "E2E test for search and filter in tests/e2e/projects-list.spec.ts"
Task: "E2E test for empty state in tests/e2e/projects-list.spec.ts"
Task: "E2E test for pagination in tests/e2e/projects-list.spec.ts"

# Launch all parallel components together:
Task: "Create StatusBadge component in app/components/projects/status-badge.tsx"
Task: "Create SearchInput component in app/components/ui/search-input.tsx"
Task: "Create StatusFilter component in app/components/ui/status-filter.tsx"
Task: "Create ProjectCard component in app/components/projects/project-card.tsx"
Task: "Create EmptyState component in app/components/projects/empty-state.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Create Project)
4. **STOP and VALIDATE**: Test user can create a project, see it in the database
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **MVP milestone: users can create projects**
3. Add User Story 2 → Test independently → **Users can browse and search projects**
4. Add User Story 3 → Test independently → **Users can view project details**
5. Add User Story 4 → Test independently → **Users can edit project metadata**
6. Add User Story 5 → Test independently → **Users can archive/restore projects**
7. Add User Story 6 → Test independently → **Users can delete projects**
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Create)
   - Developer B: User Story 2 (Browse) — independent from US1
   - Developer C: User Story 3 (Detail) — independent from US1/US2
3. After US3 complete:
   - Developer A: User Story 4 (Edit)
   - Developer B: User Story 5 (Archive)
   - Developer C: User Story 6 (Delete) — US4/US5/US6 are all parallel after US3

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story MUST be independently completable and testable
- Verify tests FAIL before implementing (Constitution Principle II)
- Commit after each task or logical group using conventional commits (`feat:`, `test:`, `chore:`)
- Stop at any checkpoint to validate story independently
- Use Context7 MCP for library API questions during implementation
- Use Magic UI MCP for EmptyState and landing page components
- All API routes validated with Zod, all DB access through RLS policies
- Child artifact counts return 0 gracefully until those tables exist
