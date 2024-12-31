import { Body, Controller, HttpCode, Logger, Post, Headers, Get } from '@nestjs/common';
import { AuthenticateService } from './authenticate.service';
import { ILoginResponse, IOnBoardRequest } from '@ebizbase/iam-interfaces';
import { Dict } from '@ebizbase/common-types';
import { User } from '../user/user.schema';

@Controller('authenticate')
export class AuthenticateController {
  private logger = new Logger(AuthenticateController.name);

  constructor(private authenticateService: AuthenticateService) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body('email') email: string): Promise<void> {
    this.logger.debug({ msg: 'Registering request', email });
    await this.authenticateService.register(email);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body('email') email: string, @Body('otp') otp: string): Promise<ILoginResponse> {
    this.logger.debug({ msg: 'Loging', email, otp });
    return this.authenticateService.login({ email, otp });
  }

  @Post('onboard')
  @HttpCode(201)
  async onboard(@Body() data: IOnBoardRequest, @Headers() headers: Dict<string>): Promise<User> {
    this.logger.debug({ msg: 'Onboarding', data });
    return this.authenticateService.onboard(data, headers);
  }

  @Get('me')
  @HttpCode(200)
  async me(@Headers() headers: Dict<string>): Promise<User> {
    this.logger.debug({ msg: 'Getting current user information', headers });
    return this.authenticateService.getCurrentUser(headers);
  }
}
