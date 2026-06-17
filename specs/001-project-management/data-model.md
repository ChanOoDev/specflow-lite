# Data Model: Project Management

**Created**: 2026-06-15 | **Feature**: [spec.md](./spec.md)

## Entity Relationship

```
┌──────────────┐
│  auth.users  │
│  (Supabase)  │
└──────┬───────┘
       │ 1
       │
       │ N
┌──────┴───────┐        ┌──────────────────┐
│   projects   │───────→│  requirements    │
│              │ 1    N │  (future)        │
└──────────────┘        └──────────────────┘
       │                         │
       │ 1                       │ N
       │                         │
       │ N                       │
┌──────┴───────┐        ┌────────┴─────────┐
│  specs       │        │     tasks        │
│  (future)    │        │    (future)      │
└──────────────┘        └──────────────────┘
```

*Child entities (requirements, specs, tasks) are documented here only as relationships. Their schemas belong to their respective features.*

---

## Table: `projects`

### Schema

```sql
create type project_status as enum ('active', 'paused', 'completed', 'archived');

create table projects (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  description text        not null default '',
  status      project_status not null default 'active',
  owner_id    uuid        not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  archived_at timestamptz,
  deleted_at  timestamptz
);
```

### Column Details

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `uuid` | Yes | `gen_random_uuid()` | Primary key |
| `name` | `text` | Yes | — | 1–120 chars, trimmed, unique per owner among non-deleted projects |
| `description` | `text` | Yes | `''` | 0–2000 chars, plain text |
| `status` | `project_status` | Yes | `'active'` | Enum: active, paused, completed, archived |
| `owner_id` | `uuid` | Yes | — | FK to `auth.users(id)`, set on creation, immutable |
| `created_at` | `timestamptz` | Yes | `now()` | Immutable |
| `updated_at` | `timestamptz` | Yes | `now()` | Auto-updated by trigger on any row change |
| `archived_at` | `timestamptz` | No | null | Set when status → archived; cleared on restore |
| `deleted_at` | `timestamptz` | No | null | Soft-delete marker; 30-day retention |

### Indexes

```sql
-- List query: owner_id + status filter (most common query)
create index idx_projects_owner_status on projects (owner_id, status)
  where deleted_at is null;

-- Name uniqueness check per owner (case-insensitive)
create unique index idx_projects_owner_name on projects (owner_id, lower(name))
  where deleted_at is null;

-- Updated_at ordering
create index idx_projects_owner_updated on projects (owner_id, updated_at desc)
  where deleted_at is null;

-- Soft-delete cleanup job
create index idx_projects_deleted_at on projects (deleted_at)
  where deleted_at is not null;
```

### Triggers

```sql
-- Auto-update updated_at on any row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_projects_updated_at
  before update on projects
  for each row
  execute function update_updated_at();

-- Set archived_at when status changes to archived
create or replace function set_archived_at()
returns trigger as $$
begin
  if new.status = 'archived' and old.status != 'archived' then
    new.archived_at = now();
  elsif new.status != 'archived' and old.status = 'archived' then
    new.archived_at = null;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_projects_archived_at
  before update on projects
  for each row
  execute function set_archived_at();

-- Prevent status changes on archived or deleted projects
create or replace function check_project_mutable()
returns trigger as $$
begin
  if old.deleted_at is not null then
    raise exception 'Cannot modify a deleted project';
  end if;
  if old.status = 'archived' and new.status != 'active' then
    raise exception 'Archived projects can only be restored to active';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_projects_check_mutable
  before update on projects
  for each row
  execute function check_project_mutable();
```

### RLS Policies

```sql
alter table projects enable row level security;
alter table projects force row level security;

-- SELECT: owners can read their non-deleted projects
create policy "Owners can select their projects"
  on projects for select
  using ( (select auth.uid()) = owner_id );

-- INSERT: authenticated users can create projects they own
create policy "Owners can insert projects"
  on projects for insert
  with check ( (select auth.uid()) = owner_id );

-- UPDATE: owners can update their non-deleted projects
create policy "Owners can update their projects"
  on projects for update
  using ( (select auth.uid()) = owner_id )
  with check ( (select auth.uid()) = owner_id );

-- DELETE: no hard deletes through API (soft delete via update only)
-- No DELETE policy needed — deletion is handled by setting deleted_at via UPDATE

-- Archived projects: readable but not mutable (enforced by trigger + application logic)
-- Soft-deleted projects: excluded from all queries via application WHERE clause
```

### Status State Machine

```
                 ┌──────────┐
          ┌─────→│  active  │←─────┐
          │      └────┬─────┘      │
          │           │            │
          │      ┌────┴─────┐      │
          │      │  paused   │      │
          │      └────┬─────┘      │
          │           │            │
          │      ┌────┴─────┐      │
          │      │completed │      │
          │      └────┬─────┘      │
          │           │            │
          │      ┌────┴─────┐      │
          └──────│ archived  │──────┘
                 └──────────┘

Transitions:
  active    → paused
  active    → completed
  active    → archived
  paused    → active
  paused    → archived
  completed → archived
  archived  → active (restore)
```

---

## Computed Fields (Not Stored)

These are calculated at query time via subqueries or joins. They are NOT denormalized columns.

| Field | Calculation | Notes |
|-------|-------------|-------|
| `requirement_count` | `select count(*) from requirements where project_id = $1 and deleted_at is null` | Returns 0 while requirements feature is not yet implemented |
| `specification_count` | `select count(*) from specifications where project_id = $1 and deleted_at is null` | Returns 0 while specifications feature is not yet implemented |
| `task_count` | `select count(*) from tasks where project_id = $1 and deleted_at is null` | Returns 0 while tasks feature is not yet implemented |
| `completed_task_count` | `select count(*) from tasks where project_id = $1 and status = 'completed' and deleted_at is null` | Returns 0 while tasks feature is not yet implemented |

*Child artifact tables don't exist yet. Initially, these counts return 0. The query structure should gracefully handle the absence of these tables (e.g., use LEFT JOIN or COALESCE).*
