# Navigation Fix Plan — Connect Project Sub-Pages

## Problem

The project sub-pages (Requirements, Specifications, Tasks) have no navigation connections:
- Count cards on project detail are static, not clickable
- No sub-navigation bar when inside a project
- Sub-pages have no "back to project" or "back to spec" links
- Spec detail page has no "View All Tasks" link
- Linked requirement cards on spec detail are not clickable

## Plan

### 1. Create `app/projects/[projectId]/layout.tsx` (NEW)

A project-level layout that adds a horizontal tab bar below the AppShell header. This wraps ALL pages under `/projects/[projectId]/...`.

**Tab bar design:**
- `Overview` — links to `/projects/[projectId]`
- `Requirements` — links to `/projects/[projectId]/requirements`, shows count badge
- `Specifications` — links to `/projects/[projectId]/specifications`, shows count badge

**Technical approach:**
- `'use client'` component using `useParams()` for projectId
- Uses `useProject(projectId)` to fetch counts for badges
- Uses `usePathname()` to highlight active tab
- Uses Mantine `Tabs` or `SegmentedControl` styled as tabs
- Renders `{children}` below the tab bar

**Count badges:** Fetched from the project query (already returns `counts.requirements`, `counts.specifications`). These are lightweight — the project query is cached by TanStack Query.

### 2. Modify `app/projects/[projectId]/page.tsx` — Make count cards clickable

**Change:** Replace the static `<Card>` components with `component={Link}` cards:

| Card | Links To |
|------|----------|
| Requirements | `/projects/${projectId}/requirements` |
| Specifications | `/projects/${projectId}/specifications` |
| Tasks | Not clickable (no project-level tasks page) |
| Completed | Not clickable (summary stat only) |

Add `cursor=pointer` visual cue on clickable cards.

### 3. Modify `app/projects/[projectId]/specifications/[specificationId]/page.tsx` — Add "View All Tasks" link

**Change:** Next to the task progress summary, add a "View All" button linking to the standalone tasks page:
```
/projects/${projectId}/specifications/${specificationId}/tasks
```

This gives users a way to reach the full paginated task list with search/filter.

### 4. Modify `app/components/specifications/specification-detail.tsx` — Make requirement cards clickable

**Change:** Make `RequirementLinkCard` accept `projectId` and wrap in `component={Link}` to navigate to:
```
/projects/${projectId}/requirements/${requirement.id}
```

### 5. Modify `app/projects/[projectId]/specifications/[specificationId]/tasks/page.tsx` — Add back navigation

**Change:** Add a "← Back to Specification" button at the top of the standalone task list page.

## Files Changed

| File | Action |
|------|--------|
| `app/projects/[projectId]/layout.tsx` | **NEW** — Project sub-navigation layout |
| `app/projects/[projectId]/page.tsx` | MODIFY — Make count cards clickable |
| `app/projects/[projectId]/specifications/[specificationId]/page.tsx` | MODIFY — Add "View All Tasks" link |
| `app/components/specifications/specification-detail.tsx` | MODIFY — Make requirement cards clickable |
| `app/projects/[projectId]/specifications/[specificationId]/tasks/page.tsx` | MODIFY — Add back navigation |

## States Covered

| State | Handling |
|-------|----------|
| **Loading** | Tab bar shows counts as `-` or skeleton while project query loads |
| **Error** | Tab bar still renders (links work without counts) |
| **Empty** | Tab bar shows `0` counts |
| **Edge: archived project** | Tab bar still shows; sub-pages handle their own read-only enforcement |
