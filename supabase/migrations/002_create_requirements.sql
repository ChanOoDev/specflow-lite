-- Create requirement enums
create type requirement_type as enum ('functional', 'non_functional', 'technical', 'ux');

create type requirement_priority as enum ('p1', 'p2', 'p3', 'p4', 'p5');

create type requirement_status as enum ('draft', 'approved', 'implemented', 'deferred');

-- Create requirements table
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

-- Indexes
create index idx_requirements_project_updated
  on requirements (project_id, updated_at desc)
  where deleted_at is null;

create index idx_requirements_project_title
  on requirements (project_id, lower(title))
  where deleted_at is null;

create index idx_requirements_project_type
  on requirements (project_id, type)
  where deleted_at is null;

create index idx_requirements_project_priority
  on requirements (project_id, priority)
  where deleted_at is null;

create index idx_requirements_project_status
  on requirements (project_id, status)
  where deleted_at is null;

create index idx_requirements_deleted_at
  on requirements (deleted_at)
  where deleted_at is not null;

create index idx_requirements_owner_id
  on requirements (owner_id)
  where deleted_at is null;

-- Trigger: auto-update updated_at (reuses existing function from 001 migration)
create trigger trg_requirements_updated_at
  before update on requirements
  for each row
  execute function update_updated_at();

-- Trigger: denormalize owner_id from parent project on INSERT
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

-- Trigger: prevent modifications to archived/deleted projects
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
    if project_status_val = 'archived' then
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

-- Row-Level Security
alter table requirements enable row level security;
alter table requirements force row level security;

create policy "Owners can select requirements"
  on requirements for select
  using ( (select auth.uid()) = owner_id );

create policy "Owners can insert requirements"
  on requirements for insert
  with check ( (select auth.uid()) = owner_id );

create policy "Owners can update requirements"
  on requirements for update
  using ( (select auth.uid()) = owner_id )
  with check ( (select auth.uid()) = owner_id );

-- No DELETE policy — deletion is handled by setting deleted_at via UPDATE
