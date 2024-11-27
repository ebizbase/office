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
      'npx nx run mailer-service:serve:development --inspect false --runtimeArgs=--no-warnings',
    debug: true,
    usedPortAction: 'kill',
    launchTimeout: 50000,
    port: 3004,
  });
};
