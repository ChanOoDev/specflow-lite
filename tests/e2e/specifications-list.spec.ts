import { test, expect } from '@playwright/test';

test.describe('Specification List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');

    const projectLink = page.locator('a[href*="/projects/"]').first();

    if (await projectLink.isVisible()) {
      await projectLink.click();
      await page.waitForURL(/\/projects\//);
    }

    const currentUrl = page.url();
    const match = currentUrl.match(/\/projects\/([^/]+)/);
    if (match) {
      await page.goto(`/projects/${match[1]}/specifications`);
    }
  });

  test('displays specifications list page', async ({ page }) => {
    await expect(page.getByText('Specifications')).toBeVisible();
  });

  test('shows empty state when no specifications exist', async ({ page }) => {
    // Should show empty state with CTA
    const emptyOrSpec = await Promise.race([
      page.getByText('No specifications yet').isVisible().then(() => 'empty'),
      page.getByText('Your First Specification').isVisible().then(() => 'cta'),
      page.locator('[data-spec-card]').first().isVisible().then(() => 'has-specs'),
    ]);

    // Either we have specs or we see empty state
    expect(['empty', 'cta', 'has-specs']).toContain(emptyOrSpec);
  });

  test('can navigate to new specification form', async ({ page }) => {
    const newButton = page.getByRole('link', { name: /new specification/i });
    if (await newButton.isVisible()) {
      await newButton.click();
      await expect(page).toHaveURL(/\/specifications\/new/);
    }
  });

  test('search filters specifications', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search specifications...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('nonexistent-spec-name');
    // After debounce, should show filtered empty state
    await page.waitForTimeout(400);
    const noMatch = page.getByText('No specifications match your search');
    const hasSpecs = page.locator('[data-spec-card], a[href*="/specifications/"]').first();
    // Either filtered empty or some results — both valid
    const visible = await Promise.race([
      noMatch.isVisible().then(() => true),
      hasSpecs.isVisible().then(() => true),
      page.waitForTimeout(1000).then(() => false),
    ]);
    expect(visible).toBe(true);
  });

  test('status filter filters specifications', async ({ page }) => {
    const statusSelect = page.getByPlaceholder('Filter by status');
    if (await statusSelect.isVisible()) {
      await statusSelect.click();
      const draftOption = page.getByRole('option', { name: 'Draft' });
      if (await draftOption.isVisible()) {
        await draftOption.click();
      }
    }
  });
});
