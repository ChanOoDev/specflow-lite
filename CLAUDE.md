# SpecFlow Lite - Claude Instructions

## Project Purpose

This project is built for VibeCode Tour to practice:

- Claude Code
- GitHub Spec Kit
- Skills
- Subagents
- MCP
- Claude Memory
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