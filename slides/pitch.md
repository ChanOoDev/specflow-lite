# SpecFlow Lite

---

## Slide 1 — Why SpecFlow Lite Exists

**Headline:** *One developer. Six AI agents. Zero tolerance for fragmented toolchains.*

**Speaker Notes (55 words):**

> "I built SpecFlow Lite because I was tired of the same pattern: requirements in Google Docs, specs in Notion, tasks in Jira — three disconnected tools with zero traceability. When a requirement changes, you hunt through spreadsheets to find affected tasks. I wanted one flow where every artifact links back to its origin. And I wanted to build it entirely with AI agents to see if multi-agent development actually works at production quality."

**Suggested Visual:**

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  BEFORE: Fragmented Tooling                      │
│                                                  │
│  ✏️ Google Docs     📝 Notion      🎫 Jira       │
│  (Requirements)     (Specs)        (Tasks)       │
│       │                │               │          │
│       └──────────┬─────┴───────────────┘          │
│                  │                                │
│          ❌ No Traceability               │
│          ❌ Context Switching              │
│          ❌ Setup Overhead                 │
│                                                  │
│  AFTER: SpecFlow Lite                            │
│                                                  │
│       Requirements → Specifications → Tasks      │
│       📋 → 📐 → ✅                               │
│              All linked. All traceable.           │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Slide 2 — Spec-Driven Development with GitHub Spec Kit

**Headline:** *No implementation without specification. And we mean it.*

**Speaker Notes (58 words):**

> "Every feature in SpecFlow Lite started with `speckit.specify` — a context file pulled from the spec template, the BA Agent's user stories, and the project constitution. The pipeline runs in order: analyze the requirement, clarify ambiguities with targeted questions, generate spec.md with acceptance criteria and edge cases, produce plan.md with architecture decisions, then tasks.md with dependency ordering. No shortcut. No skipping steps. The result was surprisingly consistent."

**Suggested Visual:**

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  GitHub Spec Kit Pipeline                                │
│                                                          │
│  ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐     │
│  │ANALYZE │──▶│CLARIFY │──▶│SPECIFY │──▶│  PLAN  │     │
│  │        │   │        │   │        │   │        │     │
│  │Stories │   │Q&As    │   │spec.md │   │plan.md │     │
│  │ACs     │   │Ambiguity│  │Edges   │   │Arch    │     │
│  └────────┘   └────────┘   └────────┘   └────────┘     │
│                                                  │        │
│  ┌────────┐   ┌──────────┐   ┌────────┐         │        │
│  │REVIEW  │◀──│IMPLEMENT │◀──│ TASKS  │◀────────┘        │
│  │        │   │          │   │        │                  │
│  │QA+Sec  │   │Dev Agent │   │tasks.md│                  │
│  │gates   │   │+ Vitest  │   │Deps+   │                  │
│  └────────┘   └──────────┘   │Priority│                  │
│                              └────────┘                  │
│                                                          │
│  📊 7 features · 42 spec docs · 100 tests               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Slide 3 — Multi-Agent Architecture: 6 Agents, One Pipeline

**Headline:** *Why settle for one AI assistant when six specialized agents catch what one misses?*

**Speaker Notes (60 words):**

> "I ran six agents — each with a defined role, tool access, and escalation path. The BA Agent produced user stories with Given-When-Then criteria. The Architect designed the database schema and API contracts. The Developer implemented against the spec. Then the Reviewer, QA, and Security agents each assessed the output from their lens: code quality, test coverage, RLS policies. The multi-agent pattern caught things a single AI assistant would have overlooked — especially RLS gaps and edge case handling."

**Suggested Visual:**

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐    │
│  │  BA  │  │ARCH  │  │ DEV  │  │  QA  │  │REVIEW│  │ SEC  │    │
│  │      │  │      │  │      │  │      │  │      │  │      │    │
│  │🛠 seq-│  │🛠 seq-│  │🛠 ctx7│  │🛠 play│  │🛠 gh  │  │🛠 ctx7│    │
│  │think │  │think │  │🛠 gh  │  │wright │  │      │  │🛠 supb│    │
│  │      │  │🛠 ctx7│  │🛠 play│  │      │  │      │  │      │    │
│  │      │  │🛠 supb│  │🛠 supb│  │      │  │      │  │      │    │
│  ├──────┤  ├──────┤  ├──────┤  ├──────┤  ├──────┤  ├──────┤    │
│  │Story │  │Schema│  │41    │  │Test  │  │Code  │  │RLS   │    │
│  │ACs   │  │10 API│  │comps │  │cases │  │review│  │audit │    │
│  │Biz   │  │Route │  │100   │  │Edge  │  │Risk  │  │Auth  │    │
│  │rules │  │design│  │tests │  │cases │  │assess│  │scan  │    │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘    │
│                                                                   │
│  Rules:                                                           │
│  • Every agent has a defined escalation path                     │
│  • Dev escalates → Reviewer + Security before merge              │
│  • No agent implements without an approved spec                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Slide 4 — Skills: 18 Reusable Engineering Modules

**Headline:** *Skills aren't prompts. They're engineering knowledge you compose, version, and reuse.*

**Speaker Notes (58 words):**

> "Each skill is a self-contained engineering capability — not a generic prompt, but a document with structured context, conventions, and escalation rules. `ba-skill` encodes the analysis playbook. `architect-skill` knows our tech stack constraints. `qa-skill` generates Playwright scenarios with our project's page patterns. The value isn't just during implementation — it's that the same skill produces consistent output across feature cycles. Different agents, same skill, same quality bar."

**Suggested Visual:**

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  18 Skills — Composable, Versioned, Reusable             │
│                                                          │
│  ┌──────────────┬──────────────┬──────────────────────┐ │
│  │ Phase        │ Skills       │ Consistent Output     │ │
│  ├──────────────┼──────────────┼──────────────────────┤ │
│  │ Analysis     │ ba-skill     │ User stories, ACs    │ │
│  │              │ speckit-analyze│ Requirements map   │ │
│  │              │ speckit-clarify│ Ambiguity resolved │ │
│  ├──────────────┼──────────────┼──────────────────────┤ │
│  │ Design       │ architect    │ DB schema, API       │ │
│  │              │ ux-skill     │ Layouts, empty state │ │
│  │              │ speckit-plan │ Implementation plan  │ │
│  ├──────────────┼──────────────┼──────────────────────┤ │
│  │ Build        │ speckit-implement│ Components, APIs │ │
│  │              │ speckit-tasks│ Task deps, estimates │ │
│  ├──────────────┼──────────────┼──────────────────────┤ │
│  │ Test/Review  │ qa-skill     │ Playwright scenarios │ │
│  │              │ reviewer     │ Code quality review  │ │
│  │              │ security-review│ RLS audit, OWASP  │ │
│  ├──────────────┼──────────────┼──────────────────────┤ │
│  │ Knowledge    │ swarmvault   │ Code graph, wiki     │ │
│  │ Rules        │ speckit-constitution│ Conventions   │ │
│  └──────────────┴──────────────┴──────────────────────┘ │
│                                                          │
│  Key insight: Same skill → consistent quality            │
│  across all 7 feature cycles.                            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Slide 5 — The MCP Ecosystem: 8 Tools, One Augmented Workflow

**Headline:** *MCP gives agents real-world context — not just training data, but live docs, live UIs, live graphs.*

**Speaker Notes (60 words):**

> "Eight MCP tools made the difference between an AI that guesses and an AI that knows. Context7 served live library docs — no more hallucinated API signatures. Playwright let the QA Agent verify UI flows in real browsers and catch console errors before commit. Sequential Thinking forced structured reasoning for architecture decisions. SwarmVault compiled a code graph, redirecting ~80% of broad file searches to targeted structural queries. Claude Mem persisted decisions across sessions so agents didn't start cold."

**Suggested Visual:**

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  MCP Integration Map                                     │
│                                                          │
│  📚 Context7 ──── Live docs (Next.js, Supabase, Zod)    │
│  🔧 GitHub ────── Issues, PRs, Copilot code review       │
│  🧪 Playwright ── Browser automation, 100 E2E tests     │
│  🎨 Magic UI ──── Component inspiration, dashboards      │
│  🧠 Seq Thinking ─ Structured problem decomposition     │
│  🗺️ SwarmVault ── Automated code graph + wiki            │
│  🔍 SwarmVault MCP ── Graph query, blast radius          │
│  💾 Claude Mem ── Cross-session project memory           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Agent calls MCP tool                   │   │
│  │                      │                            │   │
│  │                      ▼                            │   │
│  │            MCP provides context                   │   │
│  │                      │                            │   │
│  │                      ▼                            │   │
│  │         Agent makes informed decision             │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  8 MCP tools · 6 agents · 100% context-aware            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Slide 6 — Results, Lessons, and Where This Goes Next

**Headline:** *100 tests. 41 components. 10 API routes. Built by AI, verified by AI, shipping on Vercel.*

**Speaker Notes (60 words):**

> "The numbers: 7 feature cycles, 41 reusable components, 10 API routes, 4 database tables with full RLS, 100 automated tests. But the real outcome is the engineering conviction that multi-agent development works at production quality. Key lessons: spec-first creates faster delivery, specialized agents catch different classes of bugs, Playwright MCP catches regressions in real time, and SwarmVault's graph-first queries saved thousands of tokens. Next: multi-user access, real-time collaboration, and AI-generated specs from natural language."

**Suggested Visual:**

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  By the Numbers                                          │
│                                                          │
│    7 Features   41 Components   10 API Routes            │
│    100 Tests    4 DB Tables     6 AI Agents              │
│    18 Skills    8 MCP Tools     42 Spec Documents        │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  Top 5 Lessons                                           │
│                                                          │
│  1️⃣ Spec-first is faster — fewer revision cycles        │
│  2️⃣ Multi-agent > single agent — catches different bugs │
│  3️⃣ Playwright MCP — regressions caught before commit   │
│  4️⃣ SwarmVault — ~80% fewer broad file searches        │
│  5️⃣ RLS from day one — zero authorization bugs           │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│       NOW                  NEXT              LATER       │
│  ✅ 7 features       🔜 Multi-user       🔮 Real-time   │
│  ✅ Full traceability 🔜 Markdown        🔮 AI gen specs │
│  ✅ RLS security     🔜 Full-text search 🔮 Mobile PWA   │
│  ✅ GitHub OAuth     🔜 Audit logging   🔮 Webhooks      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

*Built with Claude Code · VibeCode Tour · June 2026*
*100% AI-generated code. 100% AI-tested. 100% spec-driven.*
