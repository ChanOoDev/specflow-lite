# Feature Specification: Dashboard

**Feature Branch**: `feature/005-dashboard`

**Created**: 2026-06-18

**Status**: Draft

**Input**: User description: "005 — Dashboard"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Project Health Overview (Priority: P1)

A user opens SpecFlow Lite and lands on the dashboard as their home page. They immediately see a summary of all their projects: total counts of requirements, specifications, and tasks across all projects, along with a per-project breakdown showing which projects are active, how many open tasks each has, and how many specifications are in progress. This gives them an at-a-glance understanding of where things stand without needing to navigate into individual projects.

**Why this priority**: The dashboard's primary purpose is to give users an immediate, high-level view of their work. Without this story, there is no dashboard — users would have to dig into each project individually to understand overall status.

**Independent Test**: Can be fully tested by logging in and verifying that the dashboard displays aggregated project data (project count, requirement count, specification count, task counts by status) correctly matching the underlying data.

**Acceptance Scenarios**:

1. **Given** a user with 3 projects containing varying numbers of requirements, specifications, and tasks, **When** they navigate to the dashboard, **Then** the dashboard displays the total count of projects, total requirements, total specifications, and total tasks with status breakdowns across all projects.
2. **Given** a user with no projects, **When** they navigate to the dashboard, **Then** the dashboard shows an empty state with a clear call-to-action to create their first project.
3. **Given** a user with projects that have no tasks yet, **When** they view the dashboard, **Then** task counts display as zero rather than showing errors or missing data.
4. **Given** a user with a project where all tasks are completed, **When** they view the dashboard, **Then** that project shows a completion indicator (100% tasks done).

---

### User Story 2 - Quick Access to Recent Projects (Priority: P2)

A user returns to SpecFlow Lite after working on a specific project. The dashboard shows their most recently accessed projects in a prominent "Recent Projects" section, allowing them to click and jump directly into a project's specification or task list without navigating through the full projects list.

**Why this priority**: Returning users spend most of their time in 1-2 active projects. Quick access reduces navigation friction and makes the dashboard a functional launchpad, not just a status view.

**Independent Test**: Can be tested by accessing multiple projects in sequence, returning to the dashboard, and verifying that the recent projects list reflects the correct order with working navigation links.

**Acceptance Scenarios**:

1. **Given** a user who has accessed Project A, then Project B, then Project C, **When** they view the dashboard, **Then** Projects C, B, and A appear in the "Recent Projects" section in that order.
2. **Given** a user with no project access history, **When** they view the dashboard, **Then** the recent projects section is hidden or shows an empty state prompting exploration.
3. **Given** a user viewing recent projects, **When** they click on a recent project, **Then** they are taken directly to that project's overview page.

---

### User Story 3 - Task Status at a Glance (Priority: P3)

A user wants to quickly see what needs their attention. The dashboard includes a dedicated section or widget showing open tasks across all projects, grouped by project and prioritized by status (e.g., "To Do" tasks first). The user can see task titles, associated projects, and task statuses without leaving the dashboard.

**Why this priority**: While the overview (P1) shows counts, seeing actual task details helps users decide what to work on next. This enhances the dashboard's utility as a daily starting point.

**Independent Test**: Can be tested by creating tasks in multiple projects, returning to the dashboard, and verifying that open tasks appear with correct titles, project associations, and statuses.

**Acceptance Scenarios**:

1. **Given** a user with 5 open tasks across 2 projects, **When** they view the dashboard, **Then** all 5 open tasks are listed with their title, associated project name, and current status.
2. **Given** a user with more than 10 open tasks, **When** they view the dashboard, **Then** the task list shows the 10 most recently updated tasks with a "View all" link to the tasks page.
3. **Given** a user with no open tasks (all completed), **When** they view the dashboard, **Then** the task section shows a "All tasks completed" message.

---

### Edge Cases

- What happens when a project is deleted while the user is viewing the dashboard? The dashboard should gracefully handle missing data (stale cache) without crashing, showing project data as unavailable rather than erroring.
- How does the dashboard handle a user with a very large number of projects (50+)? Metrics should be aggregated efficiently; the recent projects list should be capped at a reasonable number (e.g., 5-10).
- What happens when the user's session expires while viewing the dashboard? The dashboard should redirect to login and preserve no stale data.
- How does the dashboard display projects with long names? Project names should be truncated with ellipsis and a tooltip showing the full name.
- What happens on first login (brand new user with zero data)? All sections should show appropriate empty states with clear calls-to-action.
- How does the dashboard respond to real-time data changes (e.g., another tab creating a task)? The dashboard may show slightly stale data on initial load; a manual refresh option should be available.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a dashboard as the default landing page after login, showing an aggregated summary of all user projects.
- **FR-002**: System MUST display aggregate counts across all projects: total projects, total requirements, total specifications, and total tasks.
- **FR-003**: System MUST display task counts broken down by status (e.g., To Do, In Progress, Done) across all projects.
- **FR-004**: System MUST display a "Recent Projects" section ordered by most-recently-accessed, limited to the 5 most recent projects.
- **FR-005**: System MUST provide clickable project cards/items in the recent projects section that navigate to the project's overview page.
- **FR-006**: System MUST display an open tasks list across all projects, showing task title, associated project name, and status, limited to the 10 most recently updated.
- **FR-007**: System MUST display appropriate empty states for every section when no data exists, including a clear call-to-action where applicable (e.g., "Create your first project").
- **FR-008**: System MUST provide a manual refresh mechanism for dashboard data.
- **FR-009**: System MUST handle deleted or inaccessible projects gracefully, displaying "unavailable" indicators rather than error states.
- **FR-010**: System MUST truncate long project names with ellipsis and provide a tooltip or accessible alternative showing the full name.
- **FR-011**: Dashboard data MUST be scoped to the authenticated user's projects only (enforced by RLS).

### Key Entities

- **Dashboard View**: An aggregated read-only view composed from existing entities (Projects, Requirements, Specifications, Tasks). Not a separate stored entity — it is a computed projection of the user's project data.
- **Recent Project Access**: Tracks which projects a user has recently navigated to, ordered by last access time. May be stored as user preference/metadata or derived from navigation events.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view their complete project overview (all aggregate counts and sections) within 3 seconds of navigating to the dashboard.
- **SC-002**: Users can navigate from the dashboard to a specific project in 1 click using the recent projects or task list.
- **SC-003**: First-time users with no data see clear empty states with calls-to-action — 100% of empty dashboard sections display meaningful guidance.
- **SC-004**: Dashboard correctly reflects project data changes within 30 seconds or upon manual refresh, with no stale data persisting beyond a single refresh action.
- **SC-005**: 90% of users can identify their most active project and open task count within 5 seconds of viewing the dashboard (validated through usability testing).

## Assumptions

- The dashboard is the default post-login landing page, replacing any previous default route.
- Recent project access is tracked when a user navigates into a project's detail pages (requirements, specs, or tasks).
- Dashboard data aggregation queries are optimized through database indexes on project ownership and task status columns.
- The dashboard is a read-only view; all create/edit actions link out to existing project, requirement, spec, or task pages.
- Mobile responsiveness is required but the mobile layout may stack sections vertically rather than using a side-by-side grid.
- The dashboard does not include real-time updates (WebSocket/polling); data is fetched on page load and via manual refresh.
- Existing Supabase RLS policies on projects, requirements, specifications, and tasks tables are sufficient — the dashboard queries respect these policies automatically.
