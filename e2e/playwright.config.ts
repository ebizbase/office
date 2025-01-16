import { defineConfig, devices } from '@playwright/test';
import { workspaceRoot } from '@nx/devkit';
import { isUsingTsSolutionSetup } from '@nx/js/src/utils/typescript/ts-solution-setup';
import { defineBddConfig } from 'playwright-bdd';
import { relative, join } from 'path';

const projectPath = relative(workspaceRoot, __dirname);
const offset = relative(__dirname, workspaceRoot);

const isTsSolutionSetup = isUsingTsSolutionSetup();

const testResultOuputDir = isTsSolutionSetup
  ? 'test-output/playwright/output'
  : join(offset, 'dist', '.playwright', projectPath, 'test-output');
const reporterOutputDir = isTsSolutionSetup
  ? 'test-output/playwright/report'
  : join(offset, 'dist', '.playwright', projectPath, 'playwright-report');

const testDir = defineBddConfig({
  features: './src/features',
  steps: './src/steps/**/*.ts',
  verbose: true,
});

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir,
  outputDir: testResultOuputDir,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env['CI'],
  /* Retry on CI only */
  retries: process.env['CI'] ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env['CI'] ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    [
      'html',
      {
        outputFolder: reporterOutputDir,
        open: process.env['CI'] ? 'never' : 'on-failure',
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    video: {
      mode: 'retain-on-failure',
      size: { width: 640, height: 480 },
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment for mobile browsers support
    /*{
     name: 'firefox',
     use: { ...devices['Desktop Firefox'] },
   },
   {
     name: 'webkit',
     use: { ...devices['Desktop Safari'] },
   },*/
    /* {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */

    // Uncomment for branded browsers
    /* {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
  ],
});
