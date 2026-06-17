# Research: Project Management

**Created**: 2026-06-15 | **Feature**: [spec.md](./spec.md)

## R1: Supabase RLS Policies for Single-Owner Access

**Decision**: Use `auth.uid()` in RLS policies for all project table operations, matching `owner_id` against the authenticated user's UUID.

**Rationale**: The Supabase recommended pattern uses `(select auth.uid()) = owner_id` for SELECT, INSERT, UPDATE, and DELETE policies. This is database-enforced — even if the API layer is bypassed, data remains protected. RLS is enabled on the `projects` table and `force row level security` is applied so even table owners are constrained.

**Alternatives Considered**:
- API-only authorization: Rejected because defense-in-depth requires database-level enforcement (Constitution Principle III).
- App-level user context via `current_setting('app.current_user_id')`: Rejected because `auth.uid()` is the Supabase-native method and integrates with Supabase Auth automatically.

**Implementation**:
```sql
alter table projects enable row level security;
alter table projects force row level security;

create policy "Owners can select their projects" on projects
  for select using ((select auth.uid()) = owner_id);

create policy "Owners can insert projects" on projects
  for insert with check ((select auth.uid()) = owner_id);

create policy "Owners can update their projects" on projects
  for update using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Owners can delete their projects" on projects
  for delete using ((select auth.uid()) = owner_id);
```

---

## R2: TanStack Query Optimistic Updates

**Decision**: Use `useMutation` with `onMutate`/`onError`/`onSettled` pattern for archive, restore, and status changes. Plain mutations (without optimistic updates) for create and delete.

**Rationale**: Status transitions (archive/restore) benefit from instant UI feedback — the user sees the project move immediately. Create and delete don't need optimistic updates: create requires navigation to the new project (server needs to respond with the ID), and delete has a confirmation dialog (no rush).

**Alternatives Considered**:
- Optimistic updates for all mutations: Rejected — adds complexity for create (no ID until server responds) and delete (confirmation dialog already handles UX).
- No optimistic updates at all: Rejected — status changes would feel sluggish.

**Implementation Pattern** (archive example):
```tsx
const queryClient = useQueryClient();

const archiveMutation = useMutation({
  mutationFn: (projectId: string) => archiveProject(projectId),
  onMutate: async (projectId) => {
    await queryClient.cancelQueries({ queryKey: ['projects'] });
    const previous = queryClient.getQueryData(['projects']);
    queryClient.setQueryData(['projects'], (old) =>
      old.map((p) => (p.id === projectId ? { ...p, status: 'archived' } : p))
    );
    return { previous };
  },
  onError: (err, projectId, context) => {
    queryClient.setQueryData(['projects'], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  },
});
```

---

## R3: Mantine Form + Zod Validation

**Decision**: Use `@mantine/form` with `mantine-form-zod-resolver` package for project create/edit forms.

**Rationale**: Mantine's `useForm` hook integrates directly with Zod via `zodResolver`. This gives us type-safe form state, inline field errors, and a single validation source of truth (the Zod schema) shared between client and server.

**Alternatives Considered**:
- React Hook Form + Zod: Rejected — Mantine's native form adds complexity with a second library and doesn't integrate as cleanly with Mantine components.
- Manual validation: Rejected — violates Constitution Principle III (Zod on all inputs).

**Implementation**:
```tsx
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(120, 'Project name must be 120 characters or fewer'),
  description: z.string().max(2000, 'Description must be 2000 characters or fewer').optional(),
});

const form = useForm({
  initialValues: { name: '', description: '' },
  validate: zodResolver(projectSchema),
});
```

---

## R4: Next.js App Router Project Structure

**Decision**: Use Next.js App Router with server components as the default, client components only where interactivity is needed. API routes under `app/api/projects/` for the backend layer.

**Rationale**: Next.js App Router provides server-side rendering by default (Constitution Principle V: server components preferred). Server components fetch data directly from Supabase; client components handle forms, modals, and search. The `app/api/` directory serves as the API layer for mutations.

**Alternatives Considered**:
- Pages Router: Rejected — App Router is the current Next.js standard and supports server components.
- Separate Express backend: Rejected — adds deployment complexity without benefit for this scope.

**Component Split (Server vs Client)**:

| Component | Type | Reason |
|-----------|------|--------|
| `app/projects/page.tsx` | Server | Data fetching, no interactivity |
| `app/projects/[projectId]/page.tsx` | Server | Data fetching, no interactivity |
| `app/projects/new/page.tsx` | Client | Form interactivity |
| `app/projects/[projectId]/settings/page.tsx` | Client | Form interactivity |
| `ProjectList` | Client | Search + filter interactivity |
| `ProjectCard` | Server | Display only |
| `EmptyState` | Server | Display only |
| `DeleteConfirmModal` | Client | Modal interactivity |
| `StatusBadge` | Server | Display only |
| `ProjectForm` | Client | Form interactivity |

---

## R5: Optimistic Locking Strategy

**Decision**: Include `updated_at` from the client's last read as a concurrency token. Server compares it against the current row value. If they differ, reject with 409 Conflict.

**Rationale**: Simpler than version numbers or ETags, and `updated_at` is already maintained by a database trigger. The conflict window is small (time between load and save), and the UX impact is minimal — just a refresh prompt.

**Alternatives Considered**:
- Last-write-wins: Rejected — silently overwrites concurrent changes, which violates spec FR-010.
- Version column: Rejected — adds a dedicated column for something `updated_at` already provides.
- WebSocket lock notifications: Rejected — overengineered for single-owner projects. Concurrent editing is rare.

---

## R6: Soft Delete with Artifact Cascade

**Decision**: Set `deleted_at = now()` on the project row only. Child artifact queries join through `projects` and exclude rows where `projects.deleted_at IS NOT NULL`. A background job (Supabase cron or pg_cron) permanently deletes projects where `deleted_at < now() - interval '30 days'`.

**Rationale**: Setting `deleted_at` on every child record is expensive at write time and creates consistency risk. The join-based approach is cheaper at write time and the `owner_id + deleted_at` composite index keeps read performance acceptable.

**Alternatives Considered**:
- Cascade `deleted_at` to all children: Rejected — expensive writes, risk of partial updates.
- Application-level filtering: Rejected — fragile and easily missed by new queries.
- Database view with soft-delete filter: Rejected — adds maintenance overhead. Direct JOIN in queries is more explicit.
