const playwright = require('eslint-plugin-playwright');
const baseConfig = require('../eslint.config.js');

module.exports = [
  playwright.configs['flat/recommended'],
  ...baseConfig,
  {
    ignores: ['.features-gen/*'],
  },
  {
    files: ['**/*.ts', '**/*.js'],
    rules: {},
  },
  {
    files: ['src/steps/**/*.ts', 'src/**/*.js'],
    rules: {
      'playwright/no-standalone-expect': 'off',
    },
  },
];
