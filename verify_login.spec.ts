import { test, expect } from '@playwright/test';

test('Verify Login screen exists', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await expect(page).toHaveTitle(/Masar/i);
  await page.screenshot({ path: 'login_screen_new.png' });
});
