import { Injectable, LoggerService } from '@nestjs/common';
import { Level } from 'pino';

import { Context } from './context';
import { Config } from './config';
import { isNamespaceEnabled } from './ultis';

@Injectable()
export class PinoLoggerService implements LoggerService {
  public logger = Config.getLogger();
  private parrentContext: Context;

  constructor(context?: string) {
    this.parrentContext = new Context(context);
  }

  child(childContext: string): PinoLoggerService {
    return new PinoLoggerService(this.parrentContext.merge(childContext).context);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private call(level: Level, message: any, ...optionalParams: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const objArg: Record<string, any> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let params: any[] = [];

    if (this.isWrongExceptionsHandlerContract(level, message, optionalParams)) {
      objArg['err'] = new Error(message);
      objArg['err'].stack = params[0];
      objArg['context'] = this.parrentContext.context;
      this.logger[level](objArg);
      return;
    }

    // optionalParams contains extra params passed to logger
    // context name is the last item (this is convention in nestjs logger)
    if (
      optionalParams.length !== 0 &&
      typeof optionalParams[optionalParams.length - 1] === 'string'
    ) {
      objArg['context'] = this.parrentContext.merge(
        optionalParams[optionalParams.length - 1]
      ).context;
      params = optionalParams.slice(0, -1);
    } else {
      objArg['context'] = this.parrentContext.context;
    }

    if (level === 'debug' && !this.shouldDebug(objArg['context'])) {
      return;
    } else if (level === 'trace' && !this.shouldTrace(objArg['context'])) {
      return;
    }

    if (typeof message === 'object') {
      if (message instanceof Error) {
        objArg['err'] = message;
      } else {
        Object.assign(objArg, message);
      }
      this.logger[level](objArg, ...params);
    } else {
      this.logger[level](objArg, message, ...params);
    }
  }

  shouldDebug(context: string): boolean {
    const debugConfig = Config.getDebugContextConfig();
    if (!debugConfig) {
      return false;
    }
    return isNamespaceEnabled(debugConfig, context);
  }

  shouldTrace(context: string): boolean {
    const traceConfig = Config.getTraceContextConfig();
    if (!traceConfig) {
      return false;
    }
    return isNamespaceEnabled(traceConfig, context);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trace(message: any, ...optionalParams: any[]) {
    this.call('trace', message, ...optionalParams);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(message: any, ...optionalParams: any[]) {
    this.call('debug', message, ...optionalParams);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(message: any, ...optionalParams: any[]) {
    this.call('info', message, ...optionalParams);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(message: any, ...optionalParams: any[]) {
    this.call('info', message, ...optionalParams);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(message: any, ...optionalParams: any[]) {
    this.call('warn', message, ...optionalParams);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(message: any, ...optionalParams: any[]) {
    this.call('error', message, ...optionalParams);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fatal(message: any, ...optionalParams: any[]) {
    this.call('fatal', message, ...optionalParams);
  }

  /**
   * Unfortunately built-in (not only) `^.*Exception(s?)Handler$` classes call `.error`
   * method with not supported contract:
   *
   * - ExceptionsHandler
   * @param level
   * @param message
   * @param params
   * @see https://github.com/nestjs/nest/blob/35baf7a077bb972469097c5fea2f184b7babadfc/packages/core/exceptions/base-exception-filter.ts#L60-L63
   *
   * - ExceptionHandler
   * @see https://github.com/nestjs/nest/blob/99ee3fd99341bcddfa408d1604050a9571b19bc9/packages/core/errors/exception-handler.ts#L9
   *
   * - WsExceptionsHandler
   * @see https://github.com/nestjs/nest/blob/9d0551ff25c5085703bcebfa7ff3b6952869e794/packages/websockets/exceptions/base-ws-exception-filter.ts#L47-L50
   *
   * - RpcExceptionsHandler @see https://github.com/nestjs/nest/blob/9d0551ff25c5085703bcebfa7ff3b6952869e794/packages/microservices/exceptions/base-rpc-exception-filter.ts#L26-L30
   *
   * - all of them
   * @see https://github.com/search?l=TypeScript&q=org%3Anestjs+logger+error+stack&type=Code
   */

  private isWrongExceptionsHandlerContract(
    level: Level,
    message: unknown,
    params: unknown[]
  ): params is [string] {
    return (
      (level === 'error' || level === 'fatal') &&
      typeof message === 'string' &&
      params.length === 1 &&
      typeof params[0] === 'string' &&
      /\n\s*at /.test(params[0])
    );
  }
}
