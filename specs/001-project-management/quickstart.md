# Quickstart: Project Management

**Created**: 2026-06-15 | **Feature**: [spec.md](./spec.md)

This guide documents runnable validation scenarios for the project management feature. Each scenario proves an independent slice of functionality.

## Prerequisites

- Supabase project running with `projects` table created (see [data-model.md](./data-model.md))
- Next.js dev server: `npm run dev`
- Playwright test runner: `npx playwright test`
- Test user account created in Supabase Auth

## Scenarios

### US1: Create a Project

**What it proves**: A user can create a project and be redirected to its detail page.

1. Navigate to `/projects`
2. Click "New Project" button
3. Fill in name: "My First Project", description: "A test project"
4. Submit the form
5. **Verify**: Redirected to `/projects/<uuid>` showing name "My First Project" and status "active"

**Edge cases to validate**:
- Submit empty name → inline error "Project name is required"
- Submit name >120 chars → inline error "Project name must be 120 characters or fewer"
- Submit name matching existing project → error "A project with this name already exists"

### US2: View and Browse Projects

**What it proves**: The project list displays, searches, and filters correctly.

1. Navigate to `/projects` (ensure you have 3+ projects)
2. **Verify**: All non-archived projects shown, ordered by most recently updated
3. Type partial name in search bar
4. **Verify**: List filters to matching projects only
5. Select status filter "paused"
6. **Verify**: Only paused projects shown
7. Clear filters
8. **Verify**: Full list restored

**Edge cases to validate**:
- Zero projects → empty state with "Create Your First Project" CTA
- No search results → "No projects match your search" message
- More than 20 projects → pagination controls appear

### US3: View Project Detail

**What it proves**: Project detail shows all metadata and computed counts.

1. Open an existing project
2. **Verify**: Name, description, status, creation date, updated date all displayed
3. **Verify**: Artifact counts shown (all zero for new project)

**Edge cases to validate**:
- View another user's project URL → 404 page
- View archived project → read-only display, no action buttons

### US4: Edit Project Metadata

**What it proves**: Owner can update project fields with conflict detection.

1. Open project settings
2. Change name to "Renamed Project"
3. Submit
4. **Verify**: Detail page shows "Renamed Project"

**Edge cases to validate**:
- Invalid status transition (completed → paused) → error explaining allowed transitions
- Description >2000 chars → inline error

**Concurrent edit test**:
1. Open project settings in two browser tabs
2. In tab A: change name to "Tab A Edit", save
3. **Verify**: Tab A saves successfully
4. In tab B: change name to "Tab B Edit", save
5. **Verify**: Tab B shows conflict message "This project was updated by someone else"

### US5: Archive and Restore

**What it proves**: Projects can be archived and restored with data intact.

1. Open an active project
2. Archive it (via settings or action menu)
3. **Verify**: Project disappears from default list
4. Enable "Show Archived" filter
5. **Verify**: Archived project appears with "archived" badge
6. Open archived project, click "Restore"
7. **Verify**: Project returns to "active" status, reappears in default list

### US6: Delete a Project

**What it proves**: Soft-delete with confirmation dialog works.

1. Open a project, click "Delete"
2. **Verify**: Confirmation dialog appears, asks to type project name
3. Type correct project name, confirm
4. **Verify**: Project disappears from all views
5. Attempt to navigate to deleted project's URL
6. **Verify**: 404 page

**Edge cases to validate**:
- Cancel confirmation dialog → project unchanged
- Non-owner attempts delete → 404

## Automated E2E Tests

```bash
# Run all project management tests
npx playwright test tests/e2e/projects-*

# Run specific test file
npx playwright test tests/e2e/projects-create.spec.ts

# Run with UI mode for debugging
npx playwright test tests/e2e/ --ui
```

## Manual QA Checklist

Before marking complete, verify:

- [ ] All 6 user story scenarios pass manually
- [ ] All edge cases validated
- [ ] Responsive layout works on mobile (375px) and desktop (1280px)
- [ ] No browser console errors on any page
- [ ] RLS: different user cannot access another user's projects
- [ ] TypeScript strict mode: no type errors
- [ ] All Zod validation errors display user-friendly messages
