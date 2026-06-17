# Quickstart: Dashboard

**Feature**: 005-dashboard
**Date**: 2026-06-18

## Prerequisites

- Dev server running (`npm run dev`)
- Authenticated user with at least one project (or create one at `/projects/new`)

## Validation Scenarios

### 1. Dashboard as Home Page

1. Open http://localhost:3000/
2. **Expect**: Dashboard page loads (not redirect to /projects)
3. **Expect**: App shell layout visible (navbar with "Projects" link, header "SpecFlow Lite")

### 2. Empty State (New User)

1. Log in with a user that has zero projects
2. Navigate to http://localhost:3000/
3. **Expect**: Empty state message with "Create your first project" call-to-action button
4. **Expect**: Recent projects section hidden or showing empty state
5. **Expect**: Open tasks section hidden or showing empty state

### 3. Project Health Overview (US1)

1. Log in with a user that has 2+ projects with varying data
2. Navigate to http://localhost:3000/
3. **Expect**: Summary cards showing:
   - Total projects count
   - Total requirements count
   - Total specifications count
   - Task breakdown by status (To Do / In Progress / Done)
4. **Expect**: All counts match actual data in the database

### 4. Recent Projects (US2)

1. Navigate to Project A's requirements page
2. Navigate to Project B's specifications page
3. Navigate to Project C's overview page
4. Go to http://localhost:3000/ (dashboard)
5. **Expect**: Recent Projects section shows C, B, A in that order
6. **Expect**: Clicking a recent project navigates to that project's overview

### 5. Open Tasks List (US3)

1. Create tasks in multiple projects (varying statuses)
2. Navigate to http://localhost:3000/
3. **Expect**: Open tasks section shows tasks with status "To Do" or "In Progress"
4. **Expect**: Each task shows title, project name, and status badge
5. **Expect**: Completed ("Done") tasks are NOT in the list
6. **Expect**: Max 10 tasks shown, most recently updated first

### 6. Manual Refresh

1. View the dashboard
2. In another tab, create a new project or task
3. Return to dashboard tab
4. Click the refresh button
5. **Expect**: Dashboard data updates to reflect changes

### 7. Console Check

1. Navigate through all dashboard states (empty, populated, refresh)
2. **Expect**: No console errors

### 8. Responsive Layout

1. Resize browser to mobile width (~375px)
2. **Expect**: Summary cards stack vertically
3. **Expect**: All sections remain readable and functional
