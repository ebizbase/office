import { expect } from '../expect-extend';
import { Then, When } from '../fixtures';

When('navigate to identify page', async ({ page, ACCOUNTS_SITE_URL_BASE_URL }) => {
  await page.goto(`${ACCOUNTS_SITE_URL_BASE_URL}/identify`);
});

When('enters my email', async ({ page, information }) => {
  await page.locator('[type="email"]').fill(information.email);
});

When('clicks the next button', async ({ page }) => {
  await page.getByRole('button', { name: 'Next' }).click();
});

Then('should be on the verify otp page', async ({ page, ACCOUNTS_SITE_URL_BASE_URL }) => {
  const regex = new RegExp(`^${ACCOUNTS_SITE_URL_BASE_URL}/verify-otp([?&].*)?$`);
  await page.waitForURL(regex);
});

When('clicks the get otp button', async ({ page }) => {
  await page.getByRole('button', { name: 'Get OTP' }).click();
});

When('enters my OTP', async ({ page, maildev, information }) => {
  const emails = await maildev.waitForEmail({
    'to.address': information.email,
  });
  const otp = emails[0].text.split(' ').pop();
  expect(otp, 'Should have otp in email').toBeTruthy();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await page.locator('[type="number"]').fill(otp!);
});

Then('should be on the the my-account-site', async ({ page, MY_ACCOUNT_SITE_BASE_URL }) => {
  const regex = new RegExp(`^${MY_ACCOUNT_SITE_BASE_URL}.*$`);
  await page.waitForURL(regex);
});
