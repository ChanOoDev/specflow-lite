# Research: Project Info

**Feature**: 006-project-info  
**Date**: 2026-06-18  
**Status**: Complete

## Research Questions

### RQ-1: Static data or API-driven?

**Context**: The Project Info page displays project statistics, agent definitions, skill lists, tech stack, and feature summaries — all fixed metadata about the project itself.

**Decision**: Static inline data in the component.

**Rationale**:
- Data reflects the project's build-time state, not user-generated content
- Changes infrequently (only when new features, agents, or tools are added)
- No authentication gate needed — the page is a public informational resource
- Eliminates an API call, reducing page load time and complexity
- Follows the existing pattern of informational "about" pages in developer tools

**Alternatives considered**:
- API-driven with database tables — Rejected. Overengineered for static metadata. Would require RLS, migrations, and admin CRUD for data that changes once per feature cycle.
- Markdown/MDX file — Rejected. Would require an MDX renderer dependency. The component already uses Mantine which provides rich layout primitives.
- Environment-driven (config file) — Rejected. No need for per-environment variation; the project metadata is the same across all deployments.

### RQ-2: Client component or server component?

**Context**: The page uses Mantine components (Timeline, Table, Card, Paper, SimpleGrid, Badge, ThemeIcon) and Tabler Icons.

**Decision**: Client component (`"use client"`).

**Rationale**:
- Mantine components (Timeline, ThemeIcon, Badge) require client-side rendering
- Tabler Icons are React components that render SVG elements dynamically
- No data fetching is needed, so there's no server-component benefit here
- The page is informational — SEO is not a concern, so server-side rendering provides no advantage

**Alternatives considered**:
- Server component with static HTML — Rejected. Would require rewriting Mantine components as raw HTML, defeating the purpose of using the component library.
- Hybrid (server layout + client page) — Already the chosen approach. `layout.tsx` can remain thin, `page.tsx` renders the client component.

### RQ-3: Where to place the route?

**Context**: The page should be accessible from the main navigation.

**Decision**: Route at `/project-info` with a nav link in the existing `navbar.tsx`.

**Rationale**:
- Follows Next.js App Router convention: `app/project-info/page.tsx`
- Consistent with existing routes: `/projects`, `/requirements`, `/specifications`, `/tasks`
- Navbar already has a `NavLink` component pattern — adding one more item is straightforward
- No nested routes needed — this is a single flat page

**Alternatives considered**:
- `/about` — Rejected. Too generic; `project-info` better describes the content.
- `/` (root, replacing dashboard) — Rejected. Dashboard is the landing page; project info is supplementary reference.

### RQ-4: Responsive strategy?

**Context**: The page has grids (stats bar, agent cards, feature cards, spec kit commands) and tables (skills, MCP tools, tech stack).

**Decision**: Use Mantine's `SimpleGrid` with breakpoint-aware `cols` prop and native `Table` component.

**Rationale**:
- `SimpleGrid` supports breakpoint objects: `cols={{ base: 1, sm: 2, md: 3 }}`
- Stat bar uses `cols={{ base: 4, sm: 8 }}` — wraps to 4 columns on mobile
- Tables with `style={{ overflow: 'hidden' }}` on wrapping `Paper` prevent horizontal overflow
- No custom CSS or media queries needed — all responsive behavior comes from Mantine

**Alternatives considered**:
- CSS Grid custom — Rejected. Mantine's SimpleGrid handles this with less code.
- Stack layout (no grids) — Rejected on desktop. Would waste horizontal space and make scanning harder.
