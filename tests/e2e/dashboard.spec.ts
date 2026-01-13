import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'club@demo.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('displays key metrics', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Resumen General' })).toBeVisible();
    await expect(page.getByText('Alumnos Activos')).toBeVisible();
    await expect(page.getByText('Ingresos Mensuales')).toBeVisible();
    await expect(page.getByText('Ingresos Pendientes')).toBeVisible();
  });
});
