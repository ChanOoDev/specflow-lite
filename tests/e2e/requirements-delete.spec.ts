import { test, expect } from '@playwright/test';

test.describe('Requirement Delete', () => {
  test('deletes a requirement with confirmation', async ({ page }) => {
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

    // Click Delete button
    await page.getByRole('button', { name: 'Delete' }).click();

    // Confirmation modal should appear
    await expect(page.getByText('Delete Requirement')).toBeVisible();
    await expect(
      page.getByText(/Type ".*" to confirm/)
    ).toBeVisible();

    // Cancel the dialog
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Delete Requirement')).not.toBeVisible();

    // Open again and confirm
    await page.getByRole('button', { name: 'Delete' }).click();
    // Type the requirement title to confirm
    const input = page.getByPlaceholder(/./).first();
    const confirmText = await page
      .getByText(/Type ".*" to confirm/)
      .textContent();
    const match = confirmText?.match(/"([^"]+)"/);
    if (match && input) {
      await input.fill(match[1]!);
      await page.getByRole('button', { name: 'Delete' }).last().click();
    }

    // Should redirect to requirements list
    await expect(page).toHaveURL(/\/requirements$/);
  });

  test('cancel confirmation keeps requirement unchanged', async ({ page }) => {
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

    // Click Delete, then Cancel
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Delete Requirement')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Delete Requirement')).not.toBeVisible();

    // Still on the detail page
    await expect(page).toHaveURL(/\/requirements\/[^/]+$/);
  });
});
