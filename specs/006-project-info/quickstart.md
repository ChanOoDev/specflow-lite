# Quickstart: Project Info

**Feature**: 006-project-info  
**Date**: 2026-06-18  

## Prerequisites

- Dev server running (`npm run dev`)
- Browser at `http://localhost:3000`

## Validation Scenarios

### VS-001: Navigation link is visible

1. Open any page in the application (e.g., `http://localhost:3000`)
2. Look at the navbar
3. **Expect**: "Project Info" nav link is visible in the navigation list

### VS-002: Navigate to Project Info page

1. Click the "Project Info" nav link
2. **Expect**: Page loads at `/project-info`
3. **Expect**: Page title is "Project Info"
4. **Expect**: Subtitle reads "SpecFlow Lite — AI-assisted spec-driven development"
5. **Expect**: Three badges visible: "Next.js 16", "Supabase", "6 Agents"

### VS-003: Stats bar renders

1. On the Project Info page
2. **Expect**: Stats bar shows 8 metrics in a row (desktop) or 4×2 grid (mobile)
3. **Expect**: Each metric has a large number and a label below it
4. **Expect**: Values are: Features=5, Components=35, API Routes=13, Tests=33, DB Tables=5, AI Agents=6, Skills=14, MCP Tools=8

### VS-004: Build Methodology timeline renders

1. Scroll to "Build Methodology" section
2. **Expect**: 7-step timeline visible with phase names: Analyze, Specify & Clarify, Design, Plan & Tasks, Implement, Review, Test
3. **Expect**: Each step has a descriptive summary text below the title

### VS-005: GitHub Spec Kit section renders

1. Scroll to "GitHub Spec Kit" section
2. **Expect**: 4 command cards in a grid: specify, clarify, plan, tasks
3. **Expect**: Each card shows the command name, output file, and description

### VS-006: AI Agents section renders

1. Scroll to "AI Agents" section
2. **Expect**: 6 agent cards in a responsive grid (3 columns desktop, 1 column mobile)
3. **Expect**: Each card shows agent name, role, tool badges, and output items
4. **Expect**: BA Agent has "sequential-thinking" tool
5. **Expect**: Developer Agent has "context7, github, playwright, supabase" tools

### VS-007: Skills table renders

1. Scroll to "Skills" section
2. **Expect**: Table with 14 rows, columns: Skill, Phase, Output
3. **Expect**: Each row has a color-coded phase badge
4. **Expect**: "ba-skill" is first row with "Analysis" phase badge

### VS-008: Key Features section renders

1. Scroll to "Key Features" section
2. **Expect**: 5 feature cards in a 2-column grid (desktop)
3. **Expect**: Each card has title, description, and metrics (`X components · Y API routes · Z E2E tests`)

### VS-009: Technology Stack table renders

1. Scroll to "Technology Stack" section
2. **Expect**: Table with 11 rows, columns: Layer, Technology, Version, Purpose
3. **Expect**: "Next.js" row shows version "16.2"
4. **Expect**: "TypeScript" row shows version "6.0"

### VS-010: MCP Tools table renders

1. Scroll to "MCP Tools" section
2. **Expect**: Table with 8 rows, columns: MCP Server, Category, Role, Used By
3. **Expect**: Each row has a category badge

### VS-011: Footer renders

1. Scroll to bottom of page
2. **Expect**: Footer text: "Built with Claude Code · VibeCode Tour · June 2026"

### VS-012: Responsive layout

1. Resize browser to 375px width (mobile)
2. **Expect**: No horizontal scrollbar
3. **Expect**: Stats bar shows 4 columns (not 8)
4. **Expect**: Agent cards stack vertically (1 column)
5. **Expect**: Feature cards stack vertically (1 column)
6. **Expect**: Tables are contained within their paper wrappers

### VS-013: Direct URL access

1. Navigate directly to `http://localhost:3000/project-info`
2. **Expect**: Page loads without redirect or authentication prompt
3. **Expect**: All sections render as in normal navigation

### VS-014: Console errors

1. Open browser developer tools (F12) → Console tab
2. Navigate to Project Info page
3. **Expect**: No console errors or warnings from the page
