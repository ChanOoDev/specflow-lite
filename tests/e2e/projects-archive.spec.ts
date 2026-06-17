import { test, expect } from '@playwright/test';

test.describe('Project Archive & Restore', () => {
  test('archives and restores a project', async ({ page }) => {
    // Create a project
    await page.goto('/projects/new');
    await page.getByLabel('Project Name').fill('Archive Test Project');
    await page.getByRole('button', { name: 'Create Project' }).click();
    await expect(page).toHaveURL(/\/projects\//);

    // Archive it
    await page.getByRole('button', { name: 'Archive' }).click();
    await page.waitForTimeout(1000);

    // Should show Restore button now
    await expect(page.getByRole('button', { name: 'Restore' })).toBeVisible();

    // Go to list, shouldn't be visible by default
    await page.goto('/projects');
    await expect(page.getByText('Archive Test Project')).not.toBeVisible();

    // Show archived
    await page.getByRole('button', { name: 'Show Archived' }).click();
    await expect(page.getByText('Archive Test Project')).toBeVisible();

    // Open and restore
    await page.getByText('Archive Test Project').click();
    await page.getByRole('button', { name: 'Restore' }).click();
    await page.waitForTimeout(1000);

    // Should show active again
    await expect(page.getByText('active')).toBeVisible();
  });
});
