import { expect as baseExpect } from '@playwright/test';

export const expect = baseExpect.extend({
  // see more about custom matcher https://playwright.dev/docs/test-assertions#add-custom-matchers-using-expectextend
  async toBeStartWiths(received: string, expected: string) {
    const pass = received.startsWith(expected);
    if (pass) {
      return {
        message: () => `expected "${received}" not to start with "${expected}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected "${received}" to start with "${expected}"`,
        pass: false,
      };
    }
  },
  async toBeEndWiths(received: string, expected: string) {
    const pass = received.endsWith(expected);
    if (pass) {
      return {
        message: () => `expected "${received}" not to start with "${expected}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected "${received}" to start with "${expected}"`,
        pass: false,
      };
    }
  },
});
