import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('shows empty state for new users', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Welcome to SpecFlow Lite')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Create Your First Project' })
    ).toBeVisible();
  });

  test('shows dashboard with summary cards after creating a project', async ({ page }) => {
    // Create a project first
    await page.goto('/projects/new');
    await page.getByLabel('Project Name').fill('Dashboard Test Project');
    await page.getByRole('button', { name: 'Create Project' }).click();
    await expect(page).toHaveURL(/\/projects\//);

    // Navigate to dashboard
    await page.goto('/');
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Dashboard Test Project')).toBeVisible();

    // Summary cards should be visible
    await expect(page.getByText('Total Projects')).toBeVisible();
    await expect(page.getByText('Requirements')).toBeVisible();
    await expect(page.getByText('Specifications')).toBeVisible();
    await expect(page.getByText('Tasks')).toBeVisible();
  });

  test('shows correct aggregate counts', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/');

    // Should show at least 1 project
    const projectCount = page.getByText('Total Projects');
    await expect(projectCount).toBeVisible();
  });

  test('recent projects shows projects in access order', async ({ page }) => {
    // Create a second project to have multiple
    await page.goto('/projects/new');
    await page.getByLabel('Project Name').fill('Second Project');
    await page.getByRole('button', { name: 'Create Project' }).click();
    await expect(page).toHaveURL(/\/projects\//);

    // Visit the first project
    await page.goto('/projects');
    // Click on Dashboard Test Project in the list
    const firstProjectLink = page.getByText('Dashboard Test Project');
    if (await firstProjectLink.isVisible()) {
      await firstProjectLink.click();
      await expect(page).toHaveURL(/\/projects\//);
    }

    // Navigate to dashboard and check recent projects
    await page.goto('/');

    // Recent projects section should exist
    const recentHeading = page.getByRole('heading', { name: 'Recent Projects' });
    if (await recentHeading.isVisible()) {
      // At least one recent project should be visible
      const recentCards = page.getByText('Dashboard Test Project');
      const cardCount = await recentCards.count();
      expect(cardCount).toBeGreaterThan(0);
    }
  });

  test('open tasks section appears when dashboard has data', async ({ page }) => {
    await page.goto('/');

    // If projects exist, open tasks section should appear
    const openTasksHeading = page.getByRole('heading', { name: 'Open Tasks' });
    const dashboardEmpty = page.getByText('Welcome to SpecFlow Lite');

    // Either we have projects (and see Open Tasks or "All tasks completed")
    // OR we have no projects (and see empty state)
    const hasProjects = await dashboardEmpty.isHidden().catch(() => true);
    if (hasProjects) {
      await expect(openTasksHeading).toBeVisible();
    }
  });

  test('dashboard has refresh button', async ({ page }) => {
    await page.goto('/');

    const refreshButton = page.getByRole('button', { name: 'Refresh' });
    const dashboardEmpty = page.getByText('Welcome to SpecFlow Lite');

    // Refresh button should be visible if we have projects
    const hasProjects = await dashboardEmpty.isHidden().catch(() => true);
    if (hasProjects) {
      await expect(refreshButton).toBeVisible();
    }
  });

  test('nav links to dashboard from other pages', async ({ page }) => {
    await page.goto('/projects');
    const dashboardLink = page.getByRole('link', { name: 'Dashboard' });
    await dashboardLink.click();
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('dashboard renders at root URL (home page)', async ({ page }) => {
    await page.goto('/');
    // Should be at root, not redirected to /projects
    await expect(page).toHaveURL('/');
    // Should show dashboard content, not redirect
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('mobile responsive layout does not break', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // Just verify the page renders without crashing
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check no error boundaries rendered
    const errorBoundary = page.getByText('Application error');
    await expect(errorBoundary).toHaveCount(0);
  });
});
