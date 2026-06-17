import { test, expect } from '@playwright/test';

test.describe('Specification Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a project first
    await page.goto('/projects');

    const projectLink = page.locator('a[href*="/projects/"]').first();

    if (await projectLink.isVisible()) {
      await projectLink.click();
      await page.waitForURL(/\/projects\//);
    }

    // Try to navigate to specifications new page
    const currentUrl = page.url();
    const match = currentUrl.match(/\/projects\/([^/]+)/);
    if (match) {
      await page.goto(`/projects/${match[1]}/specifications/new`);
    }
  });

  test('creates a specification with valid data', async ({ page }) => {
    await page.getByLabel('Title').fill('Auth System Specification');

    await page.getByRole('button', { name: 'Create Specification' }).click();

    // Should redirect to specifications list showing the new specification
    await expect(page).toHaveURL(/\/projects\/[^/]+\/specifications$/);
    await expect(page.getByText('Auth System Specification')).toBeVisible();
  });

  test('shows validation error for empty title', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Specification' }).click();
    await expect(page.getByText('Title is required')).toBeVisible();
  });

  test('shows validation error for title exceeding 200 chars', async ({ page }) => {
    await page.getByLabel('Title').fill('a'.repeat(201));
    await page.getByRole('button', { name: 'Create Specification' }).click();
    await expect(page.getByText(/200 characters/)).toBeVisible();
  });

  test('non-owner cannot create specifications', async ({ page }) => {
    test.skip(true, 'Requires second user session — covered by integration test');
  });
});
