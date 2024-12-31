import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from 'pino';

import { PinoLoggerService } from './pino-logger.service';
import { Config } from './config';

jest.mock('./config');

describe('PinoLoggerService', () => {
  describe('On override nest application logger ', () => {
    it('should successs override core logger of nestjs on default flatform (express)', async () => {
      const pinoMock = {
        info: jest.fn().mockImplementation(() => {}),
      };
      const logger = new PinoLoggerService('nestjs');
      logger['logger'] = pinoMock as unknown as Logger;
      const app = (await Test.createTestingModule({}).compile()).createNestApplication({ logger });
      await app.init();
      expect(pinoMock.info).toHaveBeenCalledTimes(1);
      expect(pinoMock.info).toHaveBeenCalledWith(
        { context: 'nestjs:NestApplication' },
        'Nest application successfully started'
      );
    });
  });

  describe('On inject module', () => {
    let service: PinoLoggerService;
    let mockLogger: any;
    let originalProcessEnv: any;

    beforeEach(async () => {
      originalProcessEnv = process.env;
      mockLogger = {
        trace: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn(),
      };

      Config.getLogger = jest.fn().mockReturnValue(mockLogger);
      Config.getDebugContextConfig = jest.fn().mockReturnValue('*');
      Config.getTraceContextConfig = jest.fn().mockReturnValue('*');

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: PinoLoggerService,
            useValue: new PinoLoggerService('app'),
          },
        ],
      }).compile();

      service = module.get<PinoLoggerService>(PinoLoggerService);
    });

    afterEach(() => {
      jest.clearAllMocks();
      process.env = originalProcessEnv;
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should log info level messages', () => {
      service.info('info message');
      expect(mockLogger.info).toHaveBeenCalledWith({ context: 'app' }, 'info message');
    });

    it('should log info level messages with messsage in object', () => {
      service.info({ messsage: 'info message' });
      expect(mockLogger.info).toHaveBeenCalledWith({ context: 'app', messsage: 'info message' });
    });

    it('should log info level messages with child logger', () => {
      const childLogger = service.child('childContext');
      childLogger.info({ messsage: 'info message' });
      expect(mockLogger.info).toHaveBeenCalledWith({
        context: 'app:childContext',
        messsage: 'info message',
      });
    });

    it('should log warn level messages', () => {
      service.warn('warn message');
      expect(mockLogger.warn).toHaveBeenCalledWith({ context: 'app' }, 'warn message');
    });

    it('should log error level messages', () => {
      service.error('error message');
      expect(mockLogger.error).toHaveBeenCalledWith({ context: 'app' }, 'error message');
    });

    it('should log fatal level messages', () => {
      service.fatal('fatal message');
      expect(mockLogger.fatal).toHaveBeenCalledWith({ context: 'app' }, 'fatal message');
    });

    it('should log trace level messages', () => {
      Config.getTraceContextConfig = jest.fn().mockReturnValue('*');
      service.trace('trace message');
      expect(mockLogger.trace).toHaveBeenCalledWith({ context: 'app' }, 'trace message');
    });

    it('should not log trace level messages when not set trace config enviroment', () => {
      Config.getTraceContextConfig = jest.fn().mockReturnValue(undefined);
      service.trace('trace message');
      expect(mockLogger.trace).not.toHaveBeenCalled();
    });

    it('should log debug level messages', () => {
      Config.getDebugContextConfig = jest.fn().mockReturnValue('*');
      service.debug('debug message');
      expect(mockLogger.debug).toHaveBeenCalledWith({ context: 'app' }, 'debug message');
    });

    it('should not log debug level messages when not set debug config enviroment', () => {
      Config.getDebugContextConfig = jest.fn().mockReturnValue(undefined);
      service.debug('debug message');
      expect(mockLogger.debug).not.toHaveBeenCalled();
    });

    it('should create child logger with merged context', () => {
      const childLogger = service.child('childContext');
      expect(childLogger).toBeInstanceOf(PinoLoggerService);
      expect(childLogger['parrentContext'].context).toContain('childContext');
    });

    it('should handle error objects correctly', () => {
      const error = new Error('test error');
      service.error(error);
      expect(mockLogger.error).toHaveBeenCalledWith({ context: 'app', err: error });
    });

    it('should handle wrong exception handler contract', () => {
      const error = new Error('test error');
      service.error(error.message, error.stack);
      expect(mockLogger.error).toHaveBeenCalledWith({
        err: error,
        context: 'app',
      });
    });
    it('should not log debug messages if debug is disabled', () => {
      Config.getDebugContextConfig = jest.fn().mockReturnValue('');
      expect(mockLogger.debug).not.toHaveBeenCalled();
    });

    it('should not log trace messages if trace is disabled', () => {
      Config.getTraceContextConfig = jest.fn().mockReturnValue('');
      expect(mockLogger.trace).not.toHaveBeenCalled();
    });
  });
});
