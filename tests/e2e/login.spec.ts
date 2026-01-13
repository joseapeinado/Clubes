import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/Inciar Sesión/);
});

test('successful login', async ({ page }) => {
  await page.goto('/login');

  await page.fill('input[name="email"]', 'club@demo.com');
  await page.fill('input[name="password"]', '123456');
  await page.click('button[type="submit"]');

  // Expect to be redirected to dashboard
  await expect(page).toHaveURL(/.*dashboard/);
});
