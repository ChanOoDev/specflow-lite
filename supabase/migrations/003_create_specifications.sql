-- Create specification status enum
create type specification_status as enum ('draft', 'in_progress', 'completed', 'approved', 'archived');

-- Create specifications table
create table specifications (
  id          uuid                  primary key default gen_random_uuid(),
  project_id  uuid                  not null references projects(id) on delete cascade,
  title       text                  not null,
  description text                  not null default '',
  status      specification_status  not null default 'draft',
  owner_id    uuid                  not null,
  created_at  timestamptz           not null default now(),
  updated_at  timestamptz           not null default now(),
  deleted_at  timestamptz
);

-- Create specification_requirements junction table
create table specification_requirements (
  id                uuid        primary key default gen_random_uuid(),
  specification_id  uuid        not null references specifications(id) on delete cascade,
  requirement_id    uuid        not null references requirements(id) on delete cascade,
  owner_id          uuid        not null,
  created_at        timestamptz not null default now(),
  unique(specification_id, requirement_id)
);

-- Indexes on specifications
create index idx_specifications_project_updated
  on specifications (project_id, updated_at desc)
  where deleted_at is null;

create index idx_specifications_project_status
  on specifications (project_id, status)
  where deleted_at is null;

create index idx_specifications_owner_id
  on specifications (owner_id)
  where deleted_at is null;

create index idx_specifications_deleted_at
  on specifications (deleted_at)
  where deleted_at is not null;

-- Indexes on specification_requirements
create index idx_spec_req_specification_id
  on specification_requirements (specification_id);

create index idx_spec_req_requirement_id
  on specification_requirements (requirement_id);

-- Trigger: auto-update updated_at (reuses existing function from 001 migration)
create trigger trg_specifications_updated_at
  before update on specifications
  for each row
  execute function update_updated_at();

-- Trigger: denormalize owner_id from parent project on INSERT
create or replace function set_specification_owner()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    select owner_id into new.owner_id
    from projects
    where id = new.project_id;

    if new.owner_id is null then
      raise exception 'Project not found for specification insert';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_specifications_set_owner
  before insert on specifications
  for each row
  execute function set_specification_owner();

-- Trigger: denormalize owner_id into junction table from parent specification
create or replace function set_spec_req_owner()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    select owner_id into new.owner_id
    from specifications
    where id = new.specification_id;

    if new.owner_id is null then
      raise exception 'Specification not found for junction insert';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_spec_req_set_owner
  before insert on specification_requirements
  for each row
  execute function set_spec_req_owner();

-- Trigger: ensure only approved requirements can be linked
create or replace function check_spec_req_approved()
returns trigger as $$
declare
  req_status requirement_status;
begin
  select status into req_status
  from requirements
  where id = new.requirement_id;

  if req_status is null then
    raise exception 'Requirement not found';
  end if;

  if req_status != 'approved' then
    raise exception 'Only approved requirements can be linked to a specification';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_spec_req_check_approved
  before insert on specification_requirements
  for each row
  execute function check_spec_req_approved();

-- Trigger: prevent modifications to approved specifications and archived/deleted projects
create or replace function check_specification_mutable()
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
    raise exception 'Cannot modify specifications in a deleted project';
  end if;

  if TG_OP = 'UPDATE' then
    if old.deleted_at is not null then
      raise exception 'Cannot modify a deleted specification';
    end if;
    if old.status = 'approved' then
      -- Allow soft-delete (setting deleted_at) even on approved specs
      if new.deleted_at is not null and old.deleted_at is null then
        return new;
      end if;
      raise exception 'Cannot modify an approved specification';
    end if;
    if project_status_val = 'archived' then
      raise exception 'Cannot modify specifications in an archived project';
    end if;
  end if;

  if TG_OP = 'INSERT' and project_status_val = 'archived' then
    raise exception 'Cannot create specifications in an archived project';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_specifications_check_mutable
  before insert or update on specifications
  for each row
  execute function check_specification_mutable();

-- Row-Level Security: specifications
alter table specifications enable row level security;
alter table specifications force row level security;

create policy "Owners can select specifications"
  on specifications for select
  using ( (select auth.uid()) = owner_id );

create policy "Owners can insert specifications"
  on specifications for insert
  with check ( (select auth.uid()) = owner_id );

create policy "Owners can update specifications"
  on specifications for update
  using ( (select auth.uid()) = owner_id )
  with check ( (select auth.uid()) = owner_id );

-- No DELETE policy — deletion is handled by setting deleted_at via UPDATE

-- Row-Level Security: specification_requirements
alter table specification_requirements enable row level security;
alter table specification_requirements force row level security;

create policy "Owners can select spec requirements"
  on specification_requirements for select
  using ( (select auth.uid()) = owner_id );

create policy "Owners can insert spec requirements"
  on specification_requirements for insert
  with check ( (select auth.uid()) = owner_id );

create policy "Owners can delete spec requirements"
  on specification_requirements for delete
  using ( (select auth.uid()) = owner_id );
