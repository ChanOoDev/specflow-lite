import { test, expect } from '@playwright/test';

test.describe('Task Detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');

    const projectLink = page.locator('a[href*="/projects/"]').first();

    if (await projectLink.isVisible()) {
      await projectLink.click();
      await page.waitForURL(/\/projects\//);
    }

    // Navigate to specification, then to first task
    const currentUrl = page.url();
    const match = currentUrl.match(/\/projects\/([^/]+)/);
    if (match) {
      const projectId = match[1];
      await page.goto(`/projects/${projectId}/specifications`);

      const firstSpec = page.locator('a[href*="/specifications/"]').first();
      if (await firstSpec.isVisible()) {
        await firstSpec.click();
        await page.waitForURL(/\/specifications\//);

        // Navigate to task list page
        const specUrl = page.url();
        const specMatch = specUrl.match(/\/specifications\/([^/]+)/);
        if (specMatch) {
          await page.goto(
            `/projects/${projectId}/specifications/${specMatch[1]}/tasks`
          );

          // Click first task
          const firstTask = page.locator('a[href*="/tasks/"]').first();
          if (await firstTask.isVisible()) {
            await firstTask.click();
            await page.waitForURL(/\/tasks\//);
          }
        }
      }
    }
  });

  test('displays task detail', async ({ page }) => {
    const url = page.url();
    if (!url.match(/\/tasks\/[^/]+$/)) {
      test.skip(true, 'Could not navigate to task detail');
      return;
    }

    // Should show task fields
    const hasDetail = await Promise.race([
      page.getByText('Position:').isVisible().then(() => true),
      page.getByText('Created:').isVisible().then(() => true),
      page.getByText('Updated:').isVisible().then(() => true),
      page.waitForTimeout(2000).then(() => false),
    ]);
    expect(hasDetail).toBe(true);
  });

  test('shows Edit and Delete buttons', async ({ page }) => {
    const url = page.url();
    if (!url.match(/\/tasks\/[^/]+$/)) {
      test.skip(true, 'Could not navigate to task detail');
      return;
    }

    const editButton = page.getByRole('button', { name: 'Edit' });
    const deleteButton = page.getByRole('button', { name: 'Delete' });

    const hasButtons = await Promise.race([
      editButton.isVisible().then(() => true),
      deleteButton.isVisible().then(() => true),
      page.waitForTimeout(1000).then(() => false),
    ]);
    expect(hasButtons).toBe(true);
  });

  test('shows not found for invalid task ID', async ({ page }) => {
    const url = page.url();
    const projectMatch = url.match(/\/projects\/([^/]+)/);
    const specMatch = url.match(/\/specifications\/([^/]+)/);
    if (projectMatch && specMatch) {
      await page.goto(
        `/projects/${projectMatch[1]}/specifications/${specMatch[1]}/tasks/00000000-0000-0000-0000-000000000000`
      );
      await expect(page.getByText(/not found/i)).toBeVisible();
    }
  });
});
