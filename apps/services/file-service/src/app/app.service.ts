import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): { message: string } {
    Logger.log('getData()', 'AppService');
    return { message: 'Hello API' };
  }
}
