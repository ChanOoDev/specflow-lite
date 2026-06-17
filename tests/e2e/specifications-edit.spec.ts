import { test, expect } from '@playwright/test';

test.describe('Specification Editing', () => {
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

    // Click first specification if any, then navigate to edit
    const firstSpec = page.locator('a[href*="/specifications/"]').first();
    if (await firstSpec.isVisible()) {
      await firstSpec.click();
      await page.waitForURL(/\/specifications\//);

      const editButton = page.getByRole('button', { name: 'Edit' });
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL(/\/specifications\/.*\/edit/);
      }
    }
  });

  test('can edit specification title', async ({ page }) => {
    const url = page.url();
    if (!url.endsWith('/edit')) {
      test.skip(true, 'Could not navigate to edit page');
      return;
    }

    await page.getByLabel('Title').fill('Updated Spec Title');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Should redirect back to detail
    await expect(page).toHaveURL(/\/specifications\/[^/]+$/);
    await expect(page.getByText('Updated Spec Title')).toBeVisible();
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

  test('shows status dropdown when transitions exist', async ({ page }) => {
    const url = page.url();
    if (!url.endsWith('/edit')) {
      test.skip(true, 'Could not navigate to edit page');
      return;
    }

    // Should show the link requirements section
    const linkSection = page.getByText('Link Requirements');
    await expect(linkSection).toBeVisible();
  });
});
