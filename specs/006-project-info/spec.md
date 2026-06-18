# Feature Specification: Project Info

**Feature Branch**: `006-project-info`

**Created**: 2026-06-18

**Status**: Draft

**Input**: User description: "Project info page displaying project statistics, build methodology, AI agents, skills, MCP tools, feature overview, and technology stack"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Project Overview (Priority: P1)

A user visiting the application wants to understand what SpecFlow Lite is, its capabilities, and its architecture at a glance. They navigate to the Project Info page and see a comprehensive overview including key statistics, the development methodology, and the technology stack.

**Why this priority**: This is the primary purpose of the page — providing a self-serve project orientation that helps users (and contributors) understand the project structure and tooling without reading source code or documentation files.

**Independent Test**: Can be fully tested by navigating to the Project Info page and verifying all overview sections render correctly with accurate data. Delivers immediate project understanding to any visitor.

**Acceptance Scenarios**:

1. **Given** a user is on any page of the application, **When** they click the "Project Info" navigation link, **Then** the Project Info page loads displaying the project title "SpecFlow Lite" and subtitle
2. **Given** the Project Info page is loaded, **When** the user views the header, **Then** they see the project name, description, and technology badges (Next.js 16, Supabase, 6 Agents)
3. **Given** the Project Info page is loaded, **When** the user views the stats bar, **Then** they see 8 key metrics (Features, Components, API Routes, Tests, DB Tables, AI Agents, Skills, MCP Tools) with accurate counts

---

### User Story 2 - Understand Development Methodology (Priority: P1)

A user wants to understand how SpecFlow Lite was built and how the specification-driven development workflow operates. They view the Build Methodology timeline and the GitHub Spec Kit section to learn the 7-step process and the role of spec-kit commands.

**Why this priority**: The methodology documentation is a core value of this page — it educates users about the spec-driven approach used throughout the project.

**Independent Test**: Can be tested by verifying the timeline renders all 7 phases in order with descriptions, and the Spec Kit section shows all 4 commands with their outputs.

**Acceptance Scenarios**:

1. **Given** the Project Info page is loaded, **When** the user views the Build Methodology section, **Then** they see a 7-step timeline: Analyze, Specify & Clarify, Design, Plan & Tasks, Implement, Review, Test — each with a descriptive label
2. **Given** the Project Info page is loaded, **When** the user views the GitHub Spec Kit section, **Then** they see 4 spec-kit commands (specify, clarify, plan, tasks) with their output files and descriptions

---

### User Story 3 - Reference AI Agents and Skills (Priority: P2)

A user wants to understand the AI agent architecture and available skills used in the project's development workflow. They browse agent cards to see each agent's role, tools, and outputs, and review the skills table to understand which skills are used in each phase.

**Why this priority**: Understanding the AI-assisted development toolchain is important context for contributors and demonstrates the project's AI-first approach. Less critical than the core overview but still high-value.

**Independent Test**: Can be tested by verifying all 6 agent cards render with correct role, tools, and outputs, and all 14 skills appear in the skills table with correct phase and output descriptions.

**Acceptance Scenarios**:

1. **Given** the Project Info page is loaded, **When** the user views the AI Agents section, **Then** they see 6 agent cards (BA, Architect, Developer, QA, Reviewer, Security) each displaying role, tools badge list, and outputs list
2. **Given** the Project Info page is loaded, **When** the user views the Skills section, **Then** they see a table of 14 skills each with name, phase badge, and output description

---

### User Story 4 - Review Technology Stack and Features (Priority: P2)

A user wants to understand the technical foundation of the project and what features it supports. They browse the Technology Stack table and Key Features cards.

**Why this priority**: The tech stack and feature overview provide important context for technical evaluation. Equal priority to agent/skill reference but complements it.

**Independent Test**: Can be tested by verifying all 11 tech stack entries render with layer, technology, version, and purpose, and all 5 feature cards render with description and component/test stats.

**Acceptance Scenarios**:

1. **Given** the Project Info page is loaded, **When** the user views the Technology Stack section, **Then** they see a table with 11 rows covering Framework, Language, UI Library, State, Validation, Icons, Database, Auth, Testing, and Deployment — each with version and purpose
2. **Given** the Project Info page is loaded, **When** the user views the Key Features section, **Then** they see 5 feature cards (Project Management, Requirements Management, Specification Management, Task & Implementation Tracking, Dashboard) with descriptions and metrics

---

### User Story 5 - Reference MCP Tooling (Priority: P3)

A user wants to understand which MCP (Model Context Protocol) tools are integrated into the project and which agents use them.

**Why this priority**: Useful reference information but the least critical section. Users can get by without this detail.

**Independent Test**: Can be tested by verifying all 8 MCP tools appear in the table with category, role description, and used-by information.

**Acceptance Scenarios**:

1. **Given** the Project Info page is loaded, **When** the user views the MCP Tools section, **Then** they see a table with 8 MCP servers (Context7, GitHub, Playwright, Magic UI, Sequential Thinking, SwarmVault, SwarmVault MCP, Claude Mem) with category, role, and used-by columns

---

### Edge Cases

- What happens when the page is viewed on a narrow mobile viewport? All grids and tables should stack vertically without horizontal scrolling.
- What happens if stat counts become outdated after new features are added? The stats are static data — they require a code update to reflect changes.
- What happens if the page is accessed directly via URL without authentication? The page should render (it's a static informational page, not gated by user data).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Page MUST display a header with project name "SpecFlow Lite", subtitle "AI-assisted spec-driven development", and three technology badges (Next.js 16, Supabase, 6 Agents)
- **FR-002**: Page MUST display a stats bar with exactly 8 metrics: Features, Components, API Routes, Tests, DB Tables, AI Agents, Skills, MCP Tools — each with a numeric count and label
- **FR-003**: Page MUST display a Build Methodology section with a 7-step timeline: Analyze, Specify & Clarify, Design, Plan & Tasks, Implement, Review, Test — each step with a descriptive summary
- **FR-004**: Page MUST display a GitHub Spec Kit section explaining 4 commands (specify, clarify, plan, tasks) with their output file names and descriptions
- **FR-005**: Page MUST display an AI Agents section with 6 agent cards (BA, Architect, Developer, QA, Reviewer, Security), each showing: name, role, tool badges, and output items
- **FR-006**: Page MUST display a Skills section as a table with 14 skills, each showing: skill name, phase badge (color-coded), and output description
- **FR-007**: Page MUST display a Key Features section with 5 feature cards (Project Management, Requirements Management, Specification Management, Task & Implementation Tracking, Dashboard), each showing: title, description, and metrics summary
- **FR-008**: Page MUST display a Technology Stack section as a table with 11 rows (Framework, Language, UI Library, State, Validation, Icons, Database, Auth, E2E Testing, Unit Testing, Deployment), each showing: layer, technology name, version, and purpose
- **FR-009**: Page MUST display an MCP Tools section as a table with 8 entries (Context7, GitHub, Playwright, Magic UI, Sequential Thinking, SwarmVault, SwarmVault MCP, Claude Mem), each showing: server name, category badge, role description, and used-by information
- **FR-010**: Page MUST include a footer with build attribution ("Built with Claude Code · VibeCode Tour · June 2026")
- **FR-011**: Page MUST be accessible via a "Project Info" navigation item in the application navbar
- **FR-012**: Page MUST render correctly on mobile viewports with responsive grid adjustments (4-column stats on mobile, 8-column on desktop; stacked agent cards on mobile, 3-column on desktop)

### Key Entities

- **Project Statistics**: Aggregate counts describing the project scope — features, components, API routes, tests, database tables, AI agents, skills, and MCP tools
- **AI Agent**: A named AI assistant with a specific role, a set of MCP tools it uses, and a list of outputs it produces
- **Skill**: A named capability (slash command) assigned to a development phase with a description of its output artifacts
- **MCP Tool**: An external integration server with a category, role description, and list of agent types that use it
- **Technology Stack Entry**: A software layer with a technology name, version, and purpose description
- **Feature Card**: A project feature with a title, description, and metrics summary

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can locate and understand all 8 project stat metrics within 10 seconds of page load
- **SC-002**: Users can identify the complete development workflow (all 7 phases) from the methodology timeline without scrolling past the section
- **SC-003**: All 6 AI agent cards are visible and distinguishable at a glance on desktop viewport
- **SC-004**: Page renders without layout breakage on viewports from 375px to 1920px width
- **SC-005**: Page content is accurate and matches the actual project state (no stale or placeholder data)

## Assumptions

- The page content is static and manually maintained — stats and descriptions are hardcoded and updated via code changes
- The page does not require authentication to view — it is a public informational page about the project
- The page is read-only with no interactive elements beyond navigation
- The data displayed (stats, skills, agents, tech stack) reflects the project state as of June 2026
- Mobile responsiveness uses CSS grid breakpoints to reflow columns at standard viewport widths (base mobile, tablet breakpoint ~768px)
- Navigation to the page is available via the existing navbar component
