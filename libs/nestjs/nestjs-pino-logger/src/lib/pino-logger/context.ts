export class Context {
  constructor(public context?: string) {}

  merge(childContext: string): Context {
    return new Context(`${this.context ? `${this.context}:` : ''}${childContext}`);
  }
}
