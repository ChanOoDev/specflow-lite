# Feature Specification: Project Management

**Feature Branch**: `001-project-management`

**Created**: 2026-06-15

**Status**: Draft

**Input**: User description: "Users can manage projects - Create a specification for project management in SpecFlow Lite. The BA analysis is complete with 11 user stories, a proposed data model with status state machine, and 6 clarification questions that need stakeholder input."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Project (Priority: P1)

A registered user wants to start a new software effort in SpecFlow Lite. From their dashboard, they click "New Project," provide a name and an optional description, and submit the form. The project is created immediately, and they are taken to the project's detail page where they can begin capturing requirements and generating specifications.

**Why this priority**: Without a project, no other feature in SpecFlow Lite is accessible. Project creation is the entry point for the entire product.

**Independent Test**: Can be fully tested by registering a new user, clicking "New Project," filling in the form, and verifying the project appears and is navigable. Delivers immediate value: the user now has a workspace.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the dashboard with no projects, **When** they click "New Project" and fill in a valid name and optional description, **Then** the project is created and they are redirected to the project detail page showing the project name, description, and an active status.
2. **Given** an authenticated user on the new project form, **When** they submit with an empty name, **Then** an inline validation error "Project name is required" is displayed and the project is not created.
3. **Given** an authenticated user with an existing active project named "My App", **When** they attempt to create another project named "My App", **Then** an error "A project with this name already exists" is displayed.
4. **Given** an unauthenticated visitor, **When** they attempt to access the project creation endpoint, **Then** they receive an authentication error and are redirected to log in.

---

### User Story 2 - View and Browse Projects (Priority: P2)

A registered user returns to SpecFlow Lite and sees all their active and paused projects in a list, ordered by most recently updated. Each project shows its name, status, and a summary of artifact counts (requirements, specifications, tasks). The user can search by name and filter by status to quickly find what they need.

**Why this priority**: After creating projects, users need to find and open them. This is the primary navigation surface for returning users.

**Independent Test**: Can be tested by creating multiple projects with different names and statuses, then verifying they appear in the list, search filters work, and clicking a project navigates to its detail page.

**Acceptance Scenarios**:

1. **Given** an authenticated user with three projects, **When** they visit the dashboard, **Then** they see all non-archived, non-deleted projects ordered by most recently updated, each displaying name, status badge, and artifact counts.
2. **Given** an authenticated user with many projects, **When** they type a partial name in the search bar, **Then** the list filters to show only projects whose names contain that text (case-insensitive).
3. **Given** an authenticated user with projects in various statuses, **When** they select a status filter, **Then** only projects with that status are displayed.
4. **Given** a brand-new authenticated user with zero projects, **When** they visit the dashboard, **Then** they see a friendly empty-state illustration with a "Create Your First Project" call-to-action button.
5. **Given** an authenticated user with more than 20 projects, **When** they scroll to the bottom of the list, **Then** the next page of projects loads.

---

### User Story 3 - View Project Detail (Priority: P2)

A user opens a project and sees its full summary: name, description, current status, creation date, last updated date, and counts of requirements, specifications, tasks, and completed tasks. This dashboard orients them before they dive into any specific artifact.

**Why this priority**: The project detail is the launch point for all downstream workflows (requirements, specs, tasks). Users need context before acting.

**Independent Test**: Can be tested by opening an existing project and verifying all summary fields and artifact counts match actual data. Delivers value as the navigation hub for the project.

**Acceptance Scenarios**:

1. **Given** an authenticated project owner, **When** they open a project, **Then** they see its name, description, status, creation date, last updated date, and accurate counts of requirements, specifications, tasks, and completed tasks.
2. **Given** an authenticated user who does not own a project, **When** they attempt to view it, **Then** they receive a "not found" response without any indication that the project exists.
3. **Given** an authenticated user viewing an archived project, **When** they look at the detail page, **Then** all data is displayed read-only and no create, edit, or delete actions are available for child artifacts.

---

### User Story 4 - Edit Project Metadata (Priority: P2)

A project owner updates the project's name, description, or status as the project evolves. They open the project settings, modify the fields they need, and save. If someone else changed the project in the meantime, they are notified and asked to refresh before retrying.

**Why this priority**: Projects evolve, and metadata needs to stay accurate. This is a core maintenance operation used throughout the project lifecycle.

**Independent Test**: Can be tested by opening a project's settings, changing the name, saving, and verifying the new name appears on the detail page and in the list. Also test editing during a simulated concurrent update to validate conflict detection.

**Acceptance Scenarios**:

1. **Given** a project owner viewing project settings, **When** they change the name and description and save, **Then** the project detail page reflects the updated values.
2. **Given** a project owner editing a project, **When** they attempt to change the status from "active" to "archived", **Then** the status updates and the project is hidden from the default list.
3. **Given** a project owner editing a project, **When** they attempt an invalid status transition (e.g., "completed" to "paused"), **Then** an error message explains the allowed transitions.
4. **Given** a project owner who loaded the edit form, and another session updated the same project before they submitted, **When** they save, **Then** they see a conflict message: "This project was updated by someone else. Please refresh and try again."
5. **Given** an authenticated non-owner, **When** they attempt to edit a project, **Then** they receive a "not found" response.

---

### User Story 5 - Archive and Restore Projects (Priority: P3)

A project owner archives a completed or paused project to declutter their active workspace. The project and all its artifacts are preserved read-only. If they later decide to resume work, they can restore the archived project back to active status.

**Why this priority**: Archive/restore is a lifecycle management feature that becomes important after users accumulate several projects. It's not needed on day one but is essential for long-term usability.

**Independent Test**: Can be tested by archiving an active project, verifying it disappears from the default list, then restoring it and verifying it reappears with all data intact.

**Acceptance Scenarios**:

1. **Given** a project owner with an active project, **When** they archive it, **Then** the project status changes to "archived," it disappears from the default project list, and its detail page becomes read-only.
2. **Given** a project owner with an archived project, **When** they enable the "Show Archived" filter, **Then** the archived project appears in the list with an archived badge.
3. **Given** a project owner viewing an archived project, **When** they click "Restore," **Then** the project returns to "active" status and reappears in the default list.
4. **Given** a project in "completed" status, **When** the owner archives it, **Then** the archive succeeds and the project moves off the active list.

---

### User Story 6 - Delete a Project (Priority: P3)

A project owner decides they no longer need a project. They initiate deletion, see a clear confirmation dialog explaining the consequences (the project will be hidden and permanently removed after 30 days), and confirm. The project is soft-deleted — hidden from all views but recoverable within a 30-day window.

**Why this priority**: Deletion is a lifecycle cleanup operation. It's lower priority than create/read/update because users can archive as a reversible alternative.

**Independent Test**: Can be tested by creating a project, deleting it with confirmation, verifying it disappears from all views, and confirming it cannot be accessed.

**Acceptance Scenarios**:

1. **Given** a project owner viewing a project, **When** they click "Delete" and confirm through the dialog by typing the project name, **Then** the project is soft-deleted and disappears from all views.
2. **Given** a project owner who clicks "Delete," **When** they cancel the confirmation dialog, **Then** the project remains unchanged.
3. **Given** a soft-deleted project, **When** anyone attempts to access it, **Then** they receive a "not found" response.
4. **Given** a non-owner, **When** they attempt to delete a project, **Then** they receive a "not found" response.

---

### Edge Cases

- **What happens when a user types a name that matches a project they previously soft-deleted?** The system allows it — uniqueness checks exclude soft-deleted projects. The user can reuse the name.
- **What happens when a user tries to edit an archived project?** The edit is rejected with an appropriate message. Archived projects must be restored before editing.
- **What happens when two users simultaneously try to edit the same project?** Optimistic locking via the `updated_at` field rejects the second save with a conflict message, prompting a refresh.
- **How does the system handle a user with zero projects across all statuses (including no archived)?** The user sees the empty-state onboarding prompt with a clear call-to-action.
- **What happens when a search returns no results?** The user sees "No projects match your search. Try a different term." with an option to clear the search.
- **What happens when a status filter returns no results?** The user sees "No [status] projects found." with a link to view all projects.
- **What happens to related artifacts (requirements, specs, tasks) when a project is soft-deleted?** They become inaccessible through normal queries, but remain in the database for the 30-day recovery window, after which they are permanently removed alongside the project.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to create a new project with a required name (1–120 characters) and an optional description (up to 2000 characters).
- **FR-002**: System MUST enforce that project names are unique per owner among non-deleted projects (case-insensitive).
- **FR-003**: System MUST set newly created projects to "active" status with the authenticated user as the owner.
- **FR-004**: System MUST display all non-archived, non-deleted projects owned by the user, ordered by most recently updated first.
- **FR-005**: System MUST support free-text search on project names (case-insensitive partial match) and filtering by project status.
- **FR-006**: System MUST display a project detail view showing all metadata fields plus computed counts of requirements, specifications, total tasks, and completed tasks.
- **FR-007**: System MUST allow the project owner to update the project name, description, and status.
- **FR-008**: System MUST enforce valid status transitions: active ↔ paused, active → completed, active/paused/completed → archived, archived → active.
- **FR-009**: System MUST reject status changes on archived or soft-deleted projects (except restore from archived).
- **FR-010**: System MUST reject metadata updates when the project has been modified since the client last loaded it (optimistic locking), returning a conflict error.
- **FR-011**: System MUST allow the project owner to archive a project, setting its status to "archived" and hiding it from the default project list.
- **FR-012**: System MUST allow the project owner to restore an archived project back to "active" status.
- **FR-013**: System MUST support soft-deletion of projects with a 30-day retention window before permanent removal.
- **FR-014**: System MUST require explicit confirmation (typing the project name) before executing a project deletion.
- **FR-015**: System MUST restrict all project access and mutations to the project owner only. Non-owners must receive a generic "not found" response.
- **FR-016**: System MUST present a friendly empty state with a clear call-to-action when a user has no projects.
- **FR-017**: System MUST prevent any modifications to child artifacts (requirements, specifications, tasks) within archived or soft-deleted projects.
- **FR-018**: System MUST support pagination in the project list, with a default page size of 20 items.
- **FR-019**: System MUST assign each project to a single owner upon creation. Multi-contributor access is out of scope for v1 and deferred to a future feature.
- **FR-020**: System MUST retain soft-deleted projects for 30 days before permanent removal. Recovery within this window is handled via support request; no self-service "Recently Deleted" UI is included in v1.
- **FR-021**: System MUST maintain a flat project list with no parent-child hierarchy. Sub-project nesting is out of scope for v1.

### Key Entities

- **Project**: The top-level organizational container in SpecFlow Lite. It holds all spec-driven development artifacts (requirements, specifications, plans, tasks). Key attributes include a unique identifier, name, description, status (active, paused, completed, or archived), owner, creation timestamp, last-updated timestamp, archive timestamp, and soft-delete timestamp. A project belongs to exactly one owner and contains many child artifacts.
- **Project Status**: An enumeration representing the project's lifecycle state with four values and defined transition rules. Active projects are in development; paused projects are temporarily on hold; completed projects have finished deliverables; archived projects are read-only and hidden from default views.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can create their first project in under 60 seconds from landing on the dashboard.
- **SC-002**: Returning users can locate and open a specific project in under 10 seconds using search or filters.
- **SC-003**: Project list loads and displays 20 projects in under 2 seconds under normal conditions.
- **SC-004**: 95% of project creation attempts succeed on the first try (no validation errors requiring correction).
- **SC-005**: Users can complete the archive and restore workflow without data loss — all child artifacts remain intact after a full archive-restore cycle.
- **SC-006**: No user can access or modify a project they do not own, verified through security testing.
- **SC-007**: Accidental deletions are recoverable — users who confirm deletion have a clear understanding of the consequences, and no project is permanently removed before the 30-day retention window expires.

## Assumptions

- Users are individually authenticated via the existing authentication system before accessing any project features.
- Each project has exactly one owner in v1. Multi-contributor access is a separate feature.
- A flat project structure (no sub-projects) is sufficient for the initial release.
- Project names are unique per owner, not globally across all users.
- Project descriptions are plain text. Markdown or rich-text support is not included in v1.
- There is no hard limit on the number of projects per user in the initial release.
- Soft-deleted projects are permanently removed after 30 days by an automated background process.
- A "completed" project can be archived, and an archived project can be restored to active, but a completed project cannot be directly reactivated without going through archive → restore.
- Artifact counts (requirements, specs, tasks) are computed at read time rather than stored as denormalized counters. This is acceptable for the expected scale per user.
- The existing authentication and database infrastructure is available and functional.
- Pagination uses offset-based pagination, which is sufficient for the expected volume of projects per user.
