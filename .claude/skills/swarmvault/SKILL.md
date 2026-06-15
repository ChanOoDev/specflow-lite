---
name: swarmvault
description: SwarmVault graph-first workflow. Use to read the compiled wiki and
  query the knowledge graph before broad file search.
---

# SwarmVault

SwarmVault compiles curated sources in `raw/` into a queryable wiki in `wiki/` and a knowledge graph in `state/graph.json`.

## Rules

- Read `swarmvault.schema.md` before compile or query style work. It is the canonical schema path.
- Treat `raw/` as immutable source input.
- Treat `wiki/` as generated markdown owned by the agent and compiler workflow.
- If `SWARMVAULT_OUT` is set, resolve generated artifact paths like `raw/`, `wiki/`, and `state/` under that directory.
- Read `wiki/graph/report.md` before broad file searching when it exists; otherwise start with `wiki/index.md`.
- For code and graph questions (where is X, what calls Y, structure, impact), prefer `swarmvault graph query`, `swarmvault graph path`, and `swarmvault graph explain` over broad grep/glob searching; read source files directly only when editing them or when the graph lacks detail.
- Preserve frontmatter fields including `page_id`, `source_ids`, `node_ids`, `freshness`, and `source_hashes`.
- When asked for durable research, reviews, or handoff artifacts, save the answer into `wiki/outputs/`; answer quick questions directly in chat without writing files.
- Prefer `swarmvault ingest`, `swarmvault compile`, `swarmvault query`, and `swarmvault lint` for SwarmVault maintenance tasks.

## Entry points

- `swarmvault ingest <path>` — register a new source
- `swarmvault compile` — refresh wiki pages and graph
- `swarmvault query "<question>"` — save-first multi-step query
- `swarmvault graph query|path|explain` — deterministic graph traversal
- `swarmvault lint` — wiki health and contradiction checks
