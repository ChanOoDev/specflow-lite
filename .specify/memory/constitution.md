<!--
  Sync Impact Report
  ==================
  Version change: 0.0.0 (template) → 1.0.0 (initial ratification)
  
  Modified principles: N/A (first fill — all placeholders replaced)
  
  Added sections:
  - Core Principles (I–V)
  - Security & Data Integrity
  - Development Workflow
  - Governance
  
  Removed sections: None
  
  Templates requiring updates:
  - .specify/templates/spec-template.md ✅ Already aligned — uses prioritized user stories, Given/When/Then acceptance, entity definitions
  - .specify/templates/plan-template.md ✅ Already aligned — Constitution Check gate section exists, tech stack matches (Next.js/TypeScript/Supabase)
  - .specify/templates/tasks-template.md ✅ Already aligned — user story grouping, independent testability, test-first ordering
  - .specify/templates/checklist-template.md ✅ Already aligned — generic template, no constitution-specific constraints
  
  Follow-up TODOs: None — all placeholders resolved.
-->
# SpecFlow Lite Constitution

## Core Principles

### I. Specification-First (NON-NEGOTIABLE)

Every feature MUST begin with an approved specification before any implementation code is written.

- All features follow the 7-step workflow: Requirement Discovery → Specification → Plan → Tasks → Implementation → Review → Testing.
- Specifications MUST be written using the Spec Kit workflow (`/speckit-specify`, `/speckit-plan`, `/speckit-tasks`).
- Specifications MUST define user stories with priorities, acceptance scenarios (Given/When/Then), functional requirements, and measurable success criteria.
- Implementation MUST NOT begin until the specification passes the quality checklist and stakeholder approval.
- A feature specification is the source of truth — code that drifts from the spec MUST be corrected or the spec MUST be formally amended.

**Rationale**: Without a specification-first discipline, scope creeps, requirements are ambiguous, and testing becomes reactive rather than proactive. The spec anchors all downstream work.

### II. Test-First with UI Verification (NON-NEGOTIABLE)

Tests MUST be written before implementation, and UI changes MUST be verified through browser automation.

- Contract tests and integration tests MUST be written and observed to FAIL before the corresponding implementation begins.
- Every user story MUST have independently testable acceptance scenarios.
- UI changes MUST be verified using Playwright MCP before marking a feature complete: forms, navigation, responsive layout, and console errors MUST all be validated.
- The QA Agent MUST review acceptance criteria before a feature is marked complete.
- The Reviewer Agent MUST perform a final review before commit.
- E2E tests MUST be generated for critical user journeys.

**Rationale**: Test-first catches design flaws before they become code. Browser-based verification catches UI bugs that unit tests miss. The multi-agent review (QA + Reviewer) provides adversarial quality assurance.

### III. Security by Default

Every data access path MUST be authorized, and secrets MUST never enter the codebase.

- Supabase Row-Level Security (RLS) MUST be enforced on all database tables. No query may bypass RLS policies.
- API routes MUST validate authorization independently of the database layer (defense in depth).
- TypeScript strict mode MUST be used. No `any` types without explicit justification.
- Input validation MUST use Zod schemas on every API route and form submission. Validation MUST NOT be skipped.
- Secrets, API keys, and credentials MUST be managed through environment variables. They MUST NOT appear in source code, configuration files, or commit messages.
- Non-owners MUST receive generic "not found" responses — existence of resources MUST NOT be leaked through differentiated error messages.
- All dependency vulnerabilities MUST be addressed before deployment.

**Rationale**: SpecFlow Lite handles user-owned project data. A breach of one user's data to another is a trust-destroying event. Defense in depth (API + database) and strict typing minimize the attack surface.

### IV. AI-Assisted but Human-Reviewed

AI agents accelerate development, but every AI-generated artifact MUST be reviewed by a human or a secondary AI agent before it reaches production.

- The standard agent workflow is: BA Agent (requirement discovery) → Architect Agent (technical design) → Developer Agent (implementation) → QA Agent (acceptance criteria) → Reviewer Agent (final review).
- Sequential Thinking MCP MUST be used for requirement analysis, architecture design, database design, task breakdown, complex debugging, and feature planning.
- Context7 MCP MUST be used when working with Next.js, Supabase, Mantine UI, TanStack Query, Playwright, TypeScript configuration, or any library whose API has potentially changed.
- Magic UI MCP SHOULD be used for landing pages, dashboards, empty states, cards, and hero sections.
- MCP is preferred over web search for library documentation.
- SwarmVault MUST be updated after important architectural or design decisions.

**Rationale**: AI agents are force multipliers but can hallucinate APIs, miss edge cases, or produce insecure code. A structured, multi-agent pipeline with adversarial review catches errors that a single agent misses.

### V. Component Simplicity

Every component MUST do one thing well and be no larger than necessary.

- Components MUST be small and reusable. A component exceeding ~150 lines of logic SHOULD be split.
- Server components (Next.js App Router) MUST be preferred. Client components (`"use client"`) MUST only be used when interactivity, state, or browser APIs are required.
- Components MUST be located close to their usage. Shared components belong in a `components/` directory; page-specific components belong co-located with their page.
- Props interfaces MUST be explicit and exported. Magic prop spreading is forbidden unless passing through to a native HTML element.

**Rationale**: Large components are hard to test, review, and reuse. The server/client boundary in Next.js is a performance and security boundary — misplacing it leads to unnecessary client-side JavaScript and potential data leaks.

## Security & Data Integrity

- All project data access is scoped to the owning user. RLS policies MUST enforce this at the database level.
- Authentication is handled by Supabase Auth. All API routes MUST verify the authenticated user before processing.
- Database migrations MUST be versioned and reversible where possible. Destructive migrations MUST be reviewed before execution.
- Soft deletes are the default for user-facing data. Hard deletes MUST require explicit confirmation and a retention window.
- Optimistic locking (`updated_at` checks) MUST be used where concurrent modifications are possible.

## Development Workflow

### Feature Lifecycle

1. **Requirement Discovery** — BA Agent analyzes the feature request and produces structured user stories, functional requirements, and clarification questions.
2. **Specification** — Spec Kit workflow generates a formal spec with acceptance criteria, edge cases, and success metrics.
3. **Plan** — Architect Agent designs the technical approach: data model, API contracts, component tree, and route design.
4. **Tasks** — Spec Kit breaks the plan into independently testable tasks grouped by user story.
5. **Implementation** — Developer Agent implements tasks in priority order (P1 → P2 → P3), committing after each logical unit.
6. **Review** — Reviewer Agent checks implementation against spec, coding rules, and security requirements.
7. **Testing** — QA Agent verifies acceptance criteria; Playwright validates UI; tests must pass before merge.

### Commit Standards

- Conventional commits MUST be used: `chore:`, `feat:`, `fix:`, `docs:`, `test:`, `refactor:`.
- Commits MUST be small and focused. A commit touching more than 5 unrelated files SHOULD be split.
- Commit messages MUST describe what changed and why, not how.

### Quality Gates

Before a feature is marked complete:

- [ ] All acceptance scenarios pass (playwright verification)
- [ ] No TypeScript errors or `strict` mode violations
- [ ] RLS policies tested for both owner and non-owner access
- [ ] All forms validated (required fields, length limits, uniqueness constraints)
- [ ] No console errors in browser verification
- [ ] Responsive layout verified (mobile + desktop)
- [ ] Reviewer Agent approved
- [ ] Spec matches implementation (no spec drift)

## Governance

This Constitution supersedes all other development practices for SpecFlow Lite. All feature specifications, plans, and code reviews MUST verify compliance with these principles.

### Amendment Process

1. Proposed amendments MUST be documented with rationale and impact analysis.
2. Amendments require review against existing specs — any spec that would be invalidated MUST be updated before the amendment is ratified.
3. Version bumps follow semantic versioning:
   - **MAJOR**: Backward-incompatible principle removal or redefinition.
   - **MINOR**: New principle or section added, or materially expanded guidance.
   - **PATCH**: Clarifications, wording improvements, typo fixes.
4. Amended constitution MUST propagate changes to dependent templates (`plan-template.md`, `spec-template.md`, `tasks-template.md`) within the same change set.

### Compliance Review

- Every `/speckit-plan` MUST include a Constitution Check section verifying the plan against all Core Principles.
- Every PR and code review MUST verify compliance with Principles III (Security) and V (Component Simplicity).
- Complexity that violates a principle MUST be explicitly justified in the plan's Complexity Tracking table with an explanation of why the simpler alternative was rejected.

### Runtime Guidance

For day-to-day development guidance including the technology stack, MCP configuration, and agent workflows, refer to `CLAUDE.md` at the repository root. `CLAUDE.md` is the runtime companion to this Constitution — it specifies HOW, while this Constitution specifies WHAT and WHY.

**Version**: 1.0.0 | **Ratified**: 2026-06-15 | **Last Amended**: 2026-06-15
