# Feature Specification: Task & Implementation Tracking

**Feature Branch**: `feature/004-task-tracking`

**Created**: 2026-06-18

**Status**: Draft

**Input**: User description: "004 — Task/Implementation Tracking"

## Clarifications

### Session 2026-06-18

- Q: Should tasks be locked (read-only) when their parent specification reaches "approved" status, or should tasks remain independently editable? → A: Lock tasks when spec is approved — tasks become read-only. Status changes, edits, creation, and deletion are all rejected while the specification is approved.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Tasks in a Specification (Priority: P1)

A project owner opens a specification and clicks "Add Task" to create implementation tasks. They provide a title and an optional description. The task is created with "todo" status and appears at the bottom of the specification's task list. Tasks represent actionable implementation items that developers work through.

**Why this priority**: Tasks are the core unit of implementation tracking. Without the ability to create tasks, no implementation tracking is possible. This is the minimum viable entry point.

**Independent Test**: Open a specification, click "Add Task," fill in title and submit, verify the task appears in the specification's task list with "todo" status. Can be fully tested with a single specification and delivers a working task list.

**Acceptance Scenarios**:

1. **Given** a project owner viewing a specification, **When** they click "Add Task" and submit a valid title and description, **Then** the task is created with "todo" status and appears in the specification's task list.
2. **Given** a project owner on the new task form, **When** they submit with an empty title, **Then** an inline validation error "Title is required" is displayed.
3. **Given** a project owner on the new task form, **When** they submit a title exceeding 200 characters, **Then** an inline validation error is displayed.
4. **Given** an authenticated non-owner, **When** they attempt to create a task in a specification they don't own, **Then** they receive a 404 response.
5. **Given** a specification in an archived project, **When** the owner attempts to create a task, **Then** creation is rejected with an error.
6. **Given** a specification in "approved" status, **When** the owner attempts to create a task, **Then** creation is rejected with an error explaining that approved specifications are finalized.

---

### User Story 2 - Browse and Filter Tasks (Priority: P1)

A project owner views all tasks within a specification, ordered by their position (manual ordering). Each task shows its title, status badge, and position. The owner can filter tasks by status and search by title. When the specification has zero tasks, a friendly empty state prompts them to create their first task.

**Why this priority**: Users need to see the task breakdown to understand implementation scope and progress. This is the primary working surface for task management.

**Independent Test**: Create 5 tasks in a specification with varied statuses, verify they appear ordered by position, test status filter and title search, verify empty state for a specification with no tasks.

**Acceptance Scenarios**:

1. **Given** a specification with five tasks in varying statuses, **When** the owner views the task list, **Then** all five appear ordered by position with title, status badge, and position number.
2. **Given** a specification with many tasks, **When** the owner types a partial title in the search field, **Then** the list filters to matching tasks (case-insensitive).
3. **Given** a specification with tasks in mixed statuses, **When** the owner selects a status filter, **Then** only tasks of that status are displayed.
4. **Given** a specification with zero tasks, **When** the owner views the task list, **Then** they see an empty state with "Add Your First Task" call-to-action.
5. **Given** a specification with more than 50 tasks, **When** the owner scrolls or navigates, **Then** pagination loads the next page.

---

### User Story 3 - Edit Tasks and Reorder (Priority: P2)

A project owner updates a task's title, description, and status following defined transition rules (todo → in_progress, in_progress → done, done → in_progress). The owner can also reorder tasks by changing their position. Status changes must follow valid transitions; invalid transitions are rejected with a clear error.

**Why this priority**: Tasks evolve as implementation progresses. Status tracking and manual ordering are essential for managing implementation workflow, but depend on tasks existing first.

**Independent Test**: Open a task, change its title and status, save, verify changes persist. Change a task's position, verify reordering. Attempt invalid transition (todo → done directly) and verify error.

**Acceptance Scenarios**:

1. **Given** a project owner viewing a task, **When** they change the title and save, **Then** the updated title appears in the task list.
2. **Given** a task in "todo" status, **When** the owner changes status to "in_progress", **Then** the status updates and the in_progress badge appears.
3. **Given** a task in "in_progress" status, **When** the owner changes status to "done", **Then** the status updates and the done badge appears.
4. **Given** a task in "done" status, **When** the owner changes status to "in_progress" (to reopen it), **Then** the status reverts to in_progress.
5. **Given** a task in "todo" status, **When** the owner attempts to change status directly to "done", **Then** an error message explains that the transition must go through in_progress.
6. **Given** a task with a position changed from 3 to 1, **When** the owner saves, **Then** the task moves to position 1 and other tasks shift accordingly.
7. **Given** a concurrent edit on the same task, **When** the owner saves with a stale `updated_at`, **Then** a conflict message appears: "This task was updated by someone else. Please refresh and try again."
8. **Given** a task in an approved specification, **When** the owner attempts to edit, change status, or delete it, **Then** the action is rejected with an error explaining that approved specifications are finalized.

---

### User Story 4 - View Task Detail (Priority: P2)

A project owner clicks a task to see its full detail: title, description, status, position, parent specification, creation date, and last updated date. This detail view provides context before editing.

**Why this priority**: Users need to review task details before editing or changing status. This is a navigation and context step that supports the editing workflow.

**Independent Test**: Open an existing task, verify all fields (title, description, status, position, dates) are rendered correctly.

**Acceptance Scenarios**:

1. **Given** a project owner, **When** they click a task in the task list, **Then** they see its title, description, status badge, position, parent specification name, created date, and updated date.
2. **Given** a non-owner, **When** they attempt to view a task by direct URL, **Then** they receive a 404 response.
3. **Given** a task in an archived project, **When** the owner views it, **Then** all data is displayed read-only.

---

### User Story 5 - Delete a Task (Priority: P3)

A project owner soft-deletes a task with typed confirmation. The task is hidden from the specification's task list. Task positions of remaining tasks are re-compacted. Deleted tasks are recoverable within 30 days.

**Why this priority**: Cleanup capability for tasks that are no longer needed. Lower priority than create/browse/edit because tasks are lightweight and can simply be marked "done" rather than deleted.

**Independent Test**: Create a task, delete with typed confirmation, verify it disappears from the task list, verify remaining tasks have compacted positions.

**Acceptance Scenarios**:

1. **Given** a project owner viewing a task, **When** they click "Delete" and type the task title to confirm, **Then** the task is soft-deleted and disappears from the task list.
2. **Given** a project owner viewing a task, **When** they click "Delete" but cancel the confirmation, **Then** the task remains unchanged.
3. **Given** tasks at positions 1, 2, 3 with task 2 deleted, **When** the owner views the task list, **Then** the remaining tasks show positions 1 and 2.

---

### User Story 6 - Task Progress Tracking (Priority: P3)

The specification detail view shows a task completion summary (e.g., "3 of 8 tasks done"). The project detail page shows real task counts (total tasks and completed tasks) updated in real time. This provides implementation progress visibility at both the specification and project level.

**Why this priority**: Progress tracking provides visibility but depends on tasks existing and being status-managed. It's the reporting layer on top of the management features.

**Independent Test**: Create 5 tasks in a specification, mark 2 as done, verify the specification shows "2 of 5 tasks done" and the project detail page shows 5 tasks / 2 completed.

**Acceptance Scenarios**:

1. **Given** a specification with 5 tasks (2 done, 2 todo, 1 in_progress), **When** the owner views the specification detail, **Then** a completion summary displays "2 of 5 tasks done".
2. **Given** a project with 3 specifications containing tasks totaling 12 tasks (4 done), **When** the owner views the project detail, **Then** the task count cards show "12 Tasks" and "4 Completed".
3. **Given** a task status changes from in_progress to done, **When** the owner views the specification detail, **Then** the completion count updates within 3 seconds.
4. **Given** a specification with zero tasks, **When** the owner views the specification detail, **Then** the completion summary displays "0 of 0 tasks".

---

### Edge Cases

- What happens when a task's parent specification is soft-deleted? The specification's tasks become inaccessible through normal navigation but remain in the database (the specification deletion cascades to hide them).
- What happens when a task title matches one that was soft-deleted? Duplicate titles are allowed (no uniqueness constraint on title).
- What happens when a user tries to reorder a task to a position beyond the list length? The position is clamped to the maximum valid position.
- What happens when the parent project is archived? All existing tasks become read-only; new tasks cannot be created.
- What happens when the parent specification is approved? All existing tasks become read-only; new tasks cannot be created, existing tasks cannot be edited, deleted, or have their status changed.
- What happens when a task description exceeds 5000 characters? Validation rejects it — the limit matches the specification description limit.
- What happens when the specification has 100+ tasks? Pagination handles large task lists with a default page size of 20.
- What happens when a task is marked "done" but needs to be reopened? The transition rule allows done → in_progress, providing a reopen path.
- What happens when the same task is updated from two browser tabs simultaneously? Optimistic locking via `updated_at` returns a 409 conflict on the second save.
- What happens when a task is created with a position that conflicts with an existing one? New tasks are always appended at the end (next available position), avoiding conflicts.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow project owners to create tasks within a specification with a title (1–200 chars), an optional description (0–5000 chars), a status defaulting to "todo", and a position auto-assigned to the end of the task list.
- **FR-002**: System MUST support three task statuses: "todo", "in_progress", "done".
- **FR-003**: System MUST list tasks within a specification ordered by position ascending, excluding soft-deleted tasks.
- **FR-004**: System MUST support case-insensitive title search on the task list.
- **FR-005**: System MUST support filtering the task list by status.
- **FR-006**: System MUST paginate the task list with a default page size of 20 and a maximum of 50.
- **FR-007**: System MUST display task detail with title, description, status, position, parent specification name, created date, and updated date.
- **FR-008**: System MUST allow project owners to update a task's title, description, status, and position.
- **FR-009**: System MUST enforce valid status transitions: todo → in_progress; in_progress → done, in_progress → todo; done → in_progress. Direct transitions from todo → done and done → todo must be rejected.
- **FR-010**: System MUST reject edits, status changes, creation, and deletion on tasks when their parent specification is in "approved" status or when the parent project is archived.
- **FR-011**: System MUST implement optimistic locking via `updated_at` comparison on task updates.
- **FR-012**: System MUST support soft-delete of tasks with typed title confirmation. Deleting a task must not affect other tasks' data beyond position compaction.
- **FR-013**: System MUST enforce RLS so only the project owner can access tasks within their project. Non-owners receive 404.
- **FR-014**: System MUST display a friendly empty state with CTA when a specification has no tasks.
- **FR-015**: System MUST display real task counts on the project detail page: total tasks and completed tasks, updated after any task mutation.
- **FR-016**: System MUST display a task completion summary on the specification detail view (e.g., "X of Y tasks done").
- **FR-017**: System MUST assign new tasks the next available position within their specification (max current position + 1), ensuring no position conflicts on creation.
- **FR-018**: System MUST cascade visibility when a specification is soft-deleted — its tasks become inaccessible through normal navigation.

---

### Key Entities

- **Task**: An actionable implementation item within a specification. Key attributes: title, description, status (todo → in_progress → done), position (integer for manual ordering), specification ownership, project ownership (denormalized for RLS), timestamps.
- **Relationship to Specification**: Tasks belong to exactly one specification. A specification can have zero or more tasks. Soft-deleting a specification hides its tasks.
- **Relationship to Project**: Tasks are indirectly owned by a project through the parent specification. The project's `owner_id` is denormalized onto the task for RLS enforcement. Task counts (total and done) are aggregated per project for the project detail page.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a task in under 15 seconds.
- **SC-002**: A task list with 50 items loads in under 500ms.
- **SC-003**: 90% of task creation attempts succeed on first try (clear validation prevents submission errors).
- **SC-004**: No unauthorized access to tasks — all non-owner access attempts return 404.
- **SC-005**: Real task and completed task counts appear on the project detail page and update within 3 seconds of any task mutation.
- **SC-006**: Status transitions are enforced 100% of the time — no invalid transition succeeds.
- **SC-007**: Task completion summary on the specification detail accurately reflects the current state of all tasks.

---

## Assumptions

- Users have already created a project (001), captured requirements (002), and created specifications (003) before using this feature.
- Tasks are manually created by the project owner within a specification. AI-generated task creation (from specifications) is a future enhancement and out of scope for this feature.
- Task status workflow is intentionally simple (3 states: todo, in_progress, done) to keep implementation tracking lightweight. A "cancelled" or "blocked" status is not needed for the initial release.
- Tasks follow the same soft-delete pattern (30-day retention) as projects, requirements, and specifications.
- Tasks are ordered by a position integer. Drag-and-drop reordering UI is a potential future enhancement; for v1, position can be set through an explicit position field in the edit form.
- Only the project owner can create, edit, delete, and view tasks (matching the existing authorization model for requirements and specifications).
- The existing Supabase Auth and RLS infrastructure from 001, 002, and 003 is reused.
- Task completion counts on the project detail page replace the current stubbed values (always 0) with real database counts.
- The specification detail page already exists from 003 and will be extended with the task list and completion summary.
