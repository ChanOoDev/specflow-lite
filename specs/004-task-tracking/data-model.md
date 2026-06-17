# Data Model: Task & Implementation Tracking

**Feature**: 004-task-tracking
**Date**: 2026-06-18

## Entity Relationship

```
Project (1) ──→ (N) Specification (1) ──→ (N) Task
```

Tasks directly belong to specifications. There is no junction table — tasks are standalone entities.

## Tables

### tasks

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | Unique identifier |
| `specification_id` | `uuid` | NOT NULL, FK → specifications(id) ON DELETE CASCADE | Parent specification |
| `project_id` | `uuid` | NOT NULL, FK → projects(id) ON DELETE CASCADE | Denormalized project for count queries |
| `owner_id` | `uuid` | NOT NULL, FK → auth.users(id) | Denormalized owner for RLS (set by trigger from specification) |
| `title` | `text` | NOT NULL, CHECK (char_length(title) BETWEEN 1 AND 200) | Task title |
| `description` | `text` | NOT NULL DEFAULT '', CHECK (char_length(description) <= 5000) | Task description/notes |
| `status` | `task_status` | NOT NULL, DEFAULT 'todo' | Lifecycle status |
| `position` | `integer` | NOT NULL, CHECK (position >= 1) | Manual ordering position within specification |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | Last update timestamp (used for optimistic locking) |
| `deleted_at` | `timestamptz` | NULLABLE | Soft-delete marker; NULL = active |

**Indexes**:
```sql
CREATE INDEX idx_tasks_specification_position
  ON tasks (specification_id, position ASC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_tasks_project_id
  ON tasks (project_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_tasks_owner_id
  ON tasks (owner_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_tasks_deleted_at
  ON tasks (deleted_at)
  WHERE deleted_at IS NOT NULL;
```

## Enums

### task_status

```sql
CREATE TYPE task_status AS ENUM (
  'todo',
  'in_progress',
  'done'
);
```

## Triggers

### set_task_owner_and_project (BEFORE INSERT)

Fires before INSERT on `tasks`. Copies `owner_id` and `project_id` from the parent specification.

```sql
CREATE OR REPLACE FUNCTION set_task_owner_and_project()
RETURNS trigger AS $$
BEGIN
  SELECT owner_id, project_id
  INTO NEW.owner_id, NEW.project_id
  FROM specifications
  WHERE id = NEW.specification_id;

  IF NEW.owner_id IS NULL THEN
    RAISE EXCEPTION 'Specification not found for task insert';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tasks_set_owner_and_project
  BEFORE INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_task_owner_and_project();
```

### check_task_mutable (BEFORE INSERT OR UPDATE)

Fires before INSERT or UPDATE on `tasks`. Rejects mutations when:
- The parent specification is `approved`
- The parent project is `archived`
- The parent project or specification is soft-deleted

```sql
CREATE OR REPLACE FUNCTION check_task_mutable()
RETURNS trigger AS $$
DECLARE
  spec_status specification_status;
  spec_deleted_at timestamptz;
  proj_status project_status;
  proj_deleted_at timestamptz;
BEGIN
  SELECT s.status, s.deleted_at, p.status, p.deleted_at
  INTO spec_status, spec_deleted_at, proj_status, proj_deleted_at
  FROM specifications s
  JOIN projects p ON p.id = s.project_id
  WHERE s.id = COALESCE(NEW.specification_id, OLD.specification_id);

  IF proj_deleted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot modify tasks in a deleted project';
  END IF;

  IF spec_deleted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot modify tasks in a deleted specification';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.deleted_at IS NOT NULL THEN
      RAISE EXCEPTION 'Cannot modify a deleted task';
    END IF;
  END IF;

  IF spec_status = 'approved' THEN
    -- Allow soft-delete even on approved specs
    IF TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Cannot modify tasks in an approved specification';
  END IF;

  IF proj_status = 'archived' THEN
    RAISE EXCEPTION 'Cannot modify tasks in an archived project';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tasks_check_mutable
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION check_task_mutable();
```

### auto_update_updated_at (BEFORE UPDATE)

Reuses the existing `update_updated_at()` function from 001 migration.

```sql
CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## RLS Policies

```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks FORCE ROW LEVEL SECURITY;

-- Select: owner only
CREATE POLICY "Owners can select tasks"
  ON tasks FOR SELECT
  USING ( (select auth.uid()) = owner_id );

-- Insert: owner only (enforced by trigger)
CREATE POLICY "Owners can insert tasks"
  ON tasks FOR INSERT
  WITH CHECK ( (select auth.uid()) = owner_id );

-- Update: owner only
CREATE POLICY "Owners can update tasks"
  ON tasks FOR UPDATE
  USING ( (select auth.uid()) = owner_id )
  WITH CHECK ( (select auth.uid()) = owner_id );

-- No DELETE policy — deletion is handled by setting deleted_at via UPDATE
```

## Status Transitions

```text
todo        → in_progress
in_progress → done, todo
done        → in_progress
```

Invalid transitions (enforced at API level):
- todo → done (must pass through in_progress)
- done → todo (must pass through in_progress)

## Position Semantics

- **On create**: Position is auto-assigned to `MAX(position) FROM tasks WHERE specification_id = $1 AND deleted_at IS NULL + 1`. The client can optionally specify a target position.
- **On explicit reorder**: The user can set an explicit position in the edit form. If the target position is occupied, the row at that position (and all subsequent rows) shift down.
- **On delete**: After soft-deleting a task, remaining task positions are compacted to be sequential (1, 2, 3, …) with no gaps.
- **Position clamping**: If a user specifies a position beyond `MAX + 1`, it is clamped to `MAX + 1`.

## Soft-Delete Semantics

- **Task soft-delete**: Sets `deleted_at = now()`. Remaining task positions within the same specification are compacted.
- **Specification soft-delete cascade**: Tasks are not soft-deleted when their specification is. Instead, the specification-level RLS/API check hides them — tasks become inaccessible through normal navigation but remain in the database.
- **30-day retention**: Soft-deleted records are retained for 30 days. After that, they may be purged.
