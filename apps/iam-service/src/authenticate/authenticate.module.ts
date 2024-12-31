import { Module } from '@nestjs/common';
import { AuthenticateController } from './authenticate.controller';
import { AuthenticateService } from './authenticate.service';

@Module({
  controllers: [AuthenticateController],
  providers: [AuthenticateService],
})
export class AuthenticateModule {}
