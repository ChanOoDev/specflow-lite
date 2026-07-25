# ch-6 Plan: Polish + Issues + Report

## Overview
Complete ch-6 checklist: close ch-5 feedback issues, polish UI, test, add analytics, take screenshots, submit report.

## Issues to Close (from ch-5 user feedback)

| Feedback | Action | Priority |
|---|---|---|
| Dark mode not persisting (#13) | Already fixed in providers.tsx — verify + close | High |
| PDF export (#14) | Implement with `html-to-image` + jsPDF or `@react-print` | High |
| Full-text search | New issue — Supabase full-text search across projects/requirements/specs | Medium |
| Drag-and-drop tasks | New issue — up/down reorder buttons (simpler than dnd-kit) | Low |
| Multi-user / Notifications | Out of scope for ch-6 | Skip |

## Implementation Plan

### 1. Fix & close dark mode issue (#13)
- Verify `localStorageColorSchemeManager` works on live site
- Close with comment linking to providers.tsx

### 2. Implement PDF export (fix #14)
- Add "Export PDF" button to spec detail page
- Use `html2canvas` + `jspdf` or `window.print()` with print-specific CSS
- Keep it simple — generate a print-friendly view

### 3. Add full-text search
- Add Supabase `textSearch` across projects table
- Search input in navbar/header that searches across projects
- Results page showing matches with links

### 4. UI/UX polish pass
- Verify all empty/error/loading states render correctly
- Add subtle transitions (already have animate-in)
- Check mobile responsive layout
- Fix any console errors

### 5. Add analytics (GoatCounter)
- Free, privacy-friendly, single script tag
- Add to layout.tsx

### 6. Test with Playwright
- Run existing 20+ E2E tests
- Verify all pass

### 7. New screenshots
- Desktop 1280×800: Dashboard, Projects, Project Detail
- Save to screenshots/ directory

### 8. Fill report in team-12 repo
- `ch-6/ChanOoDev/report.md`
- Submit PR to team-12
