import { Context } from './context';

describe('Context', () => {
  it('should create an instance with no context', () => {
    const context = new Context();
    expect(context.context).toBeUndefined();
  });

  it('should create an instance with a context', () => {
    const context = new Context('parent');
    expect(context.context).toBe('parent');
  });

  it('should merge contexts correctly when parent context is undefined', () => {
    const context = new Context();
    const mergedContext = context.merge('child');
    expect(mergedContext.context).toBe('child');
  });

  it('should merge contexts correctly when parent context is defined', () => {
    const context = new Context('parent');
    const mergedContext = context.merge('child');
    expect(mergedContext.context).toBe('parent:child');
  });

  it('should merge contexts correctly with multiple levels', () => {
    const context = new Context('grandparent');
    const parentContext = context.merge('parent');
    const childContext = parentContext.merge('child');
    expect(childContext.context).toBe('grandparent:parent:child');
  });
});
