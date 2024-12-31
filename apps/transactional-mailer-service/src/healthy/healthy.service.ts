import { MongoService } from '@ebizbase/nestjs-mongo';
import { RabbitService } from '@ebizbase/nestjs-rabbit';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthyService {
  constructor(
    private mongo: MongoService,
    private rabbit: RabbitService
  ) {}

  async healthCheck() {
    const isMongoConnectionUp = await this.mongo.isConnectionUp();
    const rabbitConnectionUp = await this.rabbit.isConnectionUp();
    return {
      liveness: true,
      readiness: isMongoConnectionUp && rabbitConnectionUp,
      dependencies: {
        mongodb: rabbitConnectionUp ? 'up' : 'down',
        rabbitmq: rabbitConnectionUp ? 'up' : 'down',
      },
    };
  }
}
