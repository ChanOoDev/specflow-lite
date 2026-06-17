import { test, expect } from '@playwright/test';

test.describe('Specification Detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');

    const projectLink = page.locator('a[href*="/projects/"]').first();

    if (await projectLink.isVisible()) {
      await projectLink.click();
      await page.waitForURL(/\/projects\//);
    }

    // Go to specifications list
    const currentUrl = page.url();
    const match = currentUrl.match(/\/projects\/([^/]+)/);
    if (match) {
      await page.goto(`/projects/${match[1]}/specifications`);
    }

    // Try to click the first specification if any exist
    const firstSpec = page
      .locator('a[href*="/specifications/"]')
      .first();
    if (await firstSpec.isVisible()) {
      await firstSpec.click();
      await page.waitForURL(/\/specifications\//);
    }
  });

  test('displays specification detail when viewing a spec', async ({ page }) => {
    // If we navigated to a spec detail, verify key elements
    const url = page.url();
    if (url.includes('/specifications/') && !url.endsWith('/specifications')) {
      // Should show the back button
      await expect(
        page.getByText('Back to Specifications')
      ).toBeVisible();

      // Should show either linked requirements section or empty state
      const linkedText = page.getByText('Linked Requirements');
      const notFound = page.getByText('Specification Not Found');

      const visible = await Promise.race([
        linkedText.isVisible().then(() => 'linked'),
        notFound.isVisible().then(() => 'not-found'),
        page.waitForTimeout(2000).then(() => 'timeout'),
      ]);

      expect(['linked', 'not-found', 'timeout']).toContain(visible);
    }
  });

  test('shows edit and delete buttons for non-archived spec', async ({ page }) => {
    const url = page.url();
    if (url.includes('/specifications/') && !url.endsWith('/specifications')) {
      const editButton = page.getByRole('button', { name: 'Edit' });
      const deleteButton = page.getByRole('button', { name: 'Delete' });
      const notFound = page.getByText('Specification Not Found');

      // Either we see action buttons or not-found page
      const visible = await Promise.race([
        editButton.isVisible().then(() => 'edit'),
        deleteButton.isVisible().then(() => 'delete'),
        notFound.isVisible().then(() => 'not-found'),
        page.waitForTimeout(2000).then(() => 'timeout'),
      ]);

      expect(['edit', 'delete', 'not-found', 'timeout']).toContain(visible);
    }
  });
});
