import { Config } from './config';

describe('Config', () => {
  beforeEach(() => {
    // Reset the static properties before each test
    (Config as any).debugContextConfig = undefined;
    (Config as any).traceContextConfig = undefined;
    (Config as any).formatConfig = undefined;
    (Config as any).logger = undefined;
  });

  describe('getLogger', () => {
    it('should return a pino logger instance', () => {
      const logger = Config.getLogger();
      expect(logger).toBeDefined();
      expect(logger).toHaveProperty('info');
      expect(logger).toHaveProperty('error');
    });

    it('should return the same logger instance on subsequent calls', () => {
      const logger1 = Config.getLogger();
      const logger2 = Config.getLogger();
      expect(logger1).toBe(logger2);
    });

    it('should use pretty stream when log format is text', () => {
      process.env['LOG_FORMAT'] = 'text';
      const logger = Config.getLogger();
      expect(logger).toBeDefined();
      delete process.env['LOG_FORMAT'];
    });
  });

  describe('getLogFormatConfig', () => {
    it('should return json as default log format', () => {
      const format = Config.getLogFormatConfig();
      expect(format).toBe('json');
    });

    it('should return the log format from environment variable', () => {
      process.env['LOG_FORMAT'] = 'text';
      const format = Config.getLogFormatConfig();
      expect(format).toBe('text');
      delete process.env['LOG_FORMAT'];
    });

    it('should throw an error for invalid log format', () => {
      process.env['LOG_FORMAT'] = 'invalid';
      expect(() => Config.getLogFormatConfig()).toThrowError(
        "Invalid log format: invalid. Use 'json' or 'text'"
      );
      delete process.env['LOG_FORMAT'];
    });
  });

  describe('getDebugContextConfig', () => {
    it('should return undefined if LOG_DEBUG is not set', () => {
      const debugContext = Config.getDebugContextConfig();
      expect(debugContext).toBeUndefined();
    });

    it('should return the debug context from environment variable', () => {
      process.env['LOG_DEBUG'] = 'debugContext';
      const debugContext = Config.getDebugContextConfig();
      expect(debugContext).toBe('debugContext');
      delete process.env['LOG_DEBUG'];
    });
  });

  describe('getTraceContextConfig', () => {
    it('should return undefined if LOG_TRACE is not set', () => {
      const traceContext = Config.getTraceContextConfig();
      expect(traceContext).toBeUndefined();
    });

    it('should return the trace context from environment variable', () => {
      process.env['LOG_TRACE'] = 'traceContext';
      const traceContext = Config.getTraceContextConfig();
      expect(traceContext).toBe('traceContext');
      delete process.env['LOG_TRACE'];
    });
  });
});
