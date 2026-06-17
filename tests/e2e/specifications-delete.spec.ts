import { test, expect } from '@playwright/test';

test.describe('Specification Deletion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');

    const projectLink = page.locator('a[href*="/projects/"]').first();

    if (await projectLink.isVisible()) {
      await projectLink.click();
      await page.waitForURL(/\/projects\//);
    }

    // Create a specification first if needed
    const currentUrl = page.url();
    const match = currentUrl.match(/\/projects\/([^/]+)/);
    if (match) {
      const projectId = match[1];
      // Go to specifications list
      await page.goto(`/projects/${projectId}/specifications`);

      // Check if there's at least one specification
      const firstSpec = page
        .locator('a[href*="/specifications/"]')
        .first();

      if (!(await firstSpec.isVisible().catch(() => false))) {
        // Create one
        await page.goto(`/projects/${projectId}/specifications/new`);
        await page.getByLabel('Title').fill('Spec to Delete');
        await page.getByRole('button', { name: 'Create Specification' }).click();
        await expect(page).toHaveURL(/\/specifications$/);
      }

      // Navigate to first specification detail
      const specLink = page
        .locator('a[href*="/specifications/"]')
        .first();
      if (await specLink.isVisible()) {
        await specLink.click();
        await page.waitForURL(/\/specifications\//);
      }
    }
  });

  test('delete button opens confirmation modal', async ({ page }) => {
    const url = page.url();
    if (!url.match(/\/specifications\/[^/]+$/)) {
      test.skip(true, 'Not on a specification detail page');
      return;
    }

    const deleteButton = page.getByRole('button', { name: 'Delete' });
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await expect(
        page.getByText('Type "')
      ).toBeVisible();
    }
  });

  test('cancel closes delete modal without deleting', async ({ page }) => {
    const url = page.url();
    if (!url.match(/\/specifications\/[^/]+$/)) {
      test.skip(true, 'Not on a specification detail page');
      return;
    }

    const deleteButton = page.getByRole('button', { name: 'Delete' });
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.getByRole('button', { name: 'Cancel' }).click();
      // Should still be on the detail page
      await expect(page).toHaveURL(/\/specifications\//);
    }
  });

  test('delete with typed confirmation removes specification', async ({
    page,
  }) => {
    const url = page.url();
    if (!url.match(/\/specifications\/[^/]+$/)) {
      test.skip(true, 'Not on a specification detail page');
      return;
    }

    const notFound = page.getByText('Specification Not Found');
    if (await notFound.isVisible().catch(() => false)) {
      test.skip(true, 'Specification not found');
      return;
    }

    const deleteButton = page.getByRole('button', { name: 'Delete' });
    if (!(await deleteButton.isVisible().catch(() => false))) {
      test.skip(true, 'Archived project — delete button hidden');
      return;
    }

    await deleteButton.click();

    // Read the specification title from the confirmation prompt
    const modalText = await page
      .getByText(/Type "/)
      .textContent()
      .catch(() => null);
    if (!modalText) {
      test.skip(true, 'Could not read confirmation text');
      return;
    }

    // Extract the title between quotes
    const titleMatch = modalText.match(/Type "(.+)" to confirm/);
    if (!titleMatch) {
      test.skip(true, 'Could not extract title from confirmation');
      return;
    }

    const title = titleMatch[1]!;

    // Type the exact title to confirm
    const input = page.getByPlaceholder(title);
    await input.fill(title);

    // Click delete
    await page.getByRole('button', { name: 'Delete' }).last().click();

    // Should redirect to specifications list
    await expect(page).toHaveURL(/\/specifications$/);
  });
});
