import { Then, When, expect } from '../fixtures';

const baseURL = process.env['BASE_URL'] || 'http://fbi.com';
const protocal = baseURL.split('://')[0];
const rootDomain = baseURL.split('://')[1];

function getSiteUrl(siteName: string) {
  return siteName === 'home'
    ? `${protocal}://${rootDomain}`
    : `${protocal}://${siteName}.${rootDomain}`;
}

When('I navigate to {string} on {string} site', async ({ page }, path: string, siteName: string) => {
  await page.goto(`${getSiteUrl(siteName)}${path}`);
});

When('I navigate to {string} site', async ({ page }, siteName: string) => {
  await page.goto(`${getSiteUrl(siteName)}`);
});

When('I navigate to {string}', async ({ page }, url: string) => {
  await page.goto(url);
});

Then('I should be redirected to {string} on {string} site', async ({ page }, expectedPath: string, expectedSite: string) => {
  const currentUrl = page.url();
  expect(currentUrl).toBe(`${getSiteUrl(expectedSite)}${expectedPath}`);
});

Then('I should be redirected to {string} site', async ({ page }, expectedSite: string) => {
  const currentUrl = page.url();
  expect(currentUrl).toBeStartWiths(getSiteUrl(expectedSite));
});

Then('I should be redirected to {string}', async ({ page }, expectedUrl: string) => {
  const currentUrl = page.url();
  expect(currentUrl).toBe(expectedUrl);
});
