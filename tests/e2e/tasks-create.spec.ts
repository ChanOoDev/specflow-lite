import { test, expect } from '@playwright/test';

test.describe('Task Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');

    const projectLink = page.locator('a[href*="/projects/"]').first();

    if (await projectLink.isVisible()) {
      await projectLink.click();
      await page.waitForURL(/\/projects\//);
    }

    // Navigate to a specification first, then to tasks new
    const currentUrl = page.url();
    const match = currentUrl.match(/\/projects\/([^/]+)/);
    if (match) {
      const projectId = match[1];
      // Go to specifications list
      await page.goto(`/projects/${projectId}/specifications`);

      const firstSpec = page.locator('a[href*="/specifications/"]').first();
      if (await firstSpec.isVisible()) {
        await firstSpec.click();
        await page.waitForURL(/\/specifications\//);

        // Navigate to new task page
        const specUrl = page.url();
        const specMatch = specUrl.match(/\/specifications\/([^/]+)/);
        if (specMatch) {
          await page.goto(
            `/projects/${projectId}/specifications/${specMatch[1]}/tasks/new`
          );
        }
      }
    }
  });

  test('creates a task with valid data', async ({ page }) => {
    const url = page.url();
    if (!url.endsWith('/tasks/new')) {
      test.skip(true, 'Could not navigate to new task page');
      return;
    }

    await page.getByLabel('Title').fill('Set up database schema');

    await page.getByRole('button', { name: 'Create Task' }).click();

    // Should redirect to tasks list showing the new task
    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.getByText('Set up database schema')).toBeVisible();
  });

  test('shows validation error for empty title', async ({ page }) => {
    const url = page.url();
    if (!url.endsWith('/tasks/new')) {
      test.skip(true, 'Could not navigate to new task page');
      return;
    }

    await page.getByRole('button', { name: 'Create Task' }).click();
    await expect(page.getByText('Title is required')).toBeVisible();
  });

  test('shows validation error for title exceeding 200 chars', async ({ page }) => {
    const url = page.url();
    if (!url.endsWith('/tasks/new')) {
      test.skip(true, 'Could not navigate to new task page');
      return;
    }

    await page.getByLabel('Title').fill('a'.repeat(201));
    await page.getByRole('button', { name: 'Create Task' }).click();
    await expect(page.getByText(/200 characters/)).toBeVisible();
  });
});
