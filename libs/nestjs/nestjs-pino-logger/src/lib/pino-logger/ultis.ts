import { Optional } from '@ebizbase/common-types';

export function isNamespaceEnabled(config: Optional<string>, context: string): boolean {
  if (!config) {
    return false;
  }
  const namespaces = config.split(',').map((ns) => ns.trim());
  return namespaces.some((ns) => {
    if (ns.startsWith('!')) {
      return ns.slice(1) !== context && !matchesWildcard(ns.slice(1), context);
    }
    return ns === context || matchesWildcard(ns, context);
  });
}

function matchesWildcard(namespace: string, context: string): boolean {
  if (namespace.includes('*')) {
    const regexString = namespace.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexString}$`);
    return regex.test(context);
  }
  return false;
}
