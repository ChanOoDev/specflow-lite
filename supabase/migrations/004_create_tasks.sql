-- Create task status enum
create type task_status as enum ('todo', 'in_progress', 'done');

-- Create tasks table
create table tasks (
  id                uuid         primary key default gen_random_uuid(),
  specification_id  uuid         not null references specifications(id) on delete cascade,
  project_id        uuid         not null references projects(id) on delete cascade,
  title             text         not null,
  description       text         not null default '',
  status            task_status  not null default 'todo',
  position          integer      not null,
  owner_id          uuid         not null,
  created_at        timestamptz  not null default now(),
  updated_at        timestamptz  not null default now(),
  deleted_at        timestamptz,
  check (char_length(title) between 1 and 200),
  check (char_length(description) <= 5000),
  check (position >= 1)
);

-- Indexes on tasks
create index idx_tasks_specification_position
  on tasks (specification_id, position asc)
  where deleted_at is null;

create index idx_tasks_project_id
  on tasks (project_id)
  where deleted_at is null;

create index idx_tasks_owner_id
  on tasks (owner_id)
  where deleted_at is null;

create index idx_tasks_deleted_at
  on tasks (deleted_at)
  where deleted_at is not null;

-- Trigger: auto-update updated_at (reuses existing function from 001 migration)
create trigger trg_tasks_updated_at
  before update on tasks
  for each row
  execute function update_updated_at();

-- Trigger: denormalize owner_id and project_id from parent specification on INSERT
create or replace function set_task_owner_and_project()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    select owner_id, project_id
    into new.owner_id, new.project_id
    from specifications
    where id = new.specification_id;

    if new.owner_id is null then
      raise exception 'Specification not found for task insert';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_tasks_set_owner_and_project
  before insert on tasks
  for each row
  execute function set_task_owner_and_project();

-- Trigger: prevent modifications to tasks in approved specifications, archived/deleted projects
create or replace function check_task_mutable()
returns trigger as $$
declare
  spec_status specification_status;
  spec_deleted_at timestamptz;
  proj_status project_status;
  proj_deleted_at timestamptz;
begin
  select s.status, s.deleted_at, p.status, p.deleted_at
  into spec_status, spec_deleted_at, proj_status, proj_deleted_at
  from specifications s
  join projects p on p.id = s.project_id
  where s.id = coalesce(new.specification_id, old.specification_id);

  if proj_deleted_at is not null then
    raise exception 'Cannot modify tasks in a deleted project';
  end if;

  if spec_deleted_at is not null then
    raise exception 'Cannot modify tasks in a deleted specification';
  end if;

  if TG_OP = 'UPDATE' then
    if old.deleted_at is not null then
      raise exception 'Cannot modify a deleted task';
    end if;
  end if;

  if spec_status = 'approved' then
    -- Allow soft-delete (setting deleted_at) even on approved specs
    if TG_OP = 'UPDATE' and new.deleted_at is not null and old.deleted_at is null then
      return new;
    end if;
    raise exception 'Cannot modify tasks in an approved specification';
  end if;

  if proj_status = 'archived' then
    raise exception 'Cannot modify tasks in an archived project';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_tasks_check_mutable
  before insert or update on tasks
  for each row
  execute function check_task_mutable();

-- Row-Level Security: tasks
alter table tasks enable row level security;
alter table tasks force row level security;

create policy "Owners can select tasks"
  on tasks for select
  using ( (select auth.uid()) = owner_id );

create policy "Owners can insert tasks"
  on tasks for insert
  with check ( (select auth.uid()) = owner_id );

create policy "Owners can update tasks"
  on tasks for update
  using ( (select auth.uid()) = owner_id )
  with check ( (select auth.uid()) = owner_id );

-- No DELETE policy — deletion is handled by setting deleted_at via UPDATE
