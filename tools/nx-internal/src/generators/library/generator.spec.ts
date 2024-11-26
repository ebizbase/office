import { Tree, updateJson, formatFiles, generateFiles } from '@nx/devkit';

import { libraryGenerator } from './generator';
import { LibraryGeneratorSchema } from './schema';

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  updateJson: jest.fn(),
  formatFiles: jest.fn(),
  generateFiles: jest.fn(),
}));

describe('libraryGenerator', () => {
  let tree: Tree;
  const options: LibraryGeneratorSchema = { name: 'test-lib' };

  beforeEach(() => {
    tree = {
      read: jest.fn().mockImplementation((filePath: string) => {
        if (filePath === 'package.json') {
          return JSON.stringify({
            name: '@org/root',
            repository: 'https://github.com/org/repo',
          });
        }
        return null;
      }),
      write: jest.fn(),
    } as unknown as Tree;
  });

  it('should generate files', async () => {
    await libraryGenerator(tree, options);

    expect(generateFiles).toHaveBeenCalledWith(
      tree,
      expect.any(String),
      'libs/test-lib',
      expect.objectContaining({ name: 'test-lib', organization: '@org' })
    );
  });

  it('should format files', async () => {
    await libraryGenerator(tree, options);
    expect(formatFiles).toHaveBeenCalledWith(tree);
  });

  it('should update package.json with repository', async () => {
    await libraryGenerator(tree, options);

    expect(updateJson).toHaveBeenCalledWith(
      tree,
      'libs/test-lib/package.json',
      expect.any(Function)
    );

    const updateJsonCallback = (updateJson as jest.Mock).mock.calls[0][2];
    const updatedPackageJson = updateJsonCallback({});

    expect(updatedPackageJson.repository).toBe('https://github.com/org/repo');
  });

  it('should update tsconfig.base.json paths', async () => {
    await libraryGenerator(tree, options);

    expect(updateJson).toHaveBeenCalledWith(tree, 'tsconfig.base.json', expect.any(Function));

    const updateJsonCallback = (updateJson as jest.Mock).mock.calls[1][2];
    const updatedTsConfig = updateJsonCallback({ compilerOptions: { paths: {} } });

    expect(updatedTsConfig.compilerOptions.paths['@org/test-lib']).toEqual([
      'libs/test-lib/src/index.ts',
    ]);
  });

  it('should throw an error if name of common library invalid', async () => {
    await expect(libraryGenerator(tree, { name: 'Invalid-name' })).rejects.toThrow(
      'Invalid library name: Invalid-name'
    );
    await expect(libraryGenerator(tree, { name: 'invalid_name' })).rejects.toThrow(
      'Invalid library name: invalid_name'
    );
  });

  it('should throw an error if root package.json is missing', async () => {
    (tree.read as jest.Mock).mockReturnValueOnce(null);

    await expect(libraryGenerator(tree, options)).rejects.toThrow(
      'Could not find root package.json'
    );
  });

  it('should throw an error if root package.json is missing name', async () => {
    (tree.read as jest.Mock).mockReturnValueOnce(
      JSON.stringify({ repository: 'https://github.com/org/repo' })
    );
    await expect(libraryGenerator(tree, options)).rejects.toThrow(
      'Root package.json is missing a name'
    );
  });

  it('should throw an error if root package.json is missing repository', async () => {
    (tree.read as jest.Mock).mockReturnValueOnce(JSON.stringify({ name: '@org/root' }));

    await expect(libraryGenerator(tree, options)).rejects.toThrow(
      'Root package.json is missing a repository'
    );
  });

  it('should log fatal error if root package.json is invalid JSON', async () => {
    (tree.read as jest.Mock).mockReturnValueOnce('invalid json');
    await expect(libraryGenerator(tree, options)).rejects.toThrow(
      'Could not parse root package.json'
    );
  });
});
