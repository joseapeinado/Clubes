import { test, expect } from '@playwright/test';

test.describe('Disciplines', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'club@demo.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('can create a new discipline', async ({ page }) => {
    const disciplineName = `Tenis ${Date.now()}`;

    await page.goto('/dashboard/disciplines');
    await page.getByRole('button', { name: '+ Nueva Disciplina' }).click();

    await page.fill('input[name="name"]', disciplineName);
    await page.fill('input[name="description"]', 'Clases de tenis');

    // Find button inside dialog
    await page.click('button:has-text("Crear Disciplina")');

    // Validate it appears in table
    await expect(page.getByText(disciplineName)).toBeVisible();
  });
});
