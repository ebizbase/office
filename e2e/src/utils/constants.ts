const baseURL = process.env['BASE_URL'] || 'http://fbi.com';
const protocal = baseURL.split('://')[0];
const rootDomain = baseURL.split('://')[1];

export const HOME_SITE_URL = `${protocal}://${rootDomain}`;
export const ACCOUNTS_SITE_URL = `${protocal}://accounts.${rootDomain}`;
export const MY_ACCOUNT_SITE_URL = `${protocal}://my-account.${rootDomain}`;
