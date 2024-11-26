import { Tree, logger } from '@nx/devkit';
import { join } from 'path';
import * as fs from 'fs';

import { executorGeneratorSchema } from './schema';
import { executorGenerator } from './generator';

interface Generator {
  factory: string;
  schema: string;
  description: string;
}

interface ExecutorJson {
  executors: {
    [key: string]: Generator;
  };
}

jest.mock('@nx/devkit', () => ({
  formatFiles: jest.fn(),
  generateFiles: jest.fn(),
  updateJson: jest.fn(),
  logger: {
    error: jest.fn(),
  },
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(),
}));

describe('executorGenerator', () => {
  let tree: Tree;
  const options: executorGeneratorSchema = { name: 'test-executor' };

  beforeEach(() => {
    tree = {
      root: '/root',
      read: jest.fn(),
      write: jest.fn(),
      delete: jest.fn(),
      rename: jest.fn(),
      isFile: jest.fn(),
      children: jest.fn(),
      exists: jest.fn(),
      readJson: jest.fn(),
      writeJson: jest.fn(),
      listChanges: jest.fn(),
    } as unknown as Tree;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should log an error if the executor already exists', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);

    await executorGenerator(tree, options);

    expect(logger.error).toHaveBeenCalledWith('Executor test-executor already exists');
  });

  it('should generate executor files and update executors.json if the executor does not exist', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    await executorGenerator(tree, options);

    expect(fs.existsSync).toHaveBeenCalledWith(join(__dirname, '../../executors', 'test-executor'));
    expect(logger.error).not.toHaveBeenCalled();
    expect(require('@nx/devkit').generateFiles).toHaveBeenCalled();
    expect(require('@nx/devkit').updateJson).toHaveBeenCalled();
    expect(require('@nx/devkit').formatFiles).toHaveBeenCalled();
  });

  it('should add generator to generator.json', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    await executorGenerator(tree, options);

    expect(require('@nx/devkit').updateJson).toHaveBeenCalledWith(
      tree,
      join(__dirname, '../../../executors.json').replace(tree.root, ''),
      expect.any(Function)
    );

    // Kiểm tra rằng hàm updateJson đã được gọi với hàm callback đúng
    const updateJsonCallback = (require('@nx/devkit').updateJson as jest.Mock).mock.calls[0][2];
    const json: ExecutorJson = { executors: {} };
    updateJsonCallback(json);

    expect(json.executors[options.name]).toEqual({
      implementation: `./src/executors/${options.name}/executor`,
      schema: `./src/executors/${options.name}/schema.json`,
      description: `${options.name} executor`,
    });
  });
});
