import { test, expect } from '@playwright/test';

test.describe('Project Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects/new');
  });

  test('creates a project with valid data', async ({ page }) => {
    await page.getByLabel('Project Name').fill('My Test Project');
    await page.getByLabel('Description').fill('A test project for E2E');
    await page.getByRole('button', { name: 'Create Project' }).click();

    await expect(page).toHaveURL(/\/projects\//);
    await expect(page.getByRole('heading', { name: 'My Test Project' })).toBeVisible();
    await expect(page.getByText('active')).toBeVisible();
  });

  test('shows validation error for empty name', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Project' }).click();
    await expect(page.getByText('Project name is required')).toBeVisible();
  });

  test('shows validation error for name exceeding 120 chars', async ({ page }) => {
    await page.getByLabel('Project Name').fill('a'.repeat(121));
    await page.getByRole('button', { name: 'Create Project' }).click();
    await expect(page.getByText(/120 characters/)).toBeVisible();
  });

  test('shows error for duplicate project name', async ({ page }) => {
    // Create first project
    await page.getByLabel('Project Name').fill('Unique Project Name');
    await page.getByRole('button', { name: 'Create Project' }).click();
    await expect(page).toHaveURL(/\/projects\//);

    // Navigate back and try to create another with the same name
    await page.goto('/projects/new');
    await page.getByLabel('Project Name').fill('Unique Project Name');
    await page.getByRole('button', { name: 'Create Project' }).click();

    // Should show duplicate error
    await expect(page.getByText(/already exists/)).toBeVisible();
  });
});
