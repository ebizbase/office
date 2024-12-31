import { getJestProjectsAsync } from '@nx/jest';

export default async () => ({
  projects: await getJestProjectsAsync(),
  coverageReporters: ['text', 'json-summary', 'html'],
  logHeapUsage: true,
});
