import { test, expect } from '@playwright/test';

test.describe('Project Info', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project-info');
  });

  test('renders header with title and badges', async ({ page }) => {
    await expect(page.getByText('Project Info')).toBeVisible();
    await expect(page.getByText('SpecFlow Lite')).toBeVisible();
    await expect(page.getByText('AI-assisted spec-driven development')).toBeVisible();
    await expect(page.getByText('Next.js 16')).toBeVisible();
    await expect(page.getByText('Supabase')).toBeVisible();
    await expect(page.getByText('6 Agents')).toBeVisible();
  });

  test('renders stats bar with 8 metrics', async ({ page }) => {
    await expect(page.getByText('Features')).toBeVisible();
    await expect(page.getByText('Components')).toBeVisible();
    await expect(page.getByText('API Routes')).toBeVisible();
    await expect(page.getByText('Tests')).toBeVisible();
    await expect(page.getByText('DB Tables')).toBeVisible();
    await expect(page.getByText('AI Agents')).toBeVisible();
    await expect(page.getByText('Skills')).toBeVisible();
    await expect(page.getByText('MCP Tools')).toBeVisible();
  });

  test('renders build methodology timeline', async ({ page }) => {
    await expect(page.getByText('Build Methodology')).toBeVisible();
    await expect(page.getByText('Analyze')).toBeVisible();
    await expect(page.getByText('Specify & Clarify')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Design' })).toBeVisible();
    await expect(page.getByText('Plan & Tasks')).toBeVisible();
    await expect(page.getByText('Implement')).toBeVisible();
    await expect(page.getByText('Review')).toBeVisible();
    await expect(page.getByText('Test')).toBeVisible();
  });

  test('renders GitHub Spec Kit section', async ({ page }) => {
    await expect(page.getByText('GitHub Spec Kit')).toBeVisible();
    await expect(page.getByText('speckit.specify')).toBeVisible();
    await expect(page.getByText('speckit.clarify')).toBeVisible();
    await expect(page.getByText('speckit.plan')).toBeVisible();
    await expect(page.getByText('speckit.tasks')).toBeVisible();
  });

  test('renders AI agents section with 6 cards', async ({ page }) => {
    await expect(page.getByText('AI Agents')).toBeVisible();
    await expect(page.getByText('BA Agent')).toBeVisible();
    await expect(page.getByText('Architect Agent')).toBeVisible();
    await expect(page.getByText('Developer Agent')).toBeVisible();
    await expect(page.getByText('QA Agent')).toBeVisible();
    await expect(page.getByText('Reviewer Agent')).toBeVisible();
    await expect(page.getByText('Security Agent')).toBeVisible();
  });

  test('renders skills table', async ({ page }) => {
    await expect(page.getByText('Skills')).toBeVisible();
    await expect(page.getByText('ba-skill')).toBeVisible();
    await expect(page.getByText('qa-skill')).toBeVisible();
    await expect(page.getByText('reviewer-skill')).toBeVisible();
  });

  test('renders key features section', async ({ page }) => {
    await expect(page.getByText('Key Features')).toBeVisible();
    await expect(page.getByText('Project Management')).toBeVisible();
    await expect(page.getByText('Requirements Management')).toBeVisible();
    await expect(page.getByText('Specification Management')).toBeVisible();
    await expect(page.getByText('Task & Implementation Tracking')).toBeVisible();
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('renders technology stack table', async ({ page }) => {
    await expect(page.getByText('Technology Stack')).toBeVisible();
    await expect(page.getByText('Next.js')).toBeVisible();
    await expect(page.getByText('TypeScript')).toBeVisible();
    await expect(page.getByText('Mantine UI')).toBeVisible();
    await expect(page.getByText('Supabase PostgreSQL')).toBeVisible();
  });

  test('renders MCP tools table', async ({ page }) => {
    await expect(page.getByText('MCP Tools')).toBeVisible();
    await expect(page.getByText('Context7')).toBeVisible();
    await expect(page.getByText('GitHub')).toBeVisible();
    await expect(page.getByText('Playwright')).toBeVisible();
  });

  test('renders footer', async ({ page }) => {
    await expect(page.getByText('Built with Claude Code')).toBeVisible();
    await expect(page.getByText('VibeCode Tour')).toBeVisible();
  });

  test('has no console errors', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') logs.push(msg.text());
    });
    await page.reload();
    expect(logs).toEqual([]);
  });

  test('page is accessible via navbar', async ({ page }) => {
    await page.goto('/');
    const navLink = page.getByRole('link', { name: 'Project Info' });
    await expect(navLink).toBeVisible();
    await navLink.click();
    await expect(page).toHaveURL('/project-info');
  });
});
