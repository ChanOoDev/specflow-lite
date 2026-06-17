# Quickstart: Requirements Management

**Created**: 2026-06-17 | **Feature**: [spec.md](./spec.md)

This guide documents runnable validation scenarios for the requirements management feature. Each scenario proves an independent slice of functionality.

## Prerequisites

- Supabase project running with `requirements` table and migration applied (see [data-model.md](./data-model.md))
- Existing project created via 001-project-management
- Next.js dev server: `npm run dev`
- Playwright test runner: `npx playwright test`
- Test user account created in Supabase Auth

## Scenarios

### US1: Create a Requirement

**What it proves**: A project owner can create a requirement within their project.

1. Navigate to `/projects/<projectId>/requirements`
2. Click "New Requirement" button
3. Fill in title: "User Login Page", select type: "functional", select priority: "p1"
4. Submit the form
5. **Verify**: Redirected to the requirement list showing "User Login Page" with "draft" status and "functional" type badge

**Edge cases to validate**:
- Submit empty title → inline error "Title is required"
- Submit title >200 chars → inline error "Title must be 200 characters or fewer"
- Non-owner accessing `/projects/<otherProjectId>/requirements/new` → 404

### US2: Browse Requirements in a Project

**What it proves**: Requirements list displays, searches, filters, and paginates correctly.

1. Navigate to `/projects/<projectId>/requirements` (ensure you have 3+ requirements)
2. **Verify**: All non-deleted requirements shown, ordered by most recently updated
3. Type partial title in search bar
4. **Verify**: List filters to matching requirements (case-insensitive)
5. Select type filter "functional"
6. **Verify**: Only functional requirements shown
7. Select priority filter "p1"
8. **Verify**: Only p1 requirements shown
9. Clear filters
10. **Verify**: Full list restored

**Edge cases to validate**:
- Zero requirements → empty state with "Add Your First Requirement" CTA
- No search results → contextual empty state message
- More than 20 requirements → pagination controls appear (page 2, etc.)
- Non-owner accessing `/projects/<otherProjectId>/requirements` → 404

### US3: View Requirement Detail

**What it proves**: Requirement detail shows all metadata.

1. Open an existing requirement
2. **Verify**: Title, description, type badge, priority badge, status badge, created date, and updated date all displayed
3. **Verify**: "Edit" and "Delete" action buttons visible

**Edge cases to validate**:
- View requirement in another user's project → 404
- View requirement in archived project → read-only display, no action buttons
- Non-existent requirement ID → 404

### US4: Edit Requirement

**What it proves**: Owner can update requirement fields with status transition enforcement and conflict detection.

1. Open a requirement detail, click "Edit"
2. Change title to "Updated Login Page"
3. Change status from "draft" to "approved"
4. Submit
5. **Verify**: Detail page shows "Updated Login Page" and "approved" badge

**Edge cases to validate**:
- Invalid status transition (implemented → deferred) → error "Cannot transition from 'implemented' to 'deferred'. Allowed transitions: draft."
- Attempt to edit requirement in archived project → 404 or error
- Description >3000 chars → inline error

**Concurrent edit test**:
1. Open a requirement edit form in two browser tabs
2. In tab A: change title and save
3. **Verify**: Tab A saves successfully
4. In tab B: change title and save
5. **Verify**: Tab B shows conflict message "This requirement was updated by someone else. Please refresh and try again."

### US5: Delete a Requirement

**What it proves**: Soft-delete with confirmation dialog works.

1. Open a requirement, click "Delete"
2. **Verify**: Confirmation dialog appears with typed confirmation
3. Type the requirement title correctly, confirm
4. **Verify**: Requirement disappears from the list
5. Attempt to navigate to deleted requirement's URL
6. **Verify**: 404 page

**Edge cases to validate**:
- Cancel confirmation dialog → requirement unchanged
- Non-owner attempts delete → 404

### US6: Requirement Status Workflow

**What it proves**: The full status lifecycle works end-to-end.

1. Create a new requirement (starts as "draft")
2. Edit → change status: only "approved" and "deferred" offered
3. Select "approved", save
4. Edit → change status: only "implemented" and "draft" offered
5. Select "implemented", save
6. Edit → change status: only "draft" offered
7. Select "draft", save (reopens the requirement)
8. **Verify**: Status returns to "draft"

**Edge cases to validate**:
- Deferred requirement can only go back to draft
- Non-owner cannot change status → 404

## Automated E2E Tests

```bash
# Run all requirements management tests
npx playwright test tests/e2e/requirements-*

# Run specific test file
npx playwright test tests/e2e/requirements-create.spec.ts

# Run with UI mode for debugging
npx playwright test tests/e2e/ --ui
```

## Manual QA Checklist

Before marking complete, verify:

- [ ] All 6 user story scenarios pass manually
- [ ] All edge cases validated
- [ ] Responsive layout works on mobile (375px) and desktop (1280px)
- [ ] No browser console errors on any page
- [ ] RLS: different user cannot access another user's requirements
- [ ] RLS: different user cannot access requirements inside another user's projects
- [ ] TypeScript strict mode: no type errors
- [ ] All Zod validation errors display user-friendly messages
- [ ] Status transitions only show valid next-status options in the dropdown
- [ ] Project detail page shows correct requirement count after create/delete
- [ ] Soft-deleted requirements are recoverable (visible in database but not in UI)
