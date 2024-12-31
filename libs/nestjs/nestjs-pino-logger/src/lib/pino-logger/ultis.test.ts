import { isNamespaceEnabled } from './ultis';

describe('isNamespaceEnabled', () => {
  const testCases = [
    {
      config: undefined,
      context: 'test',
      expected: false,
      description: 'should return false if config is undefined',
    },
    {
      config: '',
      context: 'test',
      expected: false,
      description: 'should return false if config is empty',
    },
    {
      config: 'test',
      context: 'test',
      expected: true,
      description: 'should return true if context is in the config',
    },
    {
      config: 'test',
      context: 'notTest',
      expected: false,
      description: 'should return false if context is not in the config',
    },
    {
      config: '!test',
      context: 'test',
      expected: false,
      description: 'should return false if context is excluded by a negated namespace',
    },
    {
      config: '!test',
      context: 'notTest',
      expected: true,
      description: 'should return true if context is not excluded by a negated namespace',
    },
    {
      config: 'test1,test2',
      context: 'test1',
      expected: true,
      description: 'should handle multiple namespaces correctly (test1)',
    },
    {
      config: 'test1,test2',
      context: 'test2',
      expected: true,
      description: 'should handle multiple namespaces correctly (test2)',
    },
    {
      config: 'test1,test2',
      context: 'test3',
      expected: false,
      description: 'should handle multiple namespaces correctly (test3)',
    },
    {
      config: 'test1,!test2',
      context: 'test1',
      expected: true,
      description: 'should handle multiple namespaces with negations correctly (test1)',
    },
    {
      config: 'test1,!test2',
      context: 'test2',
      expected: false,
      description: 'should handle multiple namespaces with negations correctly (test2)',
    },
    {
      config: 'test1,!test2',
      context: 'test3',
      expected: true,
      description: 'should handle multiple namespaces with negations correctly (test3)',
    },
    {
      config: 'test*',
      context: 'test123',
      expected: true,
      description: 'should match with wildcard (test*)',
    },
    {
      config: 'test*',
      context: 'testing',
      expected: true,
      description: 'should match with wildcard (test*)',
    },
    {
      config: '*est',
      context: 'test',
      expected: true,
      description: 'should match with wildcard (*est)',
    },
    {
      config: '*est',
      context: 'best',
      expected: true,
      description: 'should match with wildcard (*est)',
    },
    {
      config: '!test*',
      context: 'test123',
      expected: false,
      description: 'should exclude with negated wildcard (!test*)',
    },
    {
      config: 't*st',
      context: 'test',
      expected: true,
      description: 'should match with wildcard (t*st)',
    },
  ];

  testCases.forEach(({ config, context, expected, description }) => {
    it(description, () => {
      expect(isNamespaceEnabled(config, context)).toBe(expected);
    });
  });
});
