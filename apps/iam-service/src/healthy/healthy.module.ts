import { Module } from '@nestjs/common';
import { HealthyService } from './healthy.service';
import { HealthyController } from './healthy.controller';

@Module({
  controllers: [HealthyController],
  providers: [HealthyService],
})
export class HealthyModule {}
