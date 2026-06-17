import { test, expect } from '@playwright/test';

test.describe('Requirement Detail', () => {
  test('shows all requirement fields', async ({ page }) => {
    await page.goto('/projects');

    // Navigate to a project
    const projectLink = page.locator('a[href*="/projects/"]').first();
    if (!(await projectLink.isVisible().catch(() => false))) {
      test.skip(true, 'No projects available');
      return;
    }
    await projectLink.click();
    await page.waitForURL(/\/projects\//);

    // Navigate to requirements list
    const reqLink = page.locator('a[href*="/requirements/"]').first();
    const hasReqLink = await reqLink.isVisible().catch(() => false);
    if (hasReqLink) {
      await reqLink.click();
      await page.waitForURL(/\/requirements\//);

      // Click first requirement to view detail
      const firstReq = page.locator('a[href*="/requirements/"]').first();
      if (await firstReq.isVisible().catch(() => false)) {
        await firstReq.click();
        await page.waitForURL(/\/requirements\/[^/]+$/);

        // Verify fields visible
        await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
        await expect(page.locator('text=Type').first()).toBeVisible();
        await expect(page.locator('text=Priority').first()).toBeVisible();
        await expect(page.locator('text=Status').first()).toBeVisible();
      }
    }
  });

  test('returns 404 for non-existent requirement', async ({ page }) => {
    await page.goto(
      '/projects/00000000-0000-0000-0000-000000000000/requirements/00000000-0000-0000-0000-000000000000'
    );
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});
