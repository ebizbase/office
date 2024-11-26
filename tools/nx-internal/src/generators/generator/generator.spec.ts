import { Tree, logger } from '@nx/devkit';
import * as path from 'path';
import { existsSync } from 'fs';

import { generatorGenerator } from './generator';
import { GeneratorGeneratorSchema } from './schema';

interface Generator {
  factory: string;
  schema: string;
  description: string;
}

interface GeneratorJson {
  generators: {
    [key: string]: Generator;
  };
}

jest.mock('fs', () => ({
  existsSync: jest.fn(),
}));

jest.mock('@nx/devkit', () => ({
  formatFiles: jest.fn(),
  generateFiles: jest.fn(),
  logger: {
    error: jest.fn(),
  },
  updateJson: jest.fn(),
}));

describe('generatorGenerator', () => {
  let tree: Tree;
  const options: GeneratorGeneratorSchema = { name: 'testgenerator' };

  beforeEach(() => {
    tree = {
      root: '/root',
    } as Tree;
    jest.clearAllMocks();
  });

  it('should log an error if the generator name is invalid', async () => {
    await generatorGenerator(tree, { name: 'invalid-name' });

    expect(logger.error).toHaveBeenCalledWith(
      'Generator name "invalid-name" is invalid. It must contain only lowercase letters.'
    );
  });

  it('should log an error if the generator already exists', async () => {
    (existsSync as jest.Mock).mockReturnValue(true);

    await generatorGenerator(tree, options);

    expect(logger.error).toHaveBeenCalledWith('Generator testgenerator already exists');
  });

  it('should generate files and update JSON if the generator name is valid and does not exist', async () => {
    (existsSync as jest.Mock).mockReturnValue(false);

    await generatorGenerator(tree, options);

    expect(logger.error).not.toHaveBeenCalled();
    expect(require('@nx/devkit').generateFiles).toHaveBeenCalledWith(
      tree,
      path.join(__dirname, 'files'),
      path.join(__dirname, '..', options.name).replace(tree.root, ''),
      options
    );
    expect(require('@nx/devkit').updateJson).toHaveBeenCalled();
    expect(require('@nx/devkit').formatFiles).toHaveBeenCalledWith(tree);
  });

  it('should add generator to generator.json', async () => {
    (existsSync as jest.Mock).mockReturnValue(false);

    await generatorGenerator(tree, options);

    expect(require('@nx/devkit').updateJson).toHaveBeenCalledWith(
      tree,
      path.join(__dirname, '../../../generators.json').replace(tree.root, ''),
      expect.any(Function)
    );

    const updateJsonCallback = (require('@nx/devkit').updateJson as jest.Mock).mock.calls[0][2];
    const json: GeneratorJson = { generators: {} };
    updateJsonCallback(json);

    expect(json.generators[options.name]).toEqual({
      factory: `./src/generators/${options.name}/generator`,
      schema: `./src/generators/${options.name}/schema.json`,
      description: `${options.name} generator`,
    });
  });
});
