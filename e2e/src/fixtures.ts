import { MailTesting, MailTestingClient } from '@ebizbase/testing-utils';
import { test as baseTest, createBdd } from 'playwright-bdd';

type PersonalInformation = { email: string; firstName: string; lastName: string };
type Fixtures = {
  information: PersonalInformation;
  maildev: MailTestingClient;
  HOME_SITE_BASE_URL: string;
  ACCOUNTS_SITE_URL_BASE_URL: string;
  MY_ACCOUNT_SITE_BASE_URL: string;
};

const baseURL = process.env['BASE_URL'] || 'http://fbi.com';
const protocal = baseURL.split('://')[0];
const rootDomain = baseURL.split('://')[1];
const getSiteUrl = (siteName: string) => {
  return siteName === 'home'
    ? `${protocal}://${rootDomain}`
    : `${protocal}://${siteName}.${rootDomain}`;
};

export const test = baseTest.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern
  HOME_SITE_BASE_URL: async ({}, use) => {
    await use(getSiteUrl('home') as Fixtures['HOME_SITE_BASE_URL']);
  },
  // eslint-disable-next-line no-empty-pattern
  ACCOUNTS_SITE_URL_BASE_URL: async ({}, use) => {
    await use(getSiteUrl('accounts') as Fixtures['ACCOUNTS_SITE_URL_BASE_URL']);
  },
  // eslint-disable-next-line no-empty-pattern
  MY_ACCOUNT_SITE_BASE_URL: async ({}, use) => {
    await use(getSiteUrl('my-account') as Fixtures['MY_ACCOUNT_SITE_BASE_URL']);
  },
  // eslint-disable-next-line no-empty-pattern
  information: async ({}, use) => {
    const info: PersonalInformation = {
      firstName: 'John',
      lastName: 'Doe',
      email: `${Date.now()}@email.test`,
    };
    await use(info as Fixtures['information']);
  },
  // eslint-disable-next-line no-empty-pattern
  maildev: async ({}, use) => {
    await use((await MailTesting.getClient()) as Fixtures['maildev']);
  },
});

export const { Given, When, Then, After, AfterAll, AfterScenario, AfterWorker } = createBdd(test);
