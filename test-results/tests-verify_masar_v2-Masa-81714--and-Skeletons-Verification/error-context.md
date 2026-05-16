# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/verify_masar_v2.spec.ts >> Masar Project Dialog and Skeletons Verification
- Location: tests/verify_masar_v2.spec.ts:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=مرحباً بك في مسار')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=مرحباً بك في مسار')

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  |
  3  | test('Masar Project Dialog and Skeletons Verification', async ({ page }) => {
  4  |   await page.goto('http://localhost:5173');
  5  |
  6  |   // Verify Login screen is displayed
  7  |   const loginTitle = page.locator('text=مرحباً بك في مسار');
> 8  |   await expect(loginTitle).toBeVisible();
     |                            ^ Error: expect(locator).toBeVisible() failed
  9  |
  10 |   // We can't easily test the Project Dialog without a session,
  11 |   // but we can verify that the app builds and the login screen still works.
  12 |   // The major changes were in protected routes.
  13 |
  14 |   await page.screenshot({ path: 'login_screen_final.png' });
  15 | });
  16 |
```