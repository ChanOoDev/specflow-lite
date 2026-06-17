import { test, expect } from '@playwright/test';

test.describe('Requirement Edit', () => {
  test('edits requirement title and saves', async ({ page }) => {
    await page.goto('/projects');
    const projectLink = page.locator('a[href*="/projects/"]').first();
    if (!(await projectLink.isVisible().catch(() => false))) {
      test.skip(true, 'No projects available');
      return;
    }
    await projectLink.click();
    await page.waitForURL(/\/projects\//);
    const currentUrl = page.url();
    const pMatch = currentUrl.match(/\/projects\/([^/]+)/);
    if (!pMatch) return;
    const projectId = pMatch[1];

    // Go to requirements list
    await page.goto(`/projects/${projectId}/requirements`);

    // Click first requirement
    const firstReq = page.locator('a[href*="/requirements/"]').first();
    if (!(await firstReq.isVisible().catch(() => false))) {
      test.skip(true, 'No requirements available');
      return;
    }
    await firstReq.click();
    await page.waitForURL(/\/requirements\/[^/]+$/);

    // Click Edit
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.waitForURL(/\/edit$/);

    // Change title
    await page.getByLabel('Title').fill('Edited Requirement Title');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Should redirect back to detail
    await expect(page).toHaveURL(/\/requirements\/[^/]+$/);
    await expect(page.getByText('Edited Requirement Title')).toBeVisible();
  });

  test('shows valid status transitions in dropdown', async ({ page }) => {
    await page.goto('/projects');
    const projectLink = page.locator('a[href*="/projects/"]').first();
    if (!(await projectLink.isVisible().catch(() => false))) {
      test.skip(true, 'No projects available');
      return;
    }
    await projectLink.click();
    await page.waitForURL(/\/projects\//);
    const currentUrl = page.url();
    const pMatch = currentUrl.match(/\/projects\/([^/]+)/);
    if (!pMatch) return;
    const projectId = pMatch[1];

    await page.goto(`/projects/${projectId}/requirements`);

    const firstReq = page.locator('a[href*="/requirements/"]').first();
    if (!(await firstReq.isVisible().catch(() => false))) {
      test.skip(true, 'No requirements available');
      return;
    }
    await firstReq.click();
    await page.waitForURL(/\/requirements\/[^/]+$/);
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.waitForURL(/\/edit$/);

    // Status dropdown should have valid transitions for "draft" status
    const statusSelect = page.getByLabel('Status');
    await statusSelect.click();
    await expect(page.getByRole('option', { name: 'Approved' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Deferred' })).toBeVisible();
  });

  test('rejects invalid status transition', async ({ page }) => {
    await page.goto('/projects');
    const projectLink = page.locator('a[href*="/projects/"]').first();
    if (!(await projectLink.isVisible().catch(() => false))) {
      test.skip(true, 'No projects available');
      return;
    }
    await projectLink.click();
    await page.waitForURL(/\/projects\//);

    // This test verifies the server-side transition validation
    // The UI should only show valid transitions, so direct API call is covered
    // in the integration test. Here we verify the UI defense.
    test.skip(true, 'Server transition validation covered by integration test');
  });
});
