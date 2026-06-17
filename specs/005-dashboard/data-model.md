# Data Model: Dashboard

**Feature**: 005-dashboard
**Date**: 2026-06-18

## Overview

The dashboard is a computed read-only view. It does not introduce new database tables. The "Recent Project Access" entity is stored client-side in `localStorage`.

## Existing Entities (Read-Only)

The dashboard reads from these existing entities (no schema changes):

### Project (via `projects` table)
- `id: uuid`
- `name: string`
- `status: 'active' | 'paused' | 'completed' | 'archived'`
- `owner_id: uuid` (RLS-scoped)
- `updated_at: timestamptz`

### Requirement (via `requirements` table)
- Counted per project, filtered by `deleted_at IS NULL`

### Specification (via `specifications` table)
- Counted per project, filtered by `deleted_at IS NULL`

### Task (via `tasks` table)
- `id: uuid`
- `title: string`
- `status: 'todo' | 'in_progress' | 'done'`
- `project_id: uuid` (references projects)
- `specification_id: uuid` (references specifications)
- `updated_at: timestamptz`
- Counted per project; open tasks queried across projects

## Client-Side Entity

### RecentProjectAccess (localStorage)

```typescript
interface RecentProjectAccess {
  projectId: string;
  projectName: string;
  lastAccessedAt: string; // ISO 8601
}

// Stored as JSON array under key: "specflow_recent_projects"
// Max 5 entries, ordered by lastAccessedAt descending
// Updated on navigation to any project sub-page
```

**Storage rules**:
- Maximum 5 entries (oldest evicted when limit reached)
- Deduplicated by `projectId` (re-access moves entry to top)
- Written on navigation to `/projects/[projectId]/*` routes
- Read on dashboard page load
- Survives browser refresh, lost on browser/device change (acceptable per spec assumptions)
