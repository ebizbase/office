import { formatFiles, generateFiles, logger, Tree, updateJson } from '@nx/devkit';
import * as path from 'path';
import { existsSync } from 'fs';

import { executorGeneratorSchema } from './schema';

export async function executorGenerator(tree: Tree, options: executorGeneratorSchema) {
  const generatorRoot = getGeneratorRoot(options.name);

  if (existsSync(generatorRoot)) {
    logger.error(`Executor ${options.name} already exists`);
  } else {
    generateExecutorFiles(tree, generatorRoot, {
      ...options,
      className: getClassName(options.name),
    });
    updateExecutorsJson(tree, options);
    await formatFiles(tree);
  }
}

function getGeneratorRoot(name: string): string {
  return path.join(__dirname, '../../executors', name);
}

function getClassName(name: string): string {
  return name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function generateExecutorFiles(
  tree: Tree,
  generatorRoot: string,
  options: executorGeneratorSchema & { className: string }
): void {
  generateFiles(tree, path.join(__dirname, 'files'), generatorRoot.replace(tree.root, ''), options);
}

function updateExecutorsJson(tree: Tree, options: executorGeneratorSchema): void {
  const executorsJsonPath = path.join(__dirname, '../../../executors.json').replace(tree.root, '');
  updateJson(tree, executorsJsonPath, (json) => {
    json['executors'][options.name] = {
      implementation: `./src/executors/${options.name}/executor`,
      schema: `./src/executors/${options.name}/schema.json`,
      description: `${options.name} executor`,
    };
    return json;
  });
}

export default executorGenerator;
