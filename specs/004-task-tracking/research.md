# Research: Task & Implementation Tracking (004)

**Date**: 2026-06-18
**Feature**: 004-task-tracking

## Research Questions

### Q1: Task Ordering Strategy

**Decision**: Use an integer `position` column with auto-assignment to `MAX(position) + 1` on create.

**Rationale**: Tasks within a specification need manual ordering so users can prioritize implementation work. An integer position column is the simplest approach that supports explicit reordering. New tasks are appended at the end to avoid shifting other tasks on create.

**Alternatives considered**:
- `created_at` ordering — simple but doesn't support manual reordering (core requirement)
- Float-based positioning (e.g., `(prev + next) / 2`) — avoids renumbering but accumulates precision issues and is more complex than needed for typical task counts
- Linked list (prev/next UUID columns) — good for drag-and-drop but overkill for v1; harder to query in order
- Drag-and-drop UI — deferred to future enhancement per spec assumptions

**Implementation**: On create, query `SELECT COALESCE(MAX(position), 0) + 1 FROM tasks WHERE specification_id = $1 AND deleted_at IS NULL`. On delete, remaining tasks have their positions compacted (gap removal) via a subsequent renumbering pass or application-level logic. On explicit position change (edit), the task at the target position is shifted down.

---

### Q2: Owner ID Denormalization Chain

**Decision**: Denormalize `owner_id` from the specification's `owner_id` (which is itself denormalized from the project) via a database trigger.

**Rationale**: The established pattern from 002 (requirements inherit owner from project) and 003 (specifications inherit owner from project, junction rows inherit from specification) is a three-level chain: project → specification → task. A database trigger on INSERT copies `owner_id` from the parent specification, which was already set by its own trigger from the project. This keeps RLS policies simple (`auth.uid() = owner_id`) without multi-level JOINs.

**Alternatives considered**:
- Direct copy from project (bypassing specification trigger) — adds unnecessary JOIN complexity and doesn't add value
- RLS with subquery through specification → project — slower, more complex, breaks the established pattern
- API-only enforcement — violates Principle III (defense in depth)

**Implementation**: A `set_task_owner()` trigger fires BEFORE INSERT on `tasks` to copy `owner_id` from the parent specification. No additional triggers needed since the specification's `owner_id` is already correct.

---

### Q3: Task Status Machine Design

**Decision**: 3-status lifecycle: todo → in_progress → done. All transitions are bi-directional except todo ↔ done (must pass through in_progress).

**Rationale**: The simplest possible status machine that still enforces meaningful workflow. Tasks start as "todo", move to "in_progress" when work begins, and "done" when complete. Done tasks can be reopened by moving back to "in_progress" (not directly to "todo", which would bypass the natural rework flow). A task that was never started (todo) cannot jump directly to done.

**Transitions**:
```
todo        → [in_progress]
in_progress → [done, todo]
done        → [in_progress]
```

**Alternatives considered**:
- todo → done direct transition — simpler but reduces data quality (tasks marked done without any "in progress" phase lose implementation tracking)
- Additional "blocked" or "cancelled" statuses — adds complexity; deferred to future per spec assumptions
- 4-status workflow matching specifications — inappropriate; tasks are simpler work items

---

### Q4: Position Compaction on Delete

**Decision**: After soft-deleting a task, compact positions of remaining non-deleted tasks within the same specification via application-level logic.

**Rationale**: Position gaps (e.g., positions 1, 3 after deleting task 2) confuse users and make the position field less useful as a visual ordering tool. Compacting ensures the UI always shows contiguous positions (1, 2, 3, …). The operation is simple for typical task counts (≤100 per specification).

**Alternatives considered**:
- Leave gaps — simpler implementation but worse UX (positions jump from 1 to 3)
- Database trigger for compaction — complex trigger logic, harder to debug
- No compaction at all — positions become meaningless over time

**Implementation**: In the DELETE API route, after setting `deleted_at`, run a renumbering query that assigns sequential positions to remaining tasks. This can be done with `ROW_NUMBER()` in a single UPDATE.

---

### Q5: Task Counts Query Strategy

**Decision**: Use lightweight `count(*)` queries for both project-level and specification-level task counts, mirroring the pattern established in T022 (requirement counts) and the specification counts from 003.

**Rationale**: Task counts need to appear in two places:
1. **Project detail page** (FR-015): Total tasks across all specifications in a project, plus completed task count. These are added to the project detail API response.
2. **Specification detail view** (FR-016): Tasks within a single specification (total + done). These are added to the specification detail API response.

Both follow the existing `count(*)` pattern used by requirements and specifications.

**Alternatives considered**:
- Materialized counts on the project/specification row — denormalized but requires triggers to maintain; premature optimization
- Separate count endpoint — adds unnecessary API calls; counts should be part of the parent object response
- TanStack Query client-side aggregation — inaccurate (pagination boundaries); server-side is authoritative

**Implementation**: 
- Project detail: `SELECT count(*) FROM tasks WHERE project_id = $1 AND deleted_at IS NULL` and `...AND status = 'done'`
- Specification detail: `SELECT count(*) FROM tasks WHERE specification_id = $1 AND deleted_at IS NULL` and `...AND status = 'done'`

---

### Q6: Task Locking When Specification Is Approved

**Decision**: Reject all task mutations (create, update, delete, status change) when the parent specification has status `approved`.

**Rationale**: This was clarified during `/speckit-clarify`. When a specification is approved, it is finalized — its decomposition into tasks should also be frozen. This prevents scope creep after sign-off and aligns with the specification lifecycle.

**Alternatives considered**:
- Tasks remain editable — rejected; creates inconsistency where an approved spec's tasks can change, effectively changing what the spec means
- Partial lock (status changes allowed, no create/delete) — rejected; even status changes alter the implementation scope

**Implementation**: A database trigger (`check_task_mutable`) on INSERT/UPDATE checks the parent specification's status and project's status/soft-delete state. API routes also validate this before mutation to provide friendly error messages.

---

### Q7: Pagination and Search Strategy

**Decision**: Same offset pagination as requirements and specifications: page size 20, max 50, `page` and `pageSize` query params. Search via `ilike` on title. Filtered by status via `eq`. Ordered by `position` ascending (not `updated_at` descending — tasks use manual ordering).

**Rationale**: Consistency with existing patterns for pagination params. The ordering differs from other entities (position ascending vs updated_at descending) because tasks are manually ordered. Status filtering and title search follow the existing pattern exactly.

**Implementation**: The GET list endpoint accepts `search`, `status`, `page`, `pageSize` query params. The query is scoped to `specification_id` and ordered by `position ASC`.

---

## Summary

All decisions follow established patterns from 001–003. The only new concepts are:
1. **Position-based ordering** (integer column, append-at-end, compact on delete) — simple and sufficient for v1
2. **3-status machine** (simpler than requirements and specifications)
3. **Three-level owner denormalization** (project → specification → task, via triggers)
4. **Approved-spec lock** (tasks frozen when spec is finalized)

No junction table is needed. Everything else (RLS, soft-delete, offset pagination, nested routes, optimistic locking) is a direct reuse of proven patterns.
