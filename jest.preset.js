const nxPreset = require('@nx/jest/preset').default;
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.base.json');
const { CODE_COVERAGE } = require('./rules');
/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  ...nxPreset,
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/index.ts', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: CODE_COVERAGE,
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '',
    useESM: true,
  }),
};
