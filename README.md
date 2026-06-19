# SpecFlow Lite

**AI-assisted spec-driven development assistant** — built entirely with AI agents, skills, and MCP tools.

🔗 **Demo:** [specflow-lite.vercel.app](https://specflow-lite.vercel.app)  
📊 **Slides:** [specflow-lite Slides](https://github.com/ChanOoDev/specflow-lite/blob/main/slides/pechakucha-6x20.md)

---

## What it does

Create projects, capture requirements, generate specifications, break down development tasks, and track implementation progress — all with end-to-end traceability from requirement → specification → task.

---

## By the Numbers

| | | | |
|---|---|---|---|
| **7** Features | **41** Components | **10** API Routes | **100** Tests |
| **4** DB Tables | **6** AI Agents | **18** Skills | **8** MCP Tools |

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 16.2 |
| Language | TypeScript | 6.0 (strict) |
| UI Library | Mantine UI | 9.3 |
| State | TanStack Query | 5.101 |
| Validation | Zod | 4.4 |
| Database | Supabase PostgreSQL | 2.108 |
| Auth | Supabase Auth (GitHub OAuth) | 0.12 |
| Testing | Playwright + Vitest | 1.61 / 4.1 |
| Deployment | Vercel | — |

---

## AI-Native Development

Built for the **VibeCode Tour** to practice:

- **Claude Code** — primary AI coding assistant
- **GitHub Spec Kit** — spec-driven development pipeline (analyze → clarify → specify → plan → tasks → implement)
- **6 Specialized Agents** — BA, Architect, Developer, QA, Reviewer, Security
- **18 Skills** — composable, versioned engineering capabilities
- **8 MCP Tools** — Context7, GitHub, Playwright, Magic UI, Sequential Thinking, SwarmVault, SwarmVault MCP, Claude Mem

### Development Workflow

```
Requirement → Specification → Plan → Tasks → Implement → Review → Test
  (BA Agent)    (SpecKit)   (Architect) (SpecKit) (Developer) (Reviewer)  (QA Agent)
```

**Rule:** No implementation without an approved specification.

---

## Features

| # | Feature | Components | API Routes | E2E Tests |
|---|---------|------------|------------|-----------|
| 001 | Project Management | 7 | 3 | 19 |
| 002 | Requirements Management | 8 | 2 | 16 |
| 003 | Specification Management | 8 | 2 | 17 |
| 004 | Task & Implementation Tracking | 7 | 2 | 16 |
| 005 | Dashboard | 6 | 1 | 9 |
| 006 | Project Info | 1 | 0 | 12 |
| 007 | Vercel CI/CD Deployment | 4 | — | — |

---

## Getting Started

```bash
git clone https://github.com/ChanOoDev/specflow-lite.git
cd specflow-lite
npm install
cp .env.example .env.local   # add your Supabase + GitHub OAuth keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

*Built with Claude Code · VibeCode Tour · June 2026*
