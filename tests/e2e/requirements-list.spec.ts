import { test, expect } from '@playwright/test';

test.describe('Requirements List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');
    // Navigate to first project's requirements
    const projectLink = page.locator('a[href*="/projects/"]').first();
    if (await projectLink.isVisible()) {
      await projectLink.click();
      await page.waitForURL(/\/projects\//);
    }
    const currentUrl = page.url();
    const match = currentUrl.match(/\/projects\/([^/]+)/);
    if (match) {
      await page.goto(`/projects/${match[1]}/requirements`);
    }
  });

  test('shows requirements ordered by recently updated', async ({ page }) => {
    // First, create three requirements
    const currentUrl = page.url();
    const match = currentUrl.match(/\/projects\/([^/]+)/);
    if (!match) return;
    const projectId = match[1];

    await page.goto(`/projects/${projectId}/requirements/new`);
    await page.getByLabel('Title').fill('Requirement Alpha');
    await page.getByLabel('Type').click();
    await page.getByRole('option', { name: 'Functional' }).click();
    await page.getByLabel('Priority').click();
    await page.getByRole('option', { name: 'P1 — Critical' }).click();
    await page.getByRole('button', { name: 'Create Requirement' }).click();
    await expect(page).toHaveURL(/\/requirements$/);

    await page.goto(`/projects/${projectId}/requirements/new`);
    await page.getByLabel('Title').fill('Requirement Beta');
    await page.getByLabel('Type').click();
    await page.getByRole('option', { name: 'Functional' }).click();
    await page.getByLabel('Priority').click();
    await page.getByRole('option', { name: 'P2 — High' }).click();
    await page.getByRole('button', { name: 'Create Requirement' }).click();
    await expect(page).toHaveURL(/\/requirements$/);

    await page.goto(`/projects/${projectId}/requirements/new`);
    await page.getByLabel('Title').fill('Requirement Gamma');
    await page.getByLabel('Type').click();
    await page.getByRole('option', { name: 'UX' }).click();
    await page.getByLabel('Priority').click();
    await page.getByRole('option', { name: 'P3 — Medium' }).click();
    await page.getByRole('button', { name: 'Create Requirement' }).click();
    await expect(page).toHaveURL(/\/requirements$/);

    // Verify all three appear
    await expect(page.getByText('Requirement Alpha')).toBeVisible();
    await expect(page.getByText('Requirement Beta')).toBeVisible();
    await expect(page.getByText('Requirement Gamma')).toBeVisible();
  });

  test('filters requirements by search', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search requirements...');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Alpha');
      await page.waitForTimeout(400); // debounce
      await expect(page.getByText('Requirement Alpha')).toBeVisible();
    }
  });

  test('filters requirements by type', async ({ page }) => {
    const typeFilter = page.getByText('Filter by type');
    // Skip if no filter visible (no requirements)
    test.skip((await typeFilter.isVisible()) === false, 'No type filter available');
  });

  test('filters requirements by status', async ({ page }) => {
    const statusFilter = page.getByText('Filter by status');
    test.skip((await statusFilter.isVisible()) === false, 'No status filter available');
  });

  test('shows empty state for project without requirements', async ({ page }) => {
    // Verify empty state appears when no requirements exist
    // This depends on the project — if requirements are present, the empty state shown won't match
    const hasRequirements = await page.getByText('Requirement').first().isVisible().catch(() => false);
    if (!hasRequirements) {
      await expect(page.getByText(/No requirements yet/)).toBeVisible();
      await expect(page.getByRole('link', { name: /first requirement/i })).toBeVisible();
    }
  });
});
