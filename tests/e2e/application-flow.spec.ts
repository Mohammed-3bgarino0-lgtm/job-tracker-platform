import { test, expect } from '@playwright/test';

test('End-to-End Application Flow in Qaddem AI', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/قدّم | Qaddem AI/);

  // Check Quick Input box
  const adInput = page.locator('textarea');
  await expect(adInput).toBeVisible();
});
