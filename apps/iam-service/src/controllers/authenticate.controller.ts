import { Dict, IRestfulResponse } from '@ebizbase/common-types';
import { Controller, Logger, Get, HttpCode, Query, Post, Body, Headers } from '@nestjs/common';
import { ILoginRequest } from '@ebizbase/iam-interfaces';
import { AuthenticateService } from '../services/authenticate.service';

@Controller('authenticate')
export class AuthenticateController {
  private logger = new Logger(AuthenticateController.name);

  constructor(private authenticateService: AuthenticateService) {}

  @Get('')
  @HttpCode(200)
  async identify(@Query('email') email: string): Promise<IRestfulResponse> {
    this.logger.debug({ msg: 'Getting identity', email });
    return this.authenticateService.identify(email);
  }

  @Post('')
  @HttpCode(200)
  async verify(
    @Body() data: ILoginRequest,
    @Headers() headers: Dict<string>
  ): Promise<IRestfulResponse> {
    this.logger.debug({ msg: 'Verify identity', data });
    return this.authenticateService.verify(data, headers);
  }
}
