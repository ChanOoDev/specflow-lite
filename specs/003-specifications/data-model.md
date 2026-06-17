# Data Model: Specification Management

**Feature**: 003-specifications
**Date**: 2026-06-17

## Entity Relationship

```
Project (1) ──→ (N) Specification (1) ──→ (N) specification_requirements (N) ←── (1) Requirement
```

## Tables

### specifications

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | Unique identifier |
| `project_id` | `uuid` | NOT NULL, FK → projects(id) ON DELETE CASCADE | Owning project |
| `owner_id` | `uuid` | NOT NULL, FK → auth.users(id) | Denormalized owner for RLS (set by trigger) |
| `title` | `text` | NOT NULL, CHECK (char_length(title) BETWEEN 1 AND 200) | Specification title |
| `description` | `text` | NULLABLE, CHECK (char_length(description) <= 5000) | Specification body/description |
| `status` | `specification_status` | NOT NULL, DEFAULT 'draft' | Lifecycle status |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | Last update timestamp (used for optimistic locking) |
| `deleted_at` | `timestamptz` | NULLABLE | Soft-delete marker; NULL = active |

**Indexes**:
```sql
CREATE INDEX idx_specifications_project_id ON specifications(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_specifications_owner_id ON specifications(owner_id);
CREATE INDEX idx_specifications_status ON specifications(project_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_specifications_updated_at ON specifications(project_id, updated_at DESC) WHERE deleted_at IS NULL;
```

### specification_requirements (Junction)

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | Unique identifier |
| `specification_id` | `uuid` | NOT NULL, FK → specifications(id) ON DELETE CASCADE | Parent specification |
| `requirement_id` | `uuid` | NOT NULL, FK → requirements(id) ON DELETE RESTRICT | Linked requirement |
| `owner_id` | `uuid` | NOT NULL, FK → auth.users(id) | Denormalized owner for RLS |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | Link creation timestamp |
| `deleted_at` | `timestamptz` | NULLABLE | Soft-unlink marker |

**Constraints**:
```sql
UNIQUE (specification_id, requirement_id)  -- Prevent duplicate links
```

**Indexes**:
```sql
CREATE INDEX idx_spec_reqs_spec_id ON specification_requirements(specification_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_spec_reqs_req_id ON specification_requirements(requirement_id) WHERE deleted_at IS NULL;
```

## Enums

### specification_status

```sql
CREATE TYPE specification_status AS ENUM (
  'draft',
  'in_progress',
  'completed',
  'approved',
  'archived'
);
```

## Triggers

### set_specification_owner (BEFORE INSERT)

Fires before INSERT on `specifications`. Copies `owner_id` from the parent project.

```sql
CREATE OR REPLACE FUNCTION set_specification_owner()
RETURNS trigger AS $$
BEGIN
  SELECT owner_id INTO NEW.owner_id
  FROM projects
  WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_specification_owner
  BEFORE INSERT ON specifications
  FOR EACH ROW
  EXECUTE FUNCTION set_specification_owner();
```

### set_spec_req_owner (BEFORE INSERT)

Fires before INSERT on `specification_requirements`. Copies `owner_id` from the parent specification.

```sql
CREATE OR REPLACE FUNCTION set_spec_req_owner()
RETURNS trigger AS $$
BEGIN
  SELECT owner_id INTO NEW.owner_id
  FROM specifications
  WHERE id = NEW.specification_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_spec_req_owner
  BEFORE INSERT ON specification_requirements
  FOR EACH ROW
  EXECUTE FUNCTION set_spec_req_owner();
```

### check_spec_req_approved (BEFORE INSERT)

Fires before INSERT on `specification_requirements`. Rejects if the linked requirement is not approved.

```sql
CREATE OR REPLACE FUNCTION check_spec_req_approved()
RETURNS trigger AS $$
DECLARE
  req_status requirement_status;
BEGIN
  SELECT status INTO req_status
  FROM requirements
  WHERE id = NEW.requirement_id;
  
  IF req_status != 'approved' THEN
    RAISE EXCEPTION 'Only approved requirements can be linked to a specification';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_spec_req_approved
  BEFORE INSERT ON specification_requirements
  FOR EACH ROW
  EXECUTE FUNCTION check_spec_req_approved();
```

### check_specification_mutable (BEFORE UPDATE)

Fires before UPDATE on `specifications`. Rejects modifications to specifications in archived or soft-deleted projects.

```sql
CREATE OR REPLACE FUNCTION check_specification_mutable()
RETURNS trigger AS $$
DECLARE
  proj_status project_status;
  proj_deleted_at timestamptz;
BEGIN
  SELECT status, deleted_at INTO proj_status, proj_deleted_at
  FROM projects
  WHERE id = NEW.project_id;
  
  IF proj_status = 'archived' THEN
    RAISE EXCEPTION 'Cannot modify specifications in an archived project';
  END IF;
  
  IF proj_deleted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot modify specifications in a deleted project';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_specification_mutable
  BEFORE UPDATE ON specifications
  FOR EACH ROW
  EXECUTE FUNCTION check_specification_mutable();
```

## RLS Policies

### specifications

```sql
-- Select: owner only
CREATE POLICY "Owners can select specifications"
  ON specifications FOR SELECT
  USING ( (select auth.uid()) = owner_id );

-- Insert: owner only (enforced by trigger)
CREATE POLICY "Owners can insert specifications"
  ON specifications FOR INSERT
  WITH CHECK ( (select auth.uid()) = owner_id );

-- Update: owner only
CREATE POLICY "Owners can update specifications"
  ON specifications FOR UPDATE
  USING ( (select auth.uid()) = owner_id );
```

### specification_requirements

```sql
-- Select: owner only
CREATE POLICY "Owners can select specification requirements"
  ON specification_requirements FOR SELECT
  USING ( (select auth.uid()) = owner_id );

-- Insert: owner only
CREATE POLICY "Owners can insert specification requirements"
  ON specification_requirements FOR INSERT
  WITH CHECK ( (select auth.uid()) = owner_id );

-- Update (soft-delete for unlinking): owner only
CREATE POLICY "Owners can update specification requirements"
  ON specification_requirements FOR UPDATE
  USING ( (select auth.uid()) = owner_id );
```

## Status Transitions

```text
draft       → in_progress, archived
in_progress → completed, draft
completed   → approved, draft
approved    → (none — terminal)
archived    → draft (reopen)
```

## Soft-Delete Semantics

- **Specification soft-delete**: Sets `deleted_at = now()`. All linked `specification_requirements` rows are soft-deleted (set `deleted_at = now()`). Linked requirements are untouched.
- **30-day retention**: Soft-deleted records are retained for 30 days. After that, they may be purged.
- **Unlink individual requirement**: Set `deleted_at` on the junction row only. The specification and requirement are untouched.
