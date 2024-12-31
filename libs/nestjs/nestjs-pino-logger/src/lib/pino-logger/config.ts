import pino, { Logger } from 'pino';
import { Optional } from '@ebizbase/common-types';

export type LogFormat = 'json' | 'text';

export class Config {
  private static debugContextConfig: Optional<string>;
  private static traceContextConfig: Optional<string>;
  private static formatConfig: LogFormat;
  private static logger?: Logger;

  public static getLogger() {
    if (!Config.logger) {
      const stream = Config.getLogFormatConfig() === 'text' ? Config.getPrettyStream() : undefined;
      const logger = pino({ level: 'trace' }, stream);
      Config.logger = logger;
    }
    return Config.logger;
  }

  public static getLogFormatConfig(): LogFormat {
    if (!Config.formatConfig) {
      Config.formatConfig = (process.env['LOG_FORMAT'] as LogFormat) || 'json';
      if (Config.formatConfig !== 'json' && Config.formatConfig !== 'text') {
        throw new Error(`Invalid log format: ${Config.formatConfig}. Use 'json' or 'text'`);
      }
    }
    return Config.formatConfig;
  }

  public static getDebugContextConfig(): Optional<string> {
    if (!Config.debugContextConfig) {
      Config.debugContextConfig = process.env['LOG_DEBUG'];
    }
    return Config.debugContextConfig;
  }

  public static getTraceContextConfig(): Optional<string> {
    if (!Config.traceContextConfig) {
      Config.traceContextConfig = process.env['LOG_TRACE'];
    }
    return Config.traceContextConfig;
  }

  private static getPrettyStream() {
    return require('pino-pretty')({
      sync: true,
      colorize: true,
      ignore: 'pid,hostname,context',
      messageFormat: '[{pid}] [{context}] {msg}',
    });
  }
}
