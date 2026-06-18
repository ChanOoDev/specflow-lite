# Implementation Plan: Project Info

**Branch**: `006-project-info` | **Date**: 2026-06-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-project-info/spec.md`

## Summary

Build a static informational page (`/project-info`) that serves as project orientation for SpecFlow Lite. The page displays project statistics, build methodology, AI agents, skills, MCP tools, feature overview, and technology stack — all from inline static data. No database, no API route, no authentication required. A new "Project Info" nav item in the existing navbar provides access.

## Technical Context

**Language/Version**: TypeScript 6.0 (strict mode)

**Primary Dependencies**: Next.js 16 (App Router), Mantine UI 9, Tabler Icons 3

**Storage**: N/A — all data is static and inlined in the component

**Testing**: Playwright (E2E navbar link + page render verification), Vitest (unit — if data extraction warranted later)

**Target Platform**: Web (Next.js App Router, server + client components)

**Project Type**: Web application — single informational page under the existing app shell

**Performance Goals**: Page renders in under 2 seconds (static content, no data fetching, no API calls)

**Constraints**: No authentication required (public informational page); read-only with no interactive elements beyond navigation; responsive from 375px to 1920px width

**Scale/Scope**: Single page with 8 sections; ~450 lines of component code (mostly static data arrays); 1 nav link addition

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Specification-First | ✅ PASS | spec.md approved with 5 user stories, 12 FRs, 5 SCs |
| II. Test-First with UI Verification | ✅ PASS | Playwright E2E for navbar link and page render; QA + Reviewer review before merge |
| III. Security by Default | ✅ PASS | No data access — no RLS needed; no API routes; no secrets; no auth gates |
| IV. AI-Assisted but Human-Reviewed | ✅ PASS | BA + Architect + QA + Reviewer review pipeline |
| V. Component Simplicity | ✅ PASS | Single component rendering static data; data arrays are declarations not logic; page entry + layout are thin wrappers |

**Post-Design Re-check**: ✅ All principles remain satisfied. No data model introduces persistence. No contracts needed (no API). Component is a single readable file with inline data.

## Project Structure

### Documentation (this feature)

```text
specs/006-project-info/
├── plan.md              # This file
├── research.md          # Phase 0: architecture decisions
├── data-model.md        # Phase 1: entity definitions (in-memory models)
├── quickstart.md        # Phase 1: validation scenarios
├── contracts/           # Phase 1: N/A — no API contracts (static page)
│   └── (empty)
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
app/
├── project-info/
│   ├── layout.tsx                       # NEW: thin layout wrapper
│   └── page.tsx                         # NEW: page entry (renders ProjectInfoPage)
├── components/
│   ├── layout/
│   │   └── navbar.tsx                   # UPDATED: add "Project Info" nav link
│   └── project-info/
│       └── project-info-page.tsx        # NEW: main component with all sections
```

**Structure Decision**: Web application (Option 2). Single Next.js app with App Router. Page lives under `app/project-info/` following Next.js file-system routing convention. Component is co-located under `app/components/project-info/`. Navbar link added to the existing `navbar.tsx`. No API route needed — all data is static and inlined in the client component. No new library dependencies required beyond already-installed Mantine UI and Tabler Icons.

## Complexity Tracking

> No Constitution violations — this section intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
