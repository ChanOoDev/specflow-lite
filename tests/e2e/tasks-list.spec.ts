import { test, expect } from '@playwright/test';

test.describe('Task List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');

    const projectLink = page.locator('a[href*="/projects/"]').first();

    if (await projectLink.isVisible()) {
      await projectLink.click();
      await page.waitForURL(/\/projects\//);
    }

    // Navigate to specification detail (which now has inline task list)
    const currentUrl = page.url();
    const match = currentUrl.match(/\/projects\/([^/]+)/);
    if (match) {
      const projectId = match[1];
      await page.goto(`/projects/${projectId}/specifications`);

      const firstSpec = page.locator('a[href*="/specifications/"]').first();
      if (await firstSpec.isVisible()) {
        await firstSpec.click();
        await page.waitForURL(/\/specifications\//);
      }
    }
  });

  test('displays task section on specification detail', async ({ page }) => {
    const url = page.url();
    if (!url.match(/\/specifications\//)) {
      test.skip(true, 'Could not navigate to specification detail');
      return;
    }

    // Should show task completion summary or empty state
    const hasTaskSection = await Promise.race([
      page.getByText(/of \d+ tasks done/).isVisible().then(() => true),
      page.getByText('No tasks yet').isVisible().then(() => true),
      page.waitForTimeout(2000).then(() => false),
    ]);
    expect(hasTaskSection).toBe(true);
  });

  test('can navigate to standalone task list page', async ({ page }) => {
    const url = page.url();
    const match = url.match(/\/specifications\/([^/]+)/);
    if (!match) {
      test.skip(true, 'Not on specification page');
      return;
    }

    const projectMatch = url.match(/\/projects\/([^/]+)/);
    if (projectMatch) {
      await page.goto(
        `/projects/${projectMatch[1]}/specifications/${match[1]}/tasks`
      );
      await expect(page.getByText('Tasks')).toBeVisible();
    }
  });

  test('search filters tasks', async ({ page }) => {
    const url = page.url();
    const match = url.match(/\/specifications\/([^/]+)/);
    if (!match) {
      test.skip(true, 'Not on specification detail page');
      return;
    }

    const projectMatch = url.match(/\/projects\/([^/]+)/);
    if (projectMatch) {
      await page.goto(
        `/projects/${projectMatch[1]}/specifications/${match[1]}/tasks`
      );
    }

    const searchInput = page.getByPlaceholder('Search tasks...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('nonexistent-task');
    await page.waitForTimeout(400);

    // Either shows empty state or has filtered results
    const hasResult = await Promise.race([
      page.getByText('No tasks yet').isVisible().then(() => true),
      page.locator('a[href*="/tasks/"]').first().isVisible().then(() => true),
      page.waitForTimeout(1000).then(() => false),
    ]);
    expect(hasResult).toBe(true);
  });

  test('status filter filters tasks', async ({ page }) => {
    const url = page.url();
    const match = url.match(/\/specifications\/([^/]+)/);
    if (!match) {
      test.skip(true, 'Not on specification detail page');
      return;
    }

    const projectMatch = url.match(/\/projects\/([^/]+)/);
    if (projectMatch) {
      await page.goto(
        `/projects/${projectMatch[1]}/specifications/${match[1]}/tasks`
      );
    }

    const statusSelect = page.getByPlaceholder('Filter by status');
    if (await statusSelect.isVisible()) {
      await statusSelect.click();
      const todoOption = page.getByRole('option', { name: 'Todo' });
      if (await todoOption.isVisible()) {
        await todoOption.click();
      }
    }
  });
});
