# Research: Requirements Management

**Created**: 2026-06-17 | **Feature**: [spec.md](./spec.md)

## R1: RLS Policy — Owner Inheritance from Parent Project

**Decision**: Denormalize `owner_id` on the `requirements` table (set on creation from the parent project's `owner_id`) and apply the same `auth.uid() = owner_id` RLS pattern used on projects. A database trigger ensures the denormalized `owner_id` matches the project's `owner_id`.

**Rationale**: Requirements are nested under projects. Rather than joining through `projects` for every RLS check (expensive, fragile with JOINs in RLS), we denormalize `owner_id` on the child record. This is the same pattern Supabase recommends for nested ownership — simpler RLS policies, better query performance. The trigger guarantees consistency: if a project's `owner_id` were ever changed (unlikely in v1), requirements follow.

**Alternatives Considered**:
- RLS via `EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.owner_id = auth.uid())`: Rejected — introduces a subquery in every RLS check, slower at scale, and the RLS policy syntax is more error-prone.
- No denormalization, API-only authorization: Rejected — violates Constitution Principle III (defense in depth requires database-level enforcement).

**Implementation**:
```sql
alter table requirements enable row level security;
alter table requirements force row level security;

create policy "Owners can select requirements" on requirements
  for select using ((select auth.uid()) = owner_id);

create policy "Owners can insert requirements" on requirements
  for insert with check ((select auth.uid()) = owner_id);

create policy "Owners can update requirements" on requirements
  for update using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Owners can delete requirements" on requirements
  for delete using ((select auth.uid()) = owner_id);
```

---

## R2: TanStack Query — Nested Query Keys

**Decision**: Use hierarchical query keys `['projects', projectId, 'requirements']` for the list query and `['projects', projectId, 'requirements', requirementId]` for single-item queries. Mutations invalidate the project-level query key to keep the parent page's counts in sync.

**Rationale**: The requirements list is scoped to a project. The query key structure mirrors the URL hierarchy (`/projects/[projectId]/requirements`) which makes cache management intuitive — invalidating `['projects', projectId, 'requirements']` clears all requirement data for that project. The project detail page's requirement count is kept up-to-date by invalidating the project query on create/delete mutations.

**Alternatives Considered**:
- Flat query keys `['requirements', projectId]`: Rejected — less expressive, harder to cascade invalidation from project-level mutations.
- Single query key `['requirements']` with filter params: Rejected — no built-in scoping per project, cache collisions across projects.

**Implementation Pattern** (list hook example):
```tsx
export function useRequirements(projectId: string, params: RequirementListQuery) {
  return useQuery({
    queryKey: ['projects', projectId, 'requirements', params],
    queryFn: () => fetchRequirements(projectId, params),
  });
}
```

---

## R3: Mantine Form + Zod (with Enum Constraints)

**Decision**: Use `@mantine/form` with `mantine-form-zod-resolver` for the create/edit requirement forms. Type and priority use Mantine `Select` components populated from enum constants.

**Rationale**: Same pattern as 001-project-management. The type, priority, and status fields are select-based (enum choices), which Mantine's Select handles cleanly. Zod provides shared validation between client and server.

**Alternatives Considered**:
- React Hook Form + Zod: Rejected — same rationale as 001, adds a second form library without benefit.
- Manual validation: Rejected — Constitution Principle III violation.

---

## R4: Nested Route Structure

**Decision**: Requirements routes nest under the project route: `app/api/projects/[projectId]/requirements/` for API and `app/projects/[projectId]/requirements/` for pages. The project ID is extracted from route params and validated against the authenticated user's ownership.

**Rationale**: This is the idiomatic Next.js App Router pattern for nested resources. Requirements don't exist independently — they are always scoped to a project. The nested route structure makes this relationship explicit in the URL and enables clean RLS enforcement (the project must belong to the user).

**Alternatives Considered**:
- Flat routes with projectId as query param: Rejected — less RESTful, harder to reason about authorization, doesn't leverage Next.js file-based routing conventions.
- `/api/requirements` with project_id in the body: Rejected — loses the RESTful hierarchy and makes the API less discoverable.

---

## R5: Optimistic Locking via `updated_at`

**Decision**: Same pattern as projects — compare `updated_at` from the client against the DB row. Reject with 409 CONFLICT on mismatch.

**Rationale**: Consistent with the project-level pattern already established. Reduces cognitive overhead for developers (same locking strategy across all entities).

**Alternatives Considered**:
- Last-write-wins: Rejected — silently overwrites concurrent changes.
- Version column: Rejected — `updated_at` is already maintained by a trigger; a separate version column adds complexity without benefit.

---

## R6: Soft Delete — Consistency with Parent

**Decision**: Set `deleted_at = now()` on the requirement row. Queries filter `WHERE deleted_at IS NULL`. If the parent project is soft-deleted, requirements are hidden by the project-level filter (not cascaded). A 30-day retention cleanup job handles hard deletes for both projects and requirements.

**Rationale**: Simple, consistent with the project soft-delete pattern. No cascading writes needed — the parent project's `deleted_at` filter naturally excludes its child requirements from queries.

**Alternatives Considered**:
- Cascade `deleted_at` to all child rows: Rejected — expensive writes, risk of partial updates. The parent project filter already handles this case.
- Database-level cascading delete: Rejected — removes the 30-day recovery window.

---

## R7: Requirement Status State Machine

**Decision**: Implement the transition validation in TypeScript (shared between client and server via Zod/helper function). The database allows any status value (the enum is validated at the application layer). Transitions are enforced server-side in the PATCH handler.

**Rationale**: The transition rules are simple (draft → approved/implemented/deferred, not backwards except to draft). Application-layer validation is sufficient and easier to test with unit tests. A database trigger would add complexity without meaningful defense-in-depth (the attacker would need RLS bypass first).

**Alternatives Considered**:
- Database trigger for transition validation: Rejected — overengineered for 6 transitions. Application-layer validation is the simpler approach and the spec doesn't require database-level enforcement of business rules (only security rules).
- Only showing valid buttons in UI (no server check): Rejected — bypassable via direct API calls. Server must validate.

**State Machine**:
```
draft ──────→ approved ──────→ implemented
  │                                  │
  │                                  │
  ├──────────→ deferred              │
  │                                  │
  └──────────────────────────────────┘
         (all can return to draft)
```

**Implementation**:
```typescript
export const ALLOWED_TRANSITIONS: Record<RequirementStatus, RequirementStatus[]> = {
  draft: ['approved', 'deferred'],
  approved: ['implemented', 'draft'],
  implemented: ['draft'],
  deferred: ['draft'],
};
```
