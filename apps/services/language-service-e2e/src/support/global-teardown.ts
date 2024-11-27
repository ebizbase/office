import { teardown as teardownDevServer } from 'jest-dev-server';

module.exports = async function () {
  teardownDevServer(globalThis.servers);
};
