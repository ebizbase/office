import { formatFiles, generateFiles, Tree, logger, updateJson } from '@nx/devkit';
import * as path from 'path';
import { existsSync } from 'fs';

import { GeneratorGeneratorSchema } from './schema';

function isValidName(name: string): boolean {
  const nameRegex = /^[a-z]+$/;
  return nameRegex.test(name);
}

function generatorExists(generatorRoot: string): boolean {
  return existsSync(generatorRoot);
}

function addGeneratorToJson(tree: Tree, options: GeneratorGeneratorSchema) {
  updateJson(
    tree,
    path.join(__dirname, '../../../generators.json').replace(tree.root, ''),
    (json) => {
      json['generators'][options.name] = {
        factory: `./src/generators/${options.name}/generator`,
        schema: `./src/generators/${options.name}/schema.json`,
        description: `${options.name} generator`,
      };
      return json;
    }
  );
}

export async function generatorGenerator(tree: Tree, options: GeneratorGeneratorSchema) {
  const generatorRoot = path.join(__dirname, '..', options.name);

  if (!isValidName(options.name)) {
    logger.error(
      `Generator name "${options.name}" is invalid. It must contain only lowercase letters.`
    );
    return;
  } else if (generatorExists(generatorRoot)) {
    logger.error(`Generator ${options.name} already exists`);
    return;
  }

  generateFiles(tree, path.join(__dirname, 'files'), generatorRoot.replace(tree.root, ''), options);
  addGeneratorToJson(tree, options);

  await formatFiles(tree);
}

export default generatorGenerator;
