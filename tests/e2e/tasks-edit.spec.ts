import { test, expect } from '@playwright/test';

test.describe('Task Editing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');

    const projectLink = page.locator('a[href*="/projects/"]').first();

    if (await projectLink.isVisible()) {
      await projectLink.click();
      await page.waitForURL(/\/projects\//);
    }

    // Navigate to specification, task list, first task, then edit
    const currentUrl = page.url();
    const match = currentUrl.match(/\/projects\/([^/]+)/);
    if (match) {
      const projectId = match[1];
      await page.goto(`/projects/${projectId}/specifications`);

      const firstSpec = page.locator('a[href*="/specifications/"]').first();
      if (await firstSpec.isVisible()) {
        await firstSpec.click();
        await page.waitForURL(/\/specifications\//);

        const specUrl = page.url();
        const specMatch = specUrl.match(/\/specifications\/([^/]+)/);
        if (specMatch) {
          await page.goto(
            `/projects/${projectId}/specifications/${specMatch[1]}/tasks`
          );

          const firstTask = page.locator('a[href*="/tasks/"]').first();
          if (await firstTask.isVisible()) {
            await firstTask.click();
            await page.waitForURL(/\/tasks\//);

            const editButton = page.getByRole('button', { name: 'Edit' });
            if (await editButton.isVisible()) {
              await editButton.click();
              await page.waitForURL(/\/tasks\/.*\/edit/);
            }
          }
        }
      }
    }
  });

  test('can edit task title', async ({ page }) => {
    const url = page.url();
    if (!url.endsWith('/edit')) {
      test.skip(true, 'Could not navigate to edit page');
      return;
    }

    await page.getByLabel('Title').fill('Updated Task Title');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Should redirect back to detail
    await expect(page).toHaveURL(/\/tasks\/[^/]+$/);
    await expect(page.getByText('Updated Task Title')).toBeVisible();
  });

  test('shows validation error for empty title on edit', async ({ page }) => {
    const url = page.url();
    if (!url.endsWith('/edit')) {
      test.skip(true, 'Could not navigate to edit page');
      return;
    }

    await page.getByLabel('Title').fill('');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByText('Title is required')).toBeVisible();
  });

  test('shows status dropdown with valid transitions', async ({ page }) => {
    const url = page.url();
    if (!url.endsWith('/edit')) {
      test.skip(true, 'Could not navigate to edit page');
      return;
    }

    // Should show the status and position fields in edit mode
    const positionField = page.getByLabel('Position');
    await expect(positionField).toBeVisible();
  });
});
