---
marp: true
theme: default
paginate: true
size: 16:9
auto_advance: 20
---

# SpecFlow Lite
### One Developer. Six AI Agents. Production Quality.

![bg right:35% 80%](https://img.shields.io/badge/Next.js-000000?logo=next.js)
**Stack:** Next.js · TypeScript · Supabase · Playwright
**Built:** VibeCode Tour · June 2026

---

<!-- _class: lead -->

## The Problem & The Pipeline

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">

<div>

```
BEFORE: Fragmented
━━━━━━━━━━━━━━━━━━━━
✏️ Google Docs  (Requirements)
📝 Notion        (Specs)
🎫 Jira           (Tasks)

❌ No traceability
❌ Context switching
❌ Setup overhead
```

</div>

<div>

```
AFTER: SpecFlow Lite
━━━━━━━━━━━━━━━━━━━━
📋 Requirements
    ↕️
📐 Specifications  ← GitHub Spec Kit
    ↕️
✅ Tasks

All linked. All traceable.
```

</div>

</div>

> **Pipeline:** `ANALYZE → CLARIFY → SPECIFY → PLAN → TASKS → IMPLEMENT → REVIEW`
> 📊 7 features · 42 spec docs · 100 tests

---

## Multi-Agent Architecture

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; font-size: 0.7rem;">

<div style="background: #1e1e2e; border-radius: 8px; padding: 0.8rem;">

### 🧠 BA Agent
- User stories
- Acceptance criteria
- Business rules
- Edge cases

</div>

<div style="background: #1e1e2e; border-radius: 8px; padding: 0.8rem;">

### 🏗️ Architect
- DB schema design
- API route design
- Component architecture
- Data flow

</div>

<div style="background: #1e1e2e; border-radius: 8px; padding: 0.8rem;">

### 💻 Developer
- 41 components
- 100 tests (Vitest)
- 10 API routes
- TanStack Query

</div>

<div style="background: #1e1e2e; border-radius: 8px; padding: 0.8rem;">

### 🧪 QA Agent
- Playwright E2E tests
- Console error checks
- Responsive validation
- Form validation

</div>

<div style="background: #1e1e2e; border-radius: 8px; padding: 0.8rem;">

### 👀 Reviewer Agent
- Code quality review
- Risk assessment
- Pattern consistency
- PR gate

</div>

<div style="background: #1e1e2e; border-radius: 8px; padding: 0.8rem;">

### 🔒 Security Agent
- RLS policy audit
- Auth flow review
- OWASP scanning
- Secrets check

</div>

</div>

> **Rule:** No implementation without approved spec. Dev escalates → Reviewer + Security.

---

## 18 Skills — Composable & Versioned

<div style="font-size: 0.8rem;">

| Phase | Skill | Output |
|-------|-------|--------|
| **Analysis** | `ba-skill`, `speckit-analyze`, `speckit-clarify` | User stories, ACs, ambiguity resolved |
| **Design** | `architect`, `ux-skill`, `speckit-plan` | DB schema, API design, impl plan |
| **Build** | `speckit-implement`, `speckit-tasks` | Components, task deps, estimates |
| **Test/Review** | `qa-skill`, `reviewer`, `security-review` | E2E tests, code review, RLS audit |
| **Knowledge** | `swarmvault`, `speckit-constitution` | Code graph, wiki, conventions |

</div>

```
Skills aren't prompts — they're engineering knowledge you compose, version, and reuse.

The same skill produces the same quality bar across 7 feature cycles.
Different agents, different features, consistent output.
```

![bg right:25% 90%](https://placehold.co/400x800/2e2e4e/white?text=18+Skills)

---

## 8 MCP Tools — Augmented Context

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; font-size: 0.65rem;">

| Tool | Function |
|------|----------|
| 📚 **Context7** | Live docs for Next.js, Supabase, Zod |
| 🔧 **GitHub** | Issues, PRs, Copilot review |
| 🧪 **Playwright** | Browser automation, 100 E2E tests |
| 🎨 **Magic UI** | Component inspiration, dashboards |
| 🧠 **Seq Thinking** | Structured reasoning, architecture |
| 🗺️ **SwarmVault** | Code graph, wiki, blast radius |
| 💾 **Claude Mem** | Cross-session project memory |
| 🛢️ **Supabase** | RLS, migrations, query inspection |

</div>

```
Agent calls MCP → MCP provides live context → Agent makes informed decision

No more hallucinated APIs. No more guessing library signatures.
~80% fewer broad file searches via graph-first queries.
```

---

## Results & Lessons Learned

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">

<div>

### By the Numbers
```
  7  Features      41  Components
 10  API Routes   100  Automated Tests
  4  DB Tables      6  AI Agents
 18  Skills         8  MCP Tools
 42  Spec Docs
```

</div>

<div>

### Top 5 Lessons
1. **Spec-first is faster** — fewer revision cycles
2. **Multi-agent catches more** — different bugs found per agent
3. **Playwright MCP** — regressions caught before commit
4. **SwarmVault** — ~80% fewer broad file searches
5. **RLS from day one** — zero authorization bugs

</div>

</div>

| NOW ✅ | NEXT 🔜 | LATER 🔮 |
|--------|---------|----------|
| 7 features | Multi-user access | AI-generated specs |
| Full traceability | Full-text search | Real-time collab |
| RLS security | Audit logging | Mobile PWA |

<!-- _footer: "Built with Claude Code · VibeCode Tour · June 2026 · 100% AI-generated, spec-driven" -->

