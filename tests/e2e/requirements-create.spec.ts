import { test, expect } from '@playwright/test';

test.describe('Requirement Creation', () => {
  test.beforeEach(async ({ page }) => {
    // First ensure we have a project. Navigate to projects list and click first project.
    await page.goto('/projects');
    // If empty state appears, create a test project
    const emptyCta = page.getByRole('link', { name: /create/i }).or(
      page.getByRole('button', { name: /new project/i })
    );
    const hasProject = await page
      .getByRole('link')
      .filter({ hasText: /./ })
      .first()
      .isVisible()
      .catch(() => false);

    if (!hasProject) {
      await page.goto('/projects/new');
      await page.getByLabel('Project Name').fill('E2E Test Project');
      await page.getByRole('button', { name: 'Create Project' }).click();
      await expect(page).toHaveURL(/\/projects\//);
    }

    // Navigate to requirements
    await page.goto('/projects');
    const firstProjectLink = page.locator('a[href*="/projects/"][href*="requirements"]').first();
    const projectLink = page.locator('a[href*="/projects/"]').first();

    // Go to project detail, then find link to requirements
    if (await projectLink.isVisible()) {
      await projectLink.click();
      await page.waitForURL(/\/projects\//);
    }

    // Try to navigate to requirements new page
    const currentUrl = page.url();
    const match = currentUrl.match(/\/projects\/([^/]+)/);
    if (match) {
      await page.goto(`/projects/${match[1]}/requirements/new`);
    }
  });

  test('creates a requirement with valid data', async ({ page }) => {
    // Fill the form
    await page.getByLabel('Title').fill('User Login Page');

    // Select type
    const typeSelect = page.getByLabel('Type');
    await typeSelect.click();
    await page.getByRole('option', { name: 'functional' }).click();

    // Select priority
    const prioritySelect = page.getByLabel('Priority');
    await prioritySelect.click();
    await page.getByRole('option', { name: 'p1' }).click();

    await page.getByRole('button', { name: 'Create Requirement' }).click();

    // Should redirect to requirements list showing the new requirement
    await expect(page).toHaveURL(/\/projects\/[^/]+\/requirements$/);
    await expect(page.getByText('User Login Page')).toBeVisible();
  });

  test('shows validation error for empty title', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Requirement' }).click();
    await expect(page.getByText('Title is required')).toBeVisible();
  });

  test('shows validation error for title exceeding 200 chars', async ({ page }) => {
    await page.getByLabel('Title').fill('a'.repeat(201));
    await page.getByRole('button', { name: 'Create Requirement' }).click();
    await expect(page.getByText(/200 characters/)).toBeVisible();
  });

  test('non-owner cannot create requirements', async ({ page }) => {
    // This test verifies the 404 behavior for non-owners
    // Given the current app uses single-user auth, we verify the page
    // requires authentication by checking for redirect or error state
    // The integration test covers the actual non-owner 404 scenario
    // through direct API calls.
    test.skip(true, 'Requires second user session — covered by integration test');
  });
});
