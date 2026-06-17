# Data Model: Requirements Management

**Created**: 2026-06-17 | **Feature**: [spec.md](./spec.md)

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
│   projects   │──1:N──→│   requirements   │
│              │        │                  │
└──────────────┘        └──────────────────┘
       │
       │ owner_id is denormalized
       │ from projects into requirements
       │ for RLS efficiency
```

*Requirements inherit `owner_id` from the parent project for efficient RLS. See [research.md](./research.md) R1 for rationale.*

---

## Table: `requirements`

### Schema

```sql
create type requirement_type as enum ('functional', 'non_functional', 'technical', 'ux');

create type requirement_priority as enum ('p1', 'p2', 'p3', 'p4', 'p5');

create type requirement_status as enum ('draft', 'approved', 'implemented', 'deferred');

create table requirements (
  id          uuid                primary key default gen_random_uuid(),
  project_id  uuid                not null references projects(id) on delete cascade,
  title       text                not null,
  description text                not null default '',
  type        requirement_type    not null,
  priority    requirement_priority not null,
  status      requirement_status  not null default 'draft',
  owner_id    uuid                not null,
  created_at  timestamptz         not null default now(),
  updated_at  timestamptz         not null default now(),
  deleted_at  timestamptz
);
```

### Column Details

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `uuid` | Yes | `gen_random_uuid()` | Primary key |
| `project_id` | `uuid` | Yes | — | FK to `projects(id)`, cascade on project delete |
| `title` | `text` | Yes | — | 1–200 chars, trimmed, duplicates allowed per project |
| `description` | `text` | Yes | `''` | 0–3000 chars, plain text |
| `type` | `requirement_type` | Yes | — | Enum: functional, non_functional, technical, ux |
| `priority` | `requirement_priority` | Yes | — | Enum: p1, p2, p3, p4, p5 |
| `status` | `requirement_status` | Yes | `'draft'` | Enum: draft, approved, implemented, deferred |
| `owner_id` | `uuid` | Yes | — | Denormalized from projects, set on creation, immutable |
| `created_at` | `timestamptz` | Yes | `now()` | Immutable |
| `updated_at` | `timestamptz` | Yes | `now()` | Auto-updated by trigger on any row change |
| `deleted_at` | `timestamptz` | No | null | Soft-delete marker; 30-day retention |

### Indexes

```sql
-- List query: project_id + updated_at ordering (most common query)
create index idx_requirements_project_updated
  on requirements (project_id, updated_at desc)
  where deleted_at is null;

-- Search by title within a project
create index idx_requirements_project_title
  on requirements (project_id, lower(title))
  where deleted_at is null;

-- Filter by type within a project
create index idx_requirements_project_type
  on requirements (project_id, type)
  where deleted_at is null;

-- Filter by priority within a project
create index idx_requirements_project_priority
  on requirements (project_id, priority)
  where deleted_at is null;

-- Filter by status within a project
create index idx_requirements_project_status
  on requirements (project_id, status)
  where deleted_at is null;

-- Soft-delete cleanup job
create index idx_requirements_deleted_at
  on requirements (deleted_at)
  where deleted_at is not null;

-- RLS: owner_id filter (used in every query via RLS policy)
create index idx_requirements_owner_id
  on requirements (owner_id)
  where deleted_at is null;
```

### Triggers

```sql
-- Auto-update updated_at on any row change
create trigger trg_requirements_updated_at
  before update on requirements
  for each row
  execute function update_updated_at();

-- Enforce owner_id matches parent project (set on INSERT only)
create or replace function set_requirement_owner()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    select owner_id into new.owner_id
    from projects
    where id = new.project_id;

    if new.owner_id is null then
      raise exception 'Project not found for requirement insert';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_requirements_set_owner
  before insert on requirements
  for each row
  execute function set_requirement_owner();

-- Prevent modifications to archived/deleted projects
create or replace function check_requirement_mutable()
returns trigger as $$
declare
  project_status_val project_status;
  project_deleted_at timestamptz;
begin
  select status, deleted_at
  into project_status_val, project_deleted_at
  from projects
  where id = coalesce(new.project_id, old.project_id);

  if project_deleted_at is not null then
    raise exception 'Cannot modify requirements in a deleted project';
  end if;

  if TG_OP = 'UPDATE' then
    if old.deleted_at is not null then
      raise exception 'Cannot modify a deleted requirement';
    end if;
    if project_status_val = 'archived' and (new.status != old.status or new.title != old.title) then
      raise exception 'Cannot modify requirements in an archived project';
    end if;
  end if;

  if TG_OP = 'INSERT' and project_status_val = 'archived' then
    raise exception 'Cannot create requirements in an archived project';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_requirements_check_mutable
  before insert or update on requirements
  for each row
  execute function check_requirement_mutable();
```

### RLS Policies

```sql
alter table requirements enable row level security;
alter table requirements force row level security;

-- SELECT: owners can read their non-deleted requirements
create policy "Owners can select requirements"
  on requirements for select
  using ( (select auth.uid()) = owner_id );

-- INSERT: owners can insert requirements in their projects (owner_id set by trigger)
create policy "Owners can insert requirements"
  on requirements for insert
  with check ( (select auth.uid()) = owner_id );

-- UPDATE: owners can update their non-deleted requirements
create policy "Owners can update requirements"
  on requirements for update
  using ( (select auth.uid()) = owner_id )
  with check ( (select auth.uid()) = owner_id );

-- DELETE: soft delete only (set deleted_at via UPDATE, not via DELETE policy)
-- No DELETE policy needed — deletion is handled by setting deleted_at via UPDATE
```

### Status State Machine

```
draft ──────→ approved ──────→ implemented
  │              │                  │
  │              │                  │
  ├── deferred   └──→ draft ←──────┘
  │                  ↑
  └──→ draft ←───────┘

Transitions:
  draft       → approved
  draft       → deferred
  approved    → implemented
  approved    → draft
  implemented → draft
  deferred    → draft
```

### Status Semantics

| Status | Meaning | Next States |
|--------|---------|-------------|
| `draft` | Requirement is being written | approved, deferred |
| `approved` | Accepted for implementation | implemented, draft |
| `implemented` | Done — the requirement is met | draft |
| `deferred` | Shelved for later consideration | draft |

---

## Relationship to Projects

- `project_id` FK to `projects(id)` with `ON DELETE CASCADE` (hard delete only for cleanup jobs).
- `owner_id` is denormalized from `projects.owner_id` on INSERT via trigger.
- Requirement counts on the project detail page are computed via `SELECT COUNT(*) FROM requirements WHERE project_id = $1 AND deleted_at IS NULL`.
- When the parent project is archived, requirements become read-only (enforced by `check_requirement_mutable` trigger).
- When the parent project is soft-deleted, requirements are hidden (filtered via the project's `deleted_at` check at query time in API routes).
