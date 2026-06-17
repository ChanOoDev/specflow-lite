import { test, expect } from '@playwright/test';

test.describe('Project Delete', () => {
  test('deletes a project with confirmation', async ({ page }) => {
    // Create a project
    await page.goto('/projects/new');
    await page.getByLabel('Project Name').fill('Delete Test Project');
    await page.getByRole('button', { name: 'Create Project' }).click();
    await expect(page).toHaveURL(/\/projects\//);

    // Open delete dialog
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('This action cannot be undone')).toBeVisible();

    // Type project name to confirm
    await page.getByPlaceholder('Delete Test Project').fill('Delete Test Project');
    await page.getByRole('button', { name: 'Delete Project' }).click();

    // Should redirect to projects list
    await expect(page).toHaveURL('/projects', { timeout: 5000 });
  });

  test('cancels deletion when dialog is dismissed', async ({ page }) => {
    await page.goto('/projects');
    const projectCard = page.locator('a[href*="/projects/"]').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
      await page.getByRole('button', { name: 'Delete' }).click();
      await expect(page.getByText('This action cannot be undone')).toBeVisible();
      await page.getByRole('button', { name: 'Cancel' }).click();
      // Project should still be visible
      await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
    }
  });

  test('shows not found for soft-deleted project', async ({ page }) => {
    // Create a project
    await page.goto('/projects/new');
    await page.getByLabel('Project Name').fill('To Be Deleted');
    await page.getByRole('button', { name: 'Create Project' }).click();
    await expect(page).toHaveURL(/\/projects\//);

    // Capture the URL before deleting
    const projectUrl = page.url();

    // Delete it
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('This action cannot be undone')).toBeVisible();
    await page.getByPlaceholder('To Be Deleted').fill('To Be Deleted');
    await page.getByRole('button', { name: 'Delete Project' }).click();
    await expect(page).toHaveURL('/projects', { timeout: 5000 });

    // Try to access the deleted project URL directly
    await page.goto(projectUrl);
    await expect(page.getByText('Project Not Found')).toBeVisible();
  });
});
