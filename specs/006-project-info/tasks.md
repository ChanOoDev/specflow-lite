# Tasks: Project Info

**Input**: Design documents from `specs/006-project-info/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Implementation Status**: ✅ All tasks are complete. Component already implemented in `project-info-page.tsx`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app (Next.js App Router)**: `app/` for routes, `app/components/` for components
- Paths follow the structure defined in plan.md

---

## Phase 1: Setup (Route and Navigation)

**Purpose**: Create the route directory and wire navigation

- [ ] T001 Create project-info route directory at `app/project-info/`
- [ ] T002 [P] Create thin layout wrapper in `app/project-info/layout.tsx`
- [ ] T003 Add "Project Info" NavLink to navbar in `app/components/layout/navbar.tsx`

**Checkpoint**: Route accessible via navbar — page renders (empty for now)

---

## Phase 2: Foundational — Data Definitions

**Purpose**: Define all static data arrays used by every section

**⚠️ CRITICAL**: All user story phases depend on these data definitions being in place

- [ ] T004 [P] Define `STATS` array (8 metrics) in `app/components/project-info/project-info-page.tsx`
- [ ] T005 [P] Define `TECH_STACK` array (11 entries) in `app/components/project-info/project-info-page.tsx`
- [ ] T006 [P] Define `FEATURES` array (5 feature cards) in `app/components/project-info/project-info-page.tsx`
- [ ] T007 [P] Define `AGENTS` array (6 agent definitions) in `app/components/project-info/project-info-page.tsx`
- [ ] T008 [P] Define `SKILLS` array (14 skills) in `app/components/project-info/project-info-page.tsx`
- [ ] T009 [P] Define `MCP_TOOLS` array (8 MCP entries) in `app/components/project-info/project-info-page.tsx`
- [ ] T010 [P] Define `PHASE_COLOR` and `AGENT_COLOR_MAP` lookup records in `app/components/project-info/project-info-page.tsx`

**Checkpoint**: All data definitions ready — component structure can reference them

---

## Phase 3: User Story 1 — View Project Overview (Priority: P1) 🎯 MVP

**Goal**: Users see the project header, stats bar, and technology stack at a glance

**Independent Test**: Navigate to `/project-info` — header with badges, stats bar with 8 metrics, and tech stack table all render correctly

### Implementation for User Story 1

- [ ] T011 [US1] Implement page shell (Container, Stack layout, import list) in `app/components/project-info/project-info-page.tsx`
- [ ] T012 [P] [US1] Implement header section (Title, subtitle, 3 tech badges) in `app/components/project-info/project-info-page.tsx`
- [ ] T013 [P] [US1] Implement stats bar (Paper + SimpleGrid, 8 metric cards) in `app/components/project-info/project-info-page.tsx`
- [ ] T014 [US1] Implement Technology Stack table (Paper + Table, 11 rows) in `app/components/project-info/project-info-page.tsx`
- [ ] T015 [US1] Implement footer (centered attribution text) in `app/components/project-info/project-info-page.tsx`
- [ ] T016 [US1] Create page entry that renders ProjectInfoPage in `app/project-info/page.tsx`

**Checkpoint**: Header, stats bar, tech stack, and footer all render. Core overview is functional.

---

## Phase 4: User Story 2 — Understand Development Methodology (Priority: P1) 🎯 MVP

**Goal**: Users see the 7-step build methodology timeline and GitHub Spec Kit command cards

**Independent Test**: Scroll to methodology section — 7-step timeline and 4 spec-kit command cards render with correct descriptions

### Implementation for User Story 2

- [ ] T017 [US2] Implement Build Methodology timeline (Timeline with 7 items, phase descriptions) in `app/components/project-info/project-info-page.tsx`
- [ ] T018 [US2] Implement GitHub Spec Kit section (4 command cards in SimpleGrid) in `app/components/project-info/project-info-page.tsx`

**Checkpoint**: Methodology timeline and spec kit section render after the header/stats sections

---

## Phase 5: User Story 3 — Reference AI Agents and Skills (Priority: P2)

**Goal**: Users browse agent cards and the skills table to understand the AI-assisted toolchain

**Independent Test**: All 6 agent cards render with role, tools, and outputs; all 14 skills appear in the table with phase badges

### Implementation for User Story 3

- [ ] T019 [US3] Implement AI Agents grid (SimpleGrid, 6 agent Cards with icon, badges, List) in `app/components/project-info/project-info-page.tsx`
- [ ] T020 [US3] Implement Skills table (Table with Name, Phase badge, Output columns) in `app/components/project-info/project-info-page.tsx`

**Checkpoint**: Agents and skills sections render correctly after methodology sections

---

## Phase 6: User Story 4 — Review Technology Stack and Features (Priority: P2)

**Goal**: Users browse feature cards to understand what the application does

**Independent Test**: All 5 feature cards render with title, description, and metrics summary

> Note: Tech stack table is already covered in US1 (T014). This phase adds the feature cards.

### Implementation for User Story 4

- [ ] T021 [US4] Implement Key Features grid (SimpleGrid, 5 feature Cards with badge, title, description, metrics) in `app/components/project-info/project-info-page.tsx`

**Checkpoint**: Feature cards render between skills and tech stack sections

---

## Phase 7: User Story 5 — Reference MCP Tooling (Priority: P3)

**Goal**: Users see which MCP tools are integrated and which agents use them

**Independent Test**: All 8 MCP tools appear in the table with category badges and used-by info

### Implementation for User Story 5

- [ ] T022 [US5] Implement MCP Tools table (Table with Server, Category, Role, Used By columns) in `app/components/project-info/project-info-page.tsx`

**Checkpoint**: MCP tools table renders as the final data section

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Section dividers, responsive verification, and final validation

- [ ] T023 Add Divider components between all major sections in `app/components/project-info/project-info-page.tsx`
- [ ] T024 Verify responsive layout: stats 4-col on mobile, 8-col on desktop; agents/cards stack vertically on mobile
- [ ] T025 Run quickstart.md validation: all 14 scenarios pass with no console errors

**Checkpoint**: Feature complete — all sections render, responsive verified, no errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) — header, stats, tech stack
- **User Story 2 (Phase 4)**: Depends on User Story 1 (page shell from T011)
- **User Story 3 (Phase 5)**: Depends on User Story 1 (page shell from T011)
- **User Story 4 (Phase 6)**: Depends on User Story 1 (page shell from T011)
- **User Story 5 (Phase 7)**: Depends on User Story 1 (page shell from T011)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — No dependencies on other stories
- **User Story 2 (P2)**: Can start after US1 page shell — Independently testable
- **User Story 3 (P3)**: Can start after US1 page shell — Independently testable
- **User Story 4 (P2)**: Can start after US1 page shell — Independently testable
- **User Story 5 (P3)**: Can start after US1 page shell — Independently testable

### Within Each User Story

- All section tasks are additive to the same file — execute in order within the phase
- Section implementations are independent of each other (they render separate UI blocks)

### Parallel Opportunities

- All Foundational tasks (T004–T010) can run in parallel — they define independent data arrays
- US2, US3, US4, US5 can all be worked on after US1 page shell is in place
- All sections are additive to the same file but non-conflicting (different functions/JSX regions)

---

## Parallel Example: Foundational Phase

```bash
# All data definitions can be created simultaneously:
Task: "Define STATS array in app/components/project-info/project-info-page.tsx"
Task: "Define TECH_STACK array in app/components/project-info/project-info-page.tsx"
Task: "Define FEATURES array in app/components/project-info/project-info-page.tsx"
Task: "Define AGENTS array in app/components/project-info/project-info-page.tsx"
Task: "Define SKILLS array in app/components/project-info/project-info-page.tsx"
Task: "Define MCP_TOOLS array in app/components/project-info/project-info-page.tsx"
Task: "Define PHASE_COLOR lookup in app/components/project-info/project-info-page.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (data definitions)
3. Complete Phase 3: User Story 1 (header, stats, tech stack, footer)
4. Complete Phase 4: User Story 2 (methodology, spec kit)
5. **STOP and VALIDATE**: Page renders with overview + methodology sections
6. This is a shippable MVP

### Incremental Delivery

1. Setup + Foundational → Data ready
2. US1 + US2 → Overview + Methodology → Deploy/Demo (MVP!)
3. US3 → Agents + Skills → Deploy/Demo
4. US4 → Feature cards → Deploy/Demo
5. US5 → MCP tools → Deploy/Demo
6. Polish → Dividers + responsive + validation → Final

---

## Notes

- All tasks write to the same file (`project-info-page.tsx`) — execute sequentially within each phase
- Implementation already complete as of commit `140e45d`
- No tests explicitly requested — validation via quickstart.md E2E scenarios
- No API routes, no database — purely static informational page
- [P] markers apply to Foundational data definitions and section implementations that don't conflict
