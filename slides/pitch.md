---
marp: true
theme: default
paginate: true
size: 16:9
auto_advance: 20
---

# SpecFlow Lite
### One Developer. Six AI Agents. Production Quality.

**Stack:** Next.js · TypeScript · Supabase · Playwright
**Built:** VibeCode Tour · June 2026

---

## The Problem & The Pipeline

| BEFORE: Fragmented | AFTER: SpecFlow Lite |
|---|---|
| ✏️ Google Docs (Requirements) | 📋 Requirements |
| 📝 Notion (Specs) | ↕️ |
| 🎫 Jira (Tasks) | 📐 Specifications ← GitHub Spec Kit |
| ❌ No traceability | ↕️ |
| ❌ Context switching | ✅ Tasks |
| ❌ Setup overhead | **All linked. All traceable.** |

**Pipeline:** `ANALYZE → CLARIFY → SPECIFY → PLAN → TASKS → IMPLEMENT → REVIEW`

📊 7 features · 42 spec docs · 100 tests

---

## Multi-Agent Architecture

| Agent | Tools | Deliverables |
|---|---|---|
| 🧠 BA | Seq Thinking | User stories, ACs, edge cases |
| 🏗️ Architect | Seq Thinking, Context7, Supabase | DB schema, API routes, data flow |
| 💻 Developer | Context7, GitHub, Playwright | 41 components, 100 tests, 10 APIs |
| 🧪 QA | Playwright | E2E tests, console checks, responsive validation |
| 👀 Reviewer | GitHub | Code quality, risk assessment, PR gate |
| 🔒 Security | Context7, Supabase | RLS audit, auth review, OWASP scan |

> **Rule:** No implementation without approved spec. Dev escalates → Reviewer + Security.

---

## 18 Skills — Composable & Versioned

| Phase | Skill | Output |
|---|---|---|
| **Analysis** | `ba-skill`, `speckit-analyze`, `speckit-clarify` | User stories, ACs, ambiguity resolved |
| **Design** | `architect`, `ux-skill`, `speckit-plan` | DB schema, API design, impl plan |
| **Build** | `speckit-implement`, `speckit-tasks` | Components, task deps, estimates |
| **Test/Review** | `qa-skill`, `reviewer`, `security-review` | E2E tests, code review, RLS audit |
| **Knowledge** | `swarmvault`, `speckit-constitution` | Code graph, wiki, conventions |

```
Skills aren't prompts — they're engineering knowledge you compose, version, and reuse.
The same skill produces the same quality bar across 7 feature cycles.
Different agents, different features, consistent output.
```

---

## 8 MCP Tools — Augmented Context

| Tool | Function |
|---|---|
| 📚 **Context7** | Live docs for Next.js, Supabase, Zod |
| 🔧 **GitHub** | Issues, PRs, Copilot review |
| 🧪 **Playwright** | Browser automation, 100 E2E tests |
| 🎨 **Magic UI** | Component inspiration, dashboards |
| 🧠 **Seq Thinking** | Structured reasoning, architecture |
| 🗺️ **SwarmVault** | Code graph, wiki, blast radius |
| 💾 **Claude Mem** | Cross-session project memory |
| 🛢️ **Supabase** | RLS, migrations, query inspection |

```
Agent calls MCP → MCP provides live context → Agent makes informed decision
No more hallucinated APIs. No more guessing library signatures.
~80% fewer broad file searches via graph-first queries.
```

---

## Results & Lessons

| By the Numbers | Top 5 Lessons |
|---|---|
| 7 Features | 1. **Spec-first is faster** — fewer revisions |
| 41 Components | 2. **Multi-agent > single** — catches different bugs |
| 10 API Routes | 3. **Playwright MCP** — regressions caught pre-commit |
| 100 Tests | 4. **SwarmVault** — ~80% fewer broad file searches |
| 4 DB Tables | 5. **RLS from day one** — zero authorization bugs |
| 6 AI Agents / 18 Skills / 8 MCP Tools | |

| NOW ✅ | NEXT 🔜 | LATER 🔮 |
|---|---|---|
| 7 features | Multi-user access | AI-generated specs |
| Full traceability | Full-text search | Real-time collab |
| RLS security | Audit logging | Mobile PWA |

_Built with Claude Code · VibeCode Tour · June 2026 · 100% AI-generated, spec-driven_
