import axios from 'axios';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';

describe('GET /api', () => {
  let container: StartedTestContainer;

  beforeAll(async () => {
    container = await new GenericContainer('ebizbase/office-api:edge')
      .withExposedPorts(3000)
      .withWaitStrategy(Wait.forLogMessage('Application is running on', 1))
      .start();
    axios.defaults.baseURL = `http://127.0.0.1:${container.getMappedPort(3000)}`;
  }, 30000);

  it('should return a message', async () => {
    const res = await axios.get('/');
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });
});
