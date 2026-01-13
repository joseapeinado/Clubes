import { test, expect } from '@playwright/test';

test.describe('Payments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'club@demo.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('can open generate fees dialog', async ({ page }) => {
    await page.goto('/dashboard/payments');
    // Click the button with the credit card icon + text
    await page.getByRole('button', { name: 'Generar Cuotas' }).click();

    // Check for dialog title
    await expect(page.getByRole('heading', { name: 'Generar Cuotas Mensuales' })).toBeVisible();

    // Check for submit button inside the dialog using the form ID to be specific
    await expect(page.locator('form#generate-fees-form button[type="submit"]')).toBeVisible();
  });
});
