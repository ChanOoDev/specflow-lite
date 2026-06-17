# Research: Dashboard

**Feature**: 005-dashboard
**Date**: 2026-06-18

## Decision 1: Dashboard API Design

**Decision**: Create a single `GET /api/dashboard` endpoint that returns all dashboard data in one response.

**Rationale**:
- Dashboard data is always loaded together (no partial loading needed)
- Single round-trip avoids N+1 waterfall of per-project API calls
- TanStack Query `staleTime` (30s default) already provides caching
- Reduces client-side data aggregation complexity

**Alternatives considered**:
- Multiple per-entity endpoints: Rejected — 4+ API calls on page load, slower and more complex client state management
- Server component with direct Supabase queries: Rejected — dashboard requires client interactivity (refresh button, recent projects tracking), and mixing server/client patterns adds complexity

## Decision 2: Recent Projects Storage

**Decision**: Store recent project access in browser `localStorage`.

**Rationale**:
- No database migration required
- No RLS concerns (data never leaves the browser)
- Privacy-friendly — project access history stays on the user's device
- Trivially implementable with a custom hook
- Recent access is inherently a client-side concept (browser tab state)

**Alternatives considered**:
- Server-side `user_project_access` table: Rejected — requires migration, RLS policy, API endpoint, and adds latency. Over-engineered for a convenience feature.
- Session cookie: Rejected — limited to ~4KB, not ideal for structured data

## Decision 3: Dashboard as Home Page

**Decision**: Repurpose `app/page.tsx` to serve the dashboard instead of redirecting to `/projects`.

**Rationale**:
- Spec FR-001 states dashboard is the default post-login landing page
- `app/page.tsx` is already the root route — minimal change
- Unauthenticated users are handled by auth middleware redirecting to `/auth/login`
- The existing `/projects` route remains accessible via navbar

**Alternatives considered**:
- New `/dashboard` route with redirect from `/`: Rejected — unnecessary extra redirect, worse UX
- Keep `/projects` redirect and add dashboard link: Rejected — violates FR-001

## Decision 4: Task Aggregation Query

**Decision**: Use Supabase to query tasks across all user projects with a single query filtering by `owner_id` (via project join) and status.

**Rationale**:
- Supabase RLS already scopes projects to owner — tasks inherit this through project relationship
- Query: select tasks where `project.owner_id = user.id` AND `status != 'done'`, ordered by `updated_at DESC`, limit 10
- Avoids per-project task queries (N+1 problem)

**Alternatives considered**:
- Per-project task queries: Rejected — N+1 problem with many projects
- Materialized view: Rejected — over-engineered for a read of existing data

## Decision 5: Dashboard Page Layout

**Decision**: Dashboard uses the `AppShellLayout` (same as projects) and contains three sections:
1. Summary cards row (total counts)
2. Recent projects grid (clickable cards)
3. Open tasks list (table/card list)

**Rationale**:
- Consistent layout with existing app shell and navbar
- Sections map directly to the three user stories (P1, P2, P3)
- Summary cards reuse the same card pattern from project detail page

**Alternatives considered**:
- Full-page custom layout without navbar: Rejected — inconsistent UX, harder navigation
- Widget-based dashboard (drag-and-drop): Rejected — over-scoped for v1, spec doesn't mention customization
