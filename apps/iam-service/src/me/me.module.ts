import { Global, Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { MeService } from './me.service';

@Global()
@Module({
  controllers: [MeController],
  providers: [MeService],
  exports: [MeService],
})
export class MeModule {}
