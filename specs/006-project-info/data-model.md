# Data Model: Project Info

**Feature**: 006-project-info  
**Date**: 2026-06-18  

## Overview

The Project Info page has **no persistent data model**. All data is static, inlined in the component as TypeScript const arrays. This document defines the logical structure of each entity for documentation and maintenance purposes.

## Entities (In-Memory)

### ProjectStat

Represents a single metric shown in the stats bar.

| Field | Type | Description |
|---|---|---|
| `label` | string | Human-readable metric name (e.g., "Features", "Components") |
| `value` | number | Numeric count |

**Validation**: value must be non-negative integer. label must be non-empty string.

**Current data** (8 entries): Features=5, Components=35, API Routes=13, Tests=33, DB Tables=5, AI Agents=6, Skills=14, MCP Tools=8

---

### SkillEntry

Represents a Claude Code skill (slash command) used in the development workflow.

| Field | Type | Description |
|---|---|---|
| `skill` | string | Skill name identifier (e.g., "ba-skill", "speckit-specify") |
| `phase` | string | Development phase this skill belongs to (Analysis, Spec, Design, Plan, Tasks, Build, QA, Test, Review, Security, Knowledge, Rules) |
| `output` | string | Human-readable description of what this skill produces |

**Validation**: phase must be one of the recognized phase values. skill and output must be non-empty strings.

**Current data** (14 entries): All Spec Kit and custom skills across the development lifecycle.

---

### AgentDefinition

Represents an AI agent in the development workflow.

| Field | Type | Description |
|---|---|---|
| `name` | string | Display name (e.g., "BA Agent", "Developer Agent") |
| `role` | string | Professional role equivalent (e.g., "Business Analyst") |
| `icon` | TablerIcon | Icon component reference |
| `color` | string | Theme color key for badges and icon (blue, green, yellow, pink, grape, red) |
| `tools` | string[] | MCP tools used by this agent |
| `outputs` | string[] | Deliverables this agent produces |

**Validation**: name, role must be non-empty. tools and outputs must be non-empty arrays. color must be a valid Mantine theme color.

**Current data** (6 entries): BA, Architect, Developer, QA, Reviewer, Security

---

### McpToolEntry

Represents an MCP integration server.

| Field | Type | Description |
|---|---|---|
| `name` | string | MCP server name (e.g., "Context7", "GitHub") |
| `category` | string | Functional category (Docs, DevOps, Testing, Design, Reasoning, Knowledge, Query, Memory) |
| `role` | string | What this tool does in the project |
| `usedBy` | string | Agent roles that use this tool |

**Validation**: All fields must be non-empty strings.

**Current data** (8 entries): Context7, GitHub, Playwright, Magic UI, Sequential Thinking, SwarmVault, SwarmVault MCP, Claude Mem

---

### TechStackEntry

Represents a technology in the project's stack.

| Field | Type | Description |
|---|---|---|
| `layer` | string | Architectural layer (Framework, Language, UI Library, etc.) |
| `tech` | string | Technology/product name |
| `version` | string | Version used (or "—" if not versioned) |
| `purpose` | string | What this technology does in the project |

**Validation**: All fields must be non-empty strings.

**Current data** (11 entries): Next.js, TypeScript, Mantine UI, TanStack Query, Zod, Tabler Icons, Supabase PostgreSQL, Supabase Auth, Playwright, Vitest, Vercel

---

### FeatureCardEntry

Represents a feature of the application.

| Field | Type | Description |
|---|---|---|
| `title` | string | Feature name |
| `description` | string | What the feature does |
| `meta` | string | Metrics summary (e.g., "7 components · 5 API routes · 11 E2E tests") |
| `color` | string | Theme color for the badge |

**Validation**: All fields must be non-empty strings. color must be a valid Mantine theme color.

**Current data** (5 entries): Project Management, Requirements Management, Specification Management, Task & Implementation Tracking, Dashboard

---

### PhaseColorMap

A lookup record mapping phase names to Mantine theme colors. Used for skill phase badges and timeline elements.

```text
Analysis → blue, Spec → cyan, Design → green, Plan → teal, Tasks → yellow,
Build → orange, QA → pink, Test → pink, Review → grape, Security → red,
Knowledge → indigo, Rules → gray
```

## Relationships

- **SkillEntry → PhaseColorMap**: Each skill belongs to a phase, which determines its badge color.
- **AgentDefinition → McpToolEntry**: Agents use MCP tools (many-to-many, resolved by tool name string matching).
- **FeatureCardEntry → ProjectStat**: Feature cards display metrics that correspond to stat entries (same values, different presentation).

## Storage

No database tables. All data is `const` arrays in `project-info-page.tsx`. Updates require editing the source file.
