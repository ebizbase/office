import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthyService } from './healthy.service';

@Controller('healthy')
export class HealthyController {
  constructor(private healthy: HealthyService) {}

  @Get('liveness')
  async liveness(): Promise<object> {
    return this.healthy.healthCheck();
  }

  @Get('readiness')
  async readiness(): Promise<object> {
    const healthy = await this.healthy.healthCheck();
    if (healthy.readiness) {
      return healthy;
    } else {
      throw new ServiceUnavailableException(healthy);
    }
  }
}
