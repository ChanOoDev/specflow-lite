# Tasks: Dashboard

**Input**: Design documents from `specs/005-dashboard/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: E2E tests included in Polish phase per project constitution (test-first with UI verification).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Project uses Next.js App Router structure:
- App routes: `app/`, `app/api/`, `app/components/`
- Shared code: `lib/types/`, `lib/hooks/`, `lib/validators/`
- Tests: `tests/e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and validation schemas needed by all subsequent phases

- [ ] T001 [P] Create `DashboardResponse` type and `DashboardSummary`, `DashboardProject`, `OpenTask` sub-types in `lib/types/dashboard.ts`
- [ ] T002 [P] Create dashboard response Zod validation schema in `lib/validators/dashboard.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core API and data-fetching infrastructure that MUST be complete before ANY user story UI can be built

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Create `GET /api/dashboard` route in `app/api/dashboard/route.ts` — aggregates projects with counts, task status breakdown, and open tasks across all user projects (scoped by owner_id via RLS)
- [ ] T004 Create `useDashboard` TanStack Query hook in `lib/hooks/use-dashboard.ts` — calls GET /api/dashboard with 30s staleTime
- [ ] T005 Repurpose `app/page.tsx` from `/projects` redirect to a dashboard page that wraps `<DashboardPage />` in a Suspense with skeleton fallback
- [ ] T006 [P] Add "Dashboard" nav link to Navbar in `app/components/layout/navbar.tsx` — uses IconLayoutDashboard, active when pathname is `/`

**Checkpoint**: Foundation ready — API returns dashboard data, hook fetches it, root route renders dashboard shell, nav links to dashboard

---

## Phase 3: User Story 1 - View Project Health Overview (Priority: P1) 🎯 MVP

**Goal**: Display aggregate project metrics (total projects, requirements, specifications, task counts by status) and per-project breakdown cards. Handle empty state for new users. Show loading skeleton while data loads.

**Independent Test**: Log in with a user who has projects with varying data → navigate to `/` → verify total counts match database, per-project cards show correct counts, empty state appears for users with no projects.

### Implementation for User Story 1

- [ ] T007 [P] [US1] Create `SummaryCards` component in `app/components/dashboard/summary-cards.tsx` — displays 4 stat cards (total projects, total requirements, total specs, task breakdown by status) using Mantine SimpleGrid + Card
- [ ] T008 [P] [US1] Create `DashboardSkeleton` component in `app/components/dashboard/dashboard-skeleton.tsx` — Skeleton placeholders matching summary cards, recent projects, and open tasks layout
- [ ] T009 [P] [US1] Create `DashboardEmpty` component in `app/components/dashboard/dashboard-empty.tsx` — empty state with "Create your first project" CTA button linking to `/projects/new`
- [ ] T010 [US1] Create `DashboardPage` main client component in `app/components/dashboard/dashboard-page.tsx` — integrates useDashboard hook, renders SummaryCards when data exists, DashboardEmpty when user has 0 projects, DashboardSkeleton on loading; includes error handling for API failures with "Retry" button

**Checkpoint**: Dashboard shows project health overview — aggregate counts are correct, empty state works for new users, loading skeleton displays during fetch

---

## Phase 4: User Story 2 - Quick Access to Recent Projects (Priority: P2)

**Goal**: Show 5 most recently accessed projects as clickable cards. Track project access in localStorage when user navigates to any project sub-page. Allow 1-click navigation from dashboard to project overview.

**Independent Test**: Navigate to 3+ different project pages in sequence → return to dashboard → verify recent projects appear in correct order (most recent first), clicking navigates to correct project overview.

### Implementation for User Story 2

- [ ] T011 [US2] Create `useRecentProjects` hook in `lib/hooks/use-recent-projects.ts` — reads/writes `specflow_recent_projects` localStorage key (max 5 entries, dedup by projectId, ordered by lastAccessedAt desc); returns `{ recentProjects, trackProjectAccess(projectId, projectName) }`
- [ ] T012 [US2] Create `RecentProjects` component in `app/components/dashboard/recent-projects.tsx` — renders clickable project cards using Mantine SimpleGrid + Card, shows project name and status badge, links to `/projects/[id]`, truncates long names with Mantine Tooltip
- [ ] T013 [US2] Call `trackProjectAccess` in `app/projects/[projectId]/layout.tsx` (ProjectSubNav or layout) when project data loads — records project id and name to localStorage on navigation to any project sub-page
- [ ] T014 [US2] Integrate `RecentProjects` section into `DashboardPage` in `app/components/dashboard/dashboard-page.tsx` — reads from useRecentProjects hook, displays after summary cards, shows empty state text when no history exists

**Checkpoint**: Returning users see their recent projects and can jump to any project in 1 click. New users see empty state for recent projects.

---

## Phase 5: User Story 3 - Task Status at a Glance (Priority: P3)

**Goal**: Display open tasks (todo + in_progress) across all projects ordered by most recently updated, limited to 10. Each task shows title, project name, and status badge. Include "View all" link when more tasks exist.

**Independent Test**: Create tasks with varying statuses across multiple projects → navigate to dashboard → verify only open tasks appear (not done), correct project names, correct status badges, max 10 shown, most recently updated first.

### Implementation for User Story 3

- [ ] T015 [US3] Create `OpenTasks` component in `app/components/dashboard/open-tasks.tsx` — renders a list of open tasks from dashboard data using Mantine Stack + Paper + Badge; each item shows task title, project name, status badge (colored per status), and links to the task detail page; includes "View all" link to `/projects` when applicable; shows "All tasks completed" when no open tasks exist
- [ ] T016 [US3] Integrate `OpenTasks` section into `DashboardPage` in `app/components/dashboard/dashboard-page.tsx` — renders after recent projects section, passes openTasks from dashboard API response

**Checkpoint**: Dashboard now shows open tasks across all projects — users can see what needs attention without navigating into projects

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, hardening, and final verification

- [ ] T017 [P] Run quickstart.md validation scenarios and fix any issues found
- [ ] T018 [P] Create E2E Playwright test for dashboard in `tests/e2e/dashboard.spec.ts` — covers: empty state for new user, aggregate counts match data, recent projects order, open tasks list filtering, manual refresh, mobile responsive layout

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001, T002) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on Foundational phase — integrates with US1 dashboard page
- **User Story 3 (Phase 5)**: Depends on Foundational phase — integrates with US1 dashboard page
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — integrates T014 into dashboard-page from US1; no data dependency on US1 components
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) — integrates T016 into dashboard-page from US1; no data dependency on US1/US2 components

### Within Each User Story

- Components marked [P] can be built in parallel
- Integration into DashboardPage (T010, T014, T016) must come after individual components
- Story complete before moving to next priority

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T006 can run in parallel with T003-T005 (different file, no dependency on API)
- T007, T008, T009 within US1 can run in parallel (different files)
- T011 and T012 within US2 can run in parallel (hook vs component)
- T017 and T018 in Polish can run in parallel
- Once Foundational completes, US1/US2/US3 phases can be worked on sequentially OR components within a phase can be parallelized

---

## Parallel Example: User Story 1

```bash
# Launch all 3 components for US1 together:
Task: "Create SummaryCards component in app/components/dashboard/summary-cards.tsx"
Task: "Create DashboardSkeleton component in app/components/dashboard/dashboard-skeleton.tsx"
Task: "Create DashboardEmpty component in app/components/dashboard/dashboard-empty.tsx"

# After all 3 complete, integrate:
Task: "Create DashboardPage main client component in app/components/dashboard/dashboard-page.tsx"
```

## Parallel Example: User Story 2

```bash
# Launch hook and component together:
Task: "Create useRecentProjects hook in lib/hooks/use-recent-projects.ts"
Task: "Create RecentProjects component in app/components/dashboard/recent-projects.tsx"

# After hook is ready, add tracking + integrate:
Task: "Call trackProjectAccess in app/projects/[projectId]/layout.tsx"
Task: "Integrate RecentProjects section into DashboardPage"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T006) — CRITICAL: blocks all stories
3. Complete Phase 3: User Story 1 (T007-T010)
4. **STOP and VALIDATE**: Test US1 independently — verify aggregate counts, empty state, loading state
5. Deploy/demo if ready — dashboard is functional as a project health overview

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (API returns data, hook fetches it, root route renders)
2. Add User Story 1 → Test independently → Dashboard shows aggregate metrics (MVP!)
3. Add User Story 2 → Test independently → Recent projects quick-access works
4. Add User Story 3 → Test independently → Open tasks list across projects visible
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T006)
2. Once Foundational is done:
   - Developer A: User Story 1 (T007-T010) — summary cards + dashboard page
   - Developer B: User Story 2 (T011-T014) — recent projects hook + component + tracking
   - Developer C: User Story 3 (T015-T016) — open tasks component
3. Integration order: US1's DashboardPage is the integration point — US2 and US3 components plug into it

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- DashboardPage (T010) is US1 but serves as the integration host for US2 (T014) and US3 (T016)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All dashboard data comes from a single `GET /api/dashboard` call — no per-project queries needed
- Recent project access is client-side only (localStorage) — no API or DB changes needed
- Total: 18 tasks across 6 phases
