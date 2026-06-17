import { test, expect } from '@playwright/test';

test.describe('Project Detail', () => {
  test('displays project metadata and counts', async ({ page }) => {
    // Create a project
    await page.goto('/projects/new');
    await page.getByLabel('Project Name').fill('Detail Test Project');
    await page.getByLabel('Description').fill('Testing detail view');
    await page.getByRole('button', { name: 'Create Project' }).click();
    await expect(page).toHaveURL(/\/projects\//);

    // Verify detail display
    await expect(page.getByRole('heading', { name: 'Detail Test Project' })).toBeVisible();
    await expect(page.getByText('Testing detail view')).toBeVisible();
    await expect(page.getByText('active')).toBeVisible();
    await expect(page.getByText('Requirements')).toBeVisible();
    await expect(page.getByText('Specifications')).toBeVisible();
    await expect(page.getByText('Tasks')).toBeVisible();
  });

  test('shows not found for non-existent project', async ({ page }) => {
    await page.goto('/projects/00000000-0000-0000-0000-000000000000');
    await expect(page.getByText('Project Not Found')).toBeVisible();
  });
});
