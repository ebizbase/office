import { formatFiles, generateFiles, Tree, updateJson } from '@nx/devkit';
import { join } from 'path';

import { LibraryGeneratorSchema } from './schema';

interface RootPackageJson {
  name: string;
  repository: string;
}

export async function libraryGenerator(tree: Tree, options: LibraryGeneratorSchema) {
  if (!/^[a-z][a-z0-9-]+$/g.test(options.name)) {
    throw new Error('Invalid library name: ' + options.name);
  }

  const rootPackageJson = getRootPackageJson(tree);
  const organization = getOrginizationName(rootPackageJson);
  const className = getClassName(options.name);
  const projectRoot = `libs/${options.name}`;

  // generate files
  generateFiles(tree, join(__dirname, 'files'), projectRoot, {
    ...options,
    organization,
    className,
    prefix: options.name,
  });

  // synchonzize repository with root package.json
  updateJson(tree, join(projectRoot, 'package.json'), (json) => {
    json.repository = rootPackageJson.repository;
    return json;
  });

  // update tsconfig.base.json paths
  updateJson(tree, 'tsconfig.base.json', (json) => {
    json.compilerOptions.paths[organization + '/' + options.name] = [`${projectRoot}/src/index.ts`];
    return json;
  });

  // format files
  await formatFiles(tree);
}

function getClassName(name: string): string {
  return name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function getOrginizationName(rootPackageJson: RootPackageJson): string {
  return rootPackageJson.name.split('/')[0];
}

function getRootPackageJson(tree: Tree): RootPackageJson {
  const packageJsonRaw = tree.read('package.json');
  if (packageJsonRaw === null) {
    throw new Error('Could not find root package.json');
  } else {
    let rootPackageJson: RootPackageJson;
    try {
      rootPackageJson = JSON.parse(packageJsonRaw.toString());
    } catch {
      throw new Error('Could not parse root package.json');
    }

    if (!rootPackageJson.name) {
      throw new Error('Root package.json is missing a name');
    } else if (!rootPackageJson.repository) {
      throw new Error('Root package.json is missing a repository');
    } else {
      return rootPackageJson;
    }
  }
}

export default libraryGenerator;
