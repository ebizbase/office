import { Global, Module } from '@nestjs/common';
import { AuthenticateController } from './authenticate.controller';
import { AuthenticateService } from './authenticate.service';

@Global()
@Module({
  controllers: [AuthenticateController],
  providers: [AuthenticateService],
  exports: [AuthenticateService],
})
export class AuthenticateModule {}
