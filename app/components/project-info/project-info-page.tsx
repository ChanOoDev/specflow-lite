'use client';

import {
  Container,
  Stack,
  Group,
  Title,
  Text,
  Paper,
  SimpleGrid,
  Card,
  Badge,
  Table,
  ThemeIcon,
  Divider,
  List,
  Timeline,
  Box,
} from '@mantine/core';
import {
  IconClipboardCheck,
  IconBuildingArch,
  IconCode,
  IconTestPipe,
  IconEye,
  IconShieldLock,
  IconBooks,
  IconSearch,
  IconBrowser,
  IconBrain,
  IconAffiliate,
  IconDatabase,
  IconBrandGithub,
  IconBrandNextjs,
  IconChartBar,
  IconArrowRight,
  IconGitBranch,
  IconPuzzle,
  IconRocket,
  IconUsers,
  IconDevices,
} from '@tabler/icons-react';

// ─── Data ────────────────────────────────────────────────────────

const STATS = [
  { label: 'Features', value: 7 },
  { label: 'Components', value: 41 },
  { label: 'API Routes', value: 10 },
  { label: 'Tests', value: 100 },
  { label: 'DB Tables', value: 4 },
  { label: 'AI Agents', value: 6 },
  { label: 'Skills', value: 18 },
  { label: 'MCP Tools', value: 8 },
];

const SKILLS = [
  { skill: 'ba-skill', phase: 'Analysis', output: 'User stories, acceptance criteria, business rules' },
  { skill: 'speckit-analyze', phase: 'Analysis', output: 'Feature analysis and structured requirements discovery' },
  { skill: 'speckit-clarify', phase: 'Analysis', output: 'Clarification questions to resolve ambiguities' },
  { skill: 'speckit-specify', phase: 'Spec', output: 'Structured feature specification documents' },
  { skill: 'spec-kit-skill', phase: 'Spec', output: 'Orchestrates full Spec Kit workflow across all phases' },
  { skill: 'architect-skill', phase: 'Design', output: 'DB schema, API contracts, security patterns' },
  { skill: 'speckit-plan', phase: 'Plan', output: 'Implementation plan from specification' },
  { skill: 'speckit-tasks', phase: 'Tasks', output: 'Granular implementation tasks with dependencies' },
  { skill: 'speckit-taskstoissues', phase: 'Tasks', output: 'Converts task list to GitHub issues for tracking' },
  { skill: 'speckit-implement', phase: 'Build', output: 'Executes tasks following plan and conventions' },
  { skill: 'ux-skill', phase: 'Design', output: 'Component composition, layouts, empty states' },
  { skill: 'speckit-checklist', phase: 'QA', output: 'Quality checklists for pre-review validation' },
  { skill: 'qa-skill', phase: 'Test', output: 'Test cases, edge cases, Playwright scenarios' },
  { skill: 'reviewer-skill', phase: 'Review', output: 'Code quality, architecture, performance review' },
  { skill: 'security-review-skill', phase: 'Security', output: 'RLS audit, auth review, OWASP checks' },
  { skill: 'swarmvault', phase: 'Knowledge', output: 'Code graph compilation, wiki, graph-first search' },
  { skill: 'speckit-constitution', phase: 'Rules', output: 'Project conventions and development rules' },
  { skill: 'speckit-agent-context-update', phase: 'Rules', output: 'Refreshes agent context files after spec/plan changes' },
];

const AGENTS = [
  {
    name: 'BA Agent',
    role: 'Business Analyst',
    icon: IconClipboardCheck,
    color: 'blue',
    tools: ['sequential-thinking'],
    outputs: ['User stories', 'Acceptance criteria', 'Business rules', 'Clarification questions'],
  },
  {
    name: 'Architect Agent',
    role: 'Solution Architect',
    icon: IconBuildingArch,
    color: 'green',
    tools: ['sequential-thinking', 'context7', 'supabase'],
    outputs: ['Architecture overview', 'DB schema', 'API contracts', 'Security design'],
  },
  {
    name: 'Developer Agent',
    role: 'Full-Stack Developer',
    icon: IconCode,
    color: 'yellow',
    tools: ['context7', 'github', 'playwright', 'supabase'],
    outputs: ['Components', 'API routes', 'Hooks', 'Validators', 'Tests'],
  },
  {
    name: 'QA Agent',
    role: 'Quality Engineer',
    icon: IconTestPipe,
    color: 'pink',
    tools: ['playwright'],
    outputs: ['Test cases', 'Negative scenarios', 'Playwright E2E scripts'],
  },
  {
    name: 'Reviewer Agent',
    role: 'Code Reviewer',
    icon: IconEye,
    color: 'grape',
    tools: ['github'],
    outputs: ['Quality findings', 'Risks', 'Approval decision'],
  },
  {
    name: 'Security Agent',
    role: 'Security Reviewer',
    icon: IconShieldLock,
    color: 'red',
    tools: ['context7', 'supabase'],
    outputs: ['RLS audit', 'Auth review', 'Vulnerability scan', 'Mitigations'],
  },
];

const MCP_TOOLS = [
  { name: 'Context7', category: 'Docs', role: 'Real-time API docs for Next.js, Supabase, Mantine, TanStack Query, Zod', usedBy: 'Architect, Developer, Security' },
  { name: 'GitHub', category: 'DevOps', role: 'Issues, PRs, branches, Copilot code review, repo management', usedBy: 'Developer, Reviewer' },
  { name: 'Playwright', category: 'Testing', role: 'Browser automation, UI verification, console error detection, 89 E2E tests', usedBy: 'Developer, QA' },
  { name: 'Magic UI', category: 'Design', role: 'Component inspiration for dashboards, empty states, cards, hero sections', usedBy: 'Developer' },
  { name: 'Sequential Thinking', category: 'Reasoning', role: 'Structured problem-solving for architecture, DB design, complex debugging', usedBy: 'BA, Architect' },
  { name: 'SwarmVault', category: 'Knowledge', role: 'Automated code graph compilation, wiki management, graph-first search hooks', usedBy: 'All agents' },
  { name: 'SwarmVault MCP', category: 'Query', role: 'Graph traversal, blast radius, call graphs, community detection', usedBy: 'All agents' },
  { name: 'Claude Mem', category: 'Memory', role: 'Cross-session project insights, decisions, and pattern persistence', usedBy: 'All agents' },
];

const TECH_STACK = [
  { layer: 'Framework', tech: 'Next.js', version: '16.2', purpose: 'App Router, Server Components, API routes' },
  { layer: 'Language', tech: 'TypeScript', version: '6.0', purpose: 'Strict mode, full type safety' },
  { layer: 'UI Library', tech: 'Mantine UI', version: '9.3', purpose: 'Accessible components, forms, modals, theming' },
  { layer: 'State', tech: 'TanStack Query', version: '5.101', purpose: 'Server state caching, optimistic mutations' },
  { layer: 'Validation', tech: 'Zod', version: '4.4', purpose: 'Form + API schema validation' },
  { layer: 'Icons', tech: 'Tabler Icons', version: '3.44', purpose: '3,000+ vector icons' },
  { layer: 'Database', tech: 'Supabase PostgreSQL', version: '2.108', purpose: 'Managed db, RLS, real-time' },
  { layer: 'Auth', tech: 'Supabase Auth', version: '0.12', purpose: 'GitHub OAuth, session management' },
  { layer: 'E2E Testing', tech: 'Playwright', version: '1.61', purpose: '89 browser test scenarios' },
  { layer: 'Unit Testing', tech: 'Vitest', version: '4.1', purpose: '8 unit + 3 integration tests' },
  { layer: 'Deployment', tech: 'Vercel', version: '—', purpose: 'GitHub auto-deploy, PR previews, zero-config' },
];

const FEATURES = [
  {
    title: 'Project Management',
    description: 'CRUD, status lifecycle (Active/Paused/Completed/Archived), search & filter, archive/restore, soft-delete with 30-day recovery, optimistic locking',
    meta: '7 components · 3 API routes · 19 E2E tests',
    color: 'blue',
  },
  {
    title: 'Requirements Management',
    description: '4 types (Functional/Non-functional/Technical/UX), P1–P5 priority, Draft→Approved flow, link to specifications',
    meta: '8 components · 2 API routes · 16 E2E tests',
    color: 'green',
  },
  {
    title: 'Specification Management',
    description: 'Create from approved requirements, requirement linking, Draft→In Review→Approved→Implemented lifecycle',
    meta: '8 components · 2 API routes · 17 E2E tests',
    color: 'yellow',
  },
  {
    title: 'Task & Implementation Tracking',
    description: 'Todo/In Progress/Done status, lock on approved spec, cross-project listing, per-spec task board',
    meta: '7 components · 2 API routes · 16 E2E tests',
    color: 'pink',
  },
  {
    title: 'Dashboard',
    description: 'Project health overview, recent projects quick-access, open tasks at-a-glance, empty states with CTAs',
    meta: '6 components · 1 API route · 9 E2E tests',
    color: 'grape',
  },
  {
    title: 'Project Info',
    description: 'Project statistics, build methodology timeline, AI agents, skills registry, MCP tools, tech stack, feature overview',
    meta: '1 component · 0 API routes · 12 E2E tests',
    color: 'cyan',
  },
  {
    title: 'Vercel CI/CD Deployment',
    description: 'GitHub integration, auto-deploy on push to main, PR preview deployments, environment variable management, zero-downtime rollback',
    meta: '1 config file · 0 API routes · proxy.ts',
    color: 'orange',
  },
];

const PHASE_COLOR: Record<string, string> = {
  Analysis: 'blue',
  Spec: 'cyan',
  Design: 'green',
  Plan: 'teal',
  Tasks: 'yellow',
  Build: 'orange',
  QA: 'pink',
  Test: 'pink',
  Review: 'grape',
  Security: 'red',
  Knowledge: 'indigo',
  Rules: 'gray',
};

const AGENT_COLOR_MAP: Record<string, string> = {
  blue: 'blue',
  green: 'teal',
  yellow: 'yellow',
  pink: 'pink',
  grape: 'grape',
  red: 'red',
};

const AGENT_ICON_COLOR: Record<string, string> = {
  blue: 'var(--mantine-color-blue-6)',
  green: 'var(--mantine-color-teal-6)',
  yellow: 'var(--mantine-color-yellow-6)',
  pink: 'var(--mantine-color-pink-6)',
  grape: 'var(--mantine-color-grape-6)',
  red: 'var(--mantine-color-red-6)',
};

// ─── Component ───────────────────────────────────────────────────

export function ProjectInfoPage() {
  return (
    <Container size="md" py="md">
      <Stack gap="xl">
        {/* ── Header ── */}
        <Group justify="space-between" wrap="wrap">
          <div>
            <Title order={2}>Project Info</Title>
            <Text c="dimmed" size="sm">
              SpecFlow Lite — AI-assisted spec-driven development
            </Text>
          </div>
          <Group gap="xs">
            <Badge variant="dot" size="lg" color="blue">Next.js 16</Badge>
            <Badge variant="dot" size="lg" color="teal">Supabase</Badge>
            <Badge variant="dot" size="lg" color="pink">6 Agents</Badge>
          </Group>
        </Group>

        {/* ── Stats Bar ── */}
        <Paper radius="md" p="md" withBorder>
          <SimpleGrid cols={{ base: 4, sm: 8 }}>
            {STATS.map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <Text fz={28} fw={800} lh={1}>{s.value}</Text>
                <Text size="xs" c="dimmed">{s.label}</Text>
              </div>
            ))}
          </SimpleGrid>
        </Paper>

        {/* ── Build Methodology ── */}
        <div>
          <Title order={3} mb="md">Build Methodology</Title>
          <Paper radius="md" p="lg" withBorder>
            <Timeline active={6} bulletSize={28} lineWidth={2} color="blue">
              <Timeline.Item bullet={<span style={{ fontSize: 14 }}>📋</span>} title="Analyze">
                <Text c="dimmed" size="sm">BA Agent discovers requirements, user stories, and acceptance criteria</Text>
              </Timeline.Item>
              <Timeline.Item bullet={<span style={{ fontSize: 14 }}>💬</span>} title="Specify & Clarify">
                <Text c="dimmed" size="sm">GitHub Spec Kit generates spec.md — clarify resolves ambiguities</Text>
              </Timeline.Item>
              <Timeline.Item bullet={<span style={{ fontSize: 14 }}>🏗️</span>} title="Design">
                <Text c="dimmed" size="sm">Architect Agent designs data model, API contracts, component architecture</Text>
              </Timeline.Item>
              <Timeline.Item bullet={<span style={{ fontSize: 14 }}>📐</span>} title="Plan & Tasks">
                <Text c="dimmed" size="sm">Spec Kit generates plan.md and task breakdown with dependencies</Text>
              </Timeline.Item>
              <Timeline.Item bullet={<span style={{ fontSize: 14 }}>💻</span>} title="Implement">
                <Text c="dimmed" size="sm">Developer Agent builds components, API routes, hooks, validators, tests</Text>
              </Timeline.Item>
              <Timeline.Item bullet={<span style={{ fontSize: 14 }}>👀</span>} title="Review">
                <Text c="dimmed" size="sm">Reviewer + Security agents assess quality, RLS, and maintainability</Text>
              </Timeline.Item>
              <Timeline.Item bullet={<span style={{ fontSize: 14 }}>🧪</span>} title="Test">
                <Text c="dimmed" size="sm">QA Agent runs Playwright E2E + Vitest integration/unit tests</Text>
              </Timeline.Item>
            </Timeline>
          </Paper>
        </div>

        <Divider />

        {/* ── GitHub Spec Kit ── */}
        <div>
          <Group gap="sm" mb="md">
            <ThemeIcon size="lg" radius="md" color="dark">
              <IconBrandGithub size={20} />
            </ThemeIcon>
            <Title order={3}>GitHub Spec Kit</Title>
          </Group>
          <Paper radius="md" p="lg" withBorder>
            <Text size="sm" c="dimmed" mb="md">
              Orchestrates the full specification-driven development cycle with automated review gates at each stage.
              Every SpecFlow Lite feature was built through this pipeline.
            </Text>
            <SimpleGrid cols={{ base: 2, sm: 4 }}>
              {[
                { cmd: 'specify', icon: '📋', file: 'spec.md', desc: 'User stories, acceptance criteria, edge cases, functional requirements' },
                { cmd: 'clarify', icon: '💬', file: 'spec.md (updated)', desc: 'Clarification questions, ambiguity resolution, scope boundaries' },
                { cmd: 'plan', icon: '📐', file: 'plan.md', desc: 'Architecture, data model, API contracts, component tree, route design' },
                { cmd: 'tasks', icon: '✅', file: 'tasks.md', desc: 'Ordered task list, dependencies, priority, effort estimate, acceptance check' },
              ].map((s) => (
                <Paper key={s.cmd} radius="sm" p="md" bg="dark.7">
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>{s.icon} spearit.{s.cmd}</Text>
                  <Text size="xs" c="blue.4" mb={8}>→ {s.file}</Text>
                  <Text size="xs" c="dimmed">{s.desc}</Text>
                </Paper>
              ))}
            </SimpleGrid>
          </Paper>
        </div>

        <Divider />

        {/* ── Skills ── */}
        <div>
          <Title order={3} mb="md">Skills</Title>
          <Paper radius="md" withBorder style={{ overflow: 'hidden' }}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Skill</Table.Th>
                  <Table.Th>Phase</Table.Th>
                  <Table.Th>Output</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {SKILLS.map((s) => (
                  <Table.Tr key={s.skill}>
                    <Table.Td><Text fw={600} size="sm">{s.skill}</Text></Table.Td>
                    <Table.Td>
                      <Badge size="xs" variant="light" color={PHASE_COLOR[s.phase] || 'gray'}>
                        {s.phase}
                      </Badge>
                    </Table.Td>
                    <Table.Td><Text size="xs" c="dimmed">{s.output}</Text></Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </div>

        <Divider />

        {/* ── Agents ── */}
        <div>
          <Title order={3} mb="md">AI Agents</Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
            {AGENTS.map((a) => (
              <Card key={a.name} radius="md" padding="lg" withBorder>
                <Group gap="sm" mb="xs">
                  <ThemeIcon size="md" radius="md" color={AGENT_COLOR_MAP[a.color]}>
                    <a.icon size={18} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600} size="sm">{a.name}</Text>
                    <Text size="xs" c="dimmed">{a.role}</Text>
                  </div>
                </Group>
                <Group gap={4} mb="sm">
                  {a.tools.map((t) => (
                    <Badge key={t} size="xs" variant="outline" color={a.color}>{t}</Badge>
                  ))}
                </Group>
                <List spacing={2} size="xs" c="dimmed">
                  {a.outputs.map((o) => (
                    <List.Item key={o}>{o}</List.Item>
                  ))}
                </List>
              </Card>
            ))}
          </SimpleGrid>
        </div>

        <Divider />

        {/* ── MCP Tools ── */}
        <div>
          <Title order={3} mb="md">MCP Tools</Title>
          <Paper radius="md" withBorder style={{ overflow: 'hidden' }}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>MCP Server</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Used By</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {MCP_TOOLS.map((t) => (
                  <Table.Tr key={t.name}>
                    <Table.Td><Text fw={600} size="sm">{t.name}</Text></Table.Td>
                    <Table.Td><Badge size="xs" variant="light" color="gray">{t.category}</Badge></Table.Td>
                    <Table.Td><Text size="xs" c="dimmed">{t.role}</Text></Table.Td>
                    <Table.Td><Text size="xs">{t.usedBy}</Text></Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </div>

        <Divider />

        {/* ── Features ── */}
        <div>
          <Title order={3} mb="md">Key Features</Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            {FEATURES.map((f) => (
              <Card key={f.title} radius="md" padding="lg" withBorder>
                <Badge size="sm" variant="light" color={f.color} mb="sm">{f.color}</Badge>
                <Text fw={600} mb="xs">{f.title}</Text>
                <Text size="sm" c="dimmed" mb="sm">{f.description}</Text>
                <Text size="xs" c="blue.4">{f.meta}</Text>
              </Card>
            ))}
          </SimpleGrid>
        </div>

        <Divider />

        {/* ── Tech Stack ── */}
        <div>
          <Title order={3} mb="md">Technology Stack</Title>
          <Paper radius="md" withBorder style={{ overflow: 'hidden' }}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Layer</Table.Th>
                  <Table.Th>Technology</Table.Th>
                  <Table.Th>Version</Table.Th>
                  <Table.Th>Purpose</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {TECH_STACK.map((t) => (
                  <Table.Tr key={t.tech}>
                    <Table.Td><Text fw={600} size="sm">{t.layer}</Text></Table.Td>
                    <Table.Td>{t.tech}</Table.Td>
                    <Table.Td><Badge size="xs" variant="default">{t.version}</Badge></Table.Td>
                    <Table.Td><Text size="xs" c="dimmed">{t.purpose}</Text></Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </div>

        {/* ── Footer ── */}
        <Box py="lg" ta="center">
          <Text size="xs" c="dimmed">
            Built with Claude Code · VibeCode Tour · June 2026
          </Text>
        </Box>
      </Stack>
    </Container>
  );
}
