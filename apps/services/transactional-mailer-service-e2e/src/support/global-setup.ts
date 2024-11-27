/* eslint-disable */
import { setup as setupDevServer } from 'jest-dev-server';
import { SpawndChildProcess } from 'spawnd';

declare global {
  var servers: SpawndChildProcess[];
}

module.exports = async function () {
  process.stdout.write('\nSetting up servers for e2e tests\n');
  globalThis.servers = await setupDevServer({
    command:
      'npx nx run transactional-mailer-service:serve:development --inspect false --runtimeArgs=--no-warnings',
    debug: true,
    launchTimeout: 50000,
    usedPortAction: 'kill',
    port: 3005,
  });
};
