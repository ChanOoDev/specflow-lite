# SpecFlow Lite - Claude Instructions

## Project Purpose

This project is built for VibeCode Tour to practice:

- Claude Code
- GitHub Spec Kit
- Skills
- Subagents
- MCP
- Claude
- SwarmVault
- AI-assisted development workflow

## Product Summary

SpecFlow Lite is a lightweight spec-driven development assistant.

Users can:

- Create projects
- Capture requirements
- Generate specifications
- Generate development tasks
- Track implementation progress

## Tech Stack

- Next.js
- TypeScript
- Supabase
- Mantine UI
- TanStack Query
- Zod
- Playwright

## Development Workflow

Always follow this flow:

1. Understand requirement
2. Ask clarification if needed
3. Generate specification
4. Create plan
5. Break down tasks
6. Implement small changes
7. Write/update tests
8. Review code
9. Update documentation

## Coding Rules

- Use TypeScript strict mode
- Prefer server components where possible
- Use client components only when needed
- Keep components small and reusable
- Use Supabase RLS for authorization
- Do not put secrets in code
- Do not skip validation
- Do not implement without checking specs

## AI Workflow Rules

- Use BA Agent for requirement discovery
- Use Architect Agent for technical design
- Use QA Agent for acceptance criteria and tests
- Use Reviewer Agent before commit
- Use MCP when documentation or external context is needed
- Update SwarmVault after important decisions

## Commit Style

Use conventional commits:

- chore:
- feat:
- fix:
- docs:
- test:
- refactor:

<!-- swarmvault:managed:start -->
# SwarmVault Rules

- Read `swarmvault.schema.md` before compile or query style work. It is the canonical schema path.
- Treat `raw/` as immutable source input.
- Treat `wiki/` as generated markdown owned by the agent and compiler workflow.
- If `SWARMVAULT_OUT` is set, resolve generated artifact paths like `raw/`, `wiki/`, and `state/` under that directory.
- Read `wiki/graph/report.md` before broad file searching when it exists; otherwise start with `wiki/index.md`.
- For code and graph questions (where is X, what calls Y, structure, impact), prefer `swarmvault graph query`, `swarmvault graph path`, and `swarmvault graph explain` over broad grep/glob searching; read source files directly only when editing them or when the graph lacks detail.
- Preserve frontmatter fields including `page_id`, `source_ids`, `node_ids`, `freshness`, and `source_hashes`.
- When asked for durable research, reviews, or handoff artifacts, save the answer into `wiki/outputs/`; answer quick questions directly in chat without writing files.
- Prefer `swarmvault ingest`, `swarmvault compile`, `swarmvault query`, and `swarmvault lint` for SwarmVault maintenance tasks.

For architecture, structure, where-is, what-calls, or impact questions, query the graph first: `swarmvault graph query "<seed>"` (top matches + inline page excerpt), `swarmvault graph explain "<node>"`, or `swarmvault graph blast <target>` for impact. Avoid `--json` — the plain output is far smaller. Trust the graph answer for orientation; read source files only when you are editing them or the graph lacks the detail you need. Check freshness with `swarmvault graph status` and refresh with `swarmvault graph update` (add `--file <path>` for single files).
<!-- swarmvault:managed:end -->


## MCP Rules

Always use Context7 MCP when working with:
- Next.js
- Supabase
- Mantine UI
- TanStack Query
- Playwright
- TypeScript setup
- Library configuration

When unsure about library APIs, check Context7 before coding.

## GitHub Workflow

Use GitHub MCP for:
- Creating issues
- Reviewing pull requests
- Summarizing repository changes
- Checking issue context before implementation

All major features should start from a GitHub issue.

## UI Testing Rules

Before marking a feature complete:

- Verify using Playwright MCP
- Validate forms
- Validate navigation
- Validate responsive layout
- Check console errors

Generate E2E tests when appropriate.

## QA Workflow

Developer Agent
→ Implement Feature

Playwright MCP
→ Verify UI

QA Agent
→ Review Acceptance Criteria

Reviewer Agent
→ Final Review

## UI Generation Rules

Use Magic UI MCP when creating:
- Landing pages
- Dashboard layouts
- Empty states
- Cards
- Hero sections
- Modern UI interactions

Keep UI clean, professional, and suitable for a developer productivity tool.