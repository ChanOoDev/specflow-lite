-- Create project status enum
create type project_status as enum ('active', 'paused', 'completed', 'archived');

-- Create projects table
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

-- Indexes
create index idx_projects_owner_status on projects (owner_id, status)
  where deleted_at is null;

create unique index idx_projects_owner_name on projects (owner_id, lower(name))
  where deleted_at is null;

create index idx_projects_owner_updated on projects (owner_id, updated_at desc)
  where deleted_at is null;

create index idx_projects_deleted_at on projects (deleted_at)
  where deleted_at is not null;

-- Triggers
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

-- Row-Level Security
alter table projects enable row level security;
alter table projects force row level security;

create policy "Owners can select their projects"
  on projects for select
  using ( (select auth.uid()) = owner_id );

create policy "Owners can insert projects"
  on projects for insert
  with check ( (select auth.uid()) = owner_id );

create policy "Owners can update their projects"
  on projects for update
  using ( (select auth.uid()) = owner_id )
  with check ( (select auth.uid()) = owner_id );
