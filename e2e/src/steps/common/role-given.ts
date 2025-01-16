import { Given } from '../fixtures';


Given('I am an unauthenticated visitor', async ({ page }) => {
  // Clear access token and refresh token cookies for ensure user is unauthenticated
  await page.context().clearCookies({ name: 'actk' });
  await page.context().clearCookies({ name: 'rftk' });
});


Given('I am an authenticated user', async () => {
  //
});





