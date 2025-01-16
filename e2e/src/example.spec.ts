import { test, expect } from '@playwright/test';
import { HOME_SITE_URL } from './utils/constants';

test('has title', async ({ page }) => {
  await page.goto(HOME_SITE_URL);
  // Expect h1 to contain a substring.
  expect(await page.locator('title').innerText()).toContain('home-site');
});
