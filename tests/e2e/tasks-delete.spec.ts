import { test, expect } from '@playwright/test';

test.describe('Task Deletion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');

    const projectLink = page.locator('a[href*="/projects/"]').first();

    if (await projectLink.isVisible()) {
      await projectLink.click();
      await page.waitForURL(/\/projects\//);
    }

    // Navigate to specification, task list, first task
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
          }
        }
      }
    }
  });

  test('shows delete confirmation modal', async ({ page }) => {
    const url = page.url();
    if (!url.match(/\/tasks\/[^/]+$/)) {
      test.skip(true, 'Could not navigate to task detail');
      return;
    }

    const deleteButton = page.getByRole('button', { name: 'Delete' });
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Should show confirmation modal
      const modal = page.getByText(/permanently delete/i);
      await expect(modal).toBeVisible();

      // Cancel button should exist
      const cancelButton = page.getByRole('button', { name: 'Cancel' });
      await expect(cancelButton).toBeVisible();
    }
  });

  test('delete button is disabled until title typed', async ({ page }) => {
    const url = page.url();
    if (!url.match(/\/tasks\/[^/]+$/)) {
      test.skip(true, 'Could not navigate to task detail');
      return;
    }

    const deleteButton = page.getByRole('button', { name: 'Delete' });
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // The "Delete Task" confirm button should be disabled
      const confirmButton = page.getByRole('button', { name: 'Delete Task' });
      await expect(confirmButton).toBeDisabled();
    }
  });

  test('can cancel deletion', async ({ page }) => {
    const url = page.url();
    if (!url.match(/\/tasks\/[^/]+$/)) {
      test.skip(true, 'Could not navigate to task detail');
      return;
    }

    const deleteButton = page.getByRole('button', { name: 'Delete' });
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Cancel the deletion
      const cancelButton = page.getByRole('button', { name: 'Cancel' });
      await cancelButton.click();

      // Should still be on the detail page
      await expect(page).toHaveURL(/\/tasks\/[^/]+$/);
    }
  });
});
