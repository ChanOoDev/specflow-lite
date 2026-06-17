# Research: Specification Management (003)

**Date**: 2026-06-17
**Feature**: 003-specifications

## Research Questions

### Q1: Junction Table Pattern for Requirement Linking

**Decision**: Create a `specification_requirements` junction table with project-scoped constraints.

**Rationale**: A specification can link zero or more approved requirements. A requirement can be linked to multiple specifications. This is a classic many-to-many relationship. The junction table is the standard PostgreSQL pattern.

**Alternatives considered**:
- JSONB array column on specifications — rejected because it breaks referential integrity, makes unlink-on-delete harder, and prevents requirement-side queries ("which specs link to this requirement?")
- Requirement column `specification_id` — rejected because a requirement can belong to multiple specs
- No junction table (inline array in spec) — rejected for same reasons as JSONB

**Implementation**: Each junction row stores `specification_id` and `requirement_id` with a unique constraint on `(specification_id, requirement_id)` to prevent duplicates. A DB trigger ensures only approved requirements can be linked. The junction row includes `owner_id` (denormalized from parent project) for RLS enforcement.

---

### Q2: Owner ID Denormalization for RLS

**Decision**: Denormalize `owner_id` from the parent project into specifications via a database trigger, matching the pattern from 002 (requirements).

**Rationale**: RLS policies that JOIN through projects to check ownership are complex and slow. Denormalizing `owner_id` into the child table allows simple `auth.uid() = owner_id` RLS policies. This pattern was established in 002-requirements-management and works correctly.

**Alternatives considered**:
- RLS with subquery JOIN → project → check owner — slower, more complex
- API-only enforcement (no RLS) — violates Principle III (defense in depth)
- Application-level middleware — rejected; RLS is the final backstop

**Implementation**: A `set_specification_owner()` trigger fires on INSERT to copy `owner_id` from the parent project. Junction table rows also denormalize `owner_id` for the same reason.

---

### Q3: Status Machine Design

**Decision**: 4-status lifecycle: draft → in_progress → completed → approved. Finalized (approved) specs are immutable.

**Rationale**: Simpler than the requirement status machine (4 states + deferred). Specifications follow a linear progression with the option to revert from in_progress and completed back to draft. "Approved" is terminal — specs that need revision after approval should be cloned or superseded by a new spec.

**Transitions**:
```
draft       → [in_progress, archived]
in_progress → [completed, draft]
completed   → [approved, draft]
approved    → [] (terminal)
```

**Alternatives considered**:
- Reuse requirement statuses — rejected because specs have a different lifecycle (no "implemented", no "deferred")
- 5-state workflow with "review" — rejected as premature for v1; can add later

---

### Q4: Linking Only Approved Requirements

**Decision**: Enforce at database and API level that only approved requirements can be linked.

**Rationale**: Specs are formal documents that bridge requirements to tasks. Linking a draft requirement to a spec would create traceability to an unapproved artifact, undermining the spec's authority as an approved document.

**Alternatives considered**:
- Allow linking any requirement — simpler but reduces spec quality
- Allow linking but warn — inconsistent enforcement; specs should be authoritative

**Implementation**: DB trigger on INSERT into `specification_requirements` checks that the referenced requirement has `status = 'approved'`. API validation also checks this to provide a friendly error before the DB rejects.

---

### Q5: Soft-Delete and Cascade Unlinking

**Decision**: Soft-deleting a specification sets `deleted_at` and cascade-unlinks all linked requirements. Requirements themselves are untouched.

**Rationale**: The specification is the artifact being deleted. Linked requirements are independent entities that exist outside the spec. Unlinking preserves data integrity (no dangling references to deleted specs) without destroying the requirements.

**Alternatives considered**:
- Hard-delete specs + cascade delete junction rows — simpler but violates soft-delete convention
- Keep links to deleted specs — confusing; "dead" references in requirement views
- Cascade delete requirements too — destructive; violates data independence

**Implementation**: DELETE endpoint sets `deleted_at = now()` on the specification. A trigger or application-level query sets `deleted_at` on all junction rows for that specification. The requirement itself is unchanged.

---

### Q6: Pagination and Search Strategy

**Decision**: Same offset pagination as 002-requirements-management: page size 20, max 50, `page` and `pageSize` query params.

**Rationale**: Consistency with the existing pattern. Specifications are not expected to exceed hundreds per project, so cursor-based pagination is unnecessary overhead.

**Search**: `ilike` on title (case-insensitive substring match), same as requirements. Status filter via `eq('status', status)`.

---

### Q7: Real Specification Counts on Project Detail

**Decision**: Add a live `count(*)` subquery on specifications to the project detail response, mirroring the requirement counts pattern from T022.

**Rationale**: Users need to see spec counts alongside requirement counts on the project dashboard. This follows the established pattern: a lightweight `head: true` count query appended to the project GET route.

**Implementation**: `SELECT count(*) FROM specifications WHERE project_id = $1 AND deleted_at IS NULL` in the project detail API route.

---

## Summary

All decisions follow established patterns from 001-project-management and 002-requirements-management. The junction table is the only new database concept; everything else (RLS denormalization, soft-delete, offset pagination, nested routes, optimistic locking) is a direct reuse of proven patterns.
