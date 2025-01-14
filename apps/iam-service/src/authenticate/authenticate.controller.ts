import { Body, Controller, HttpCode, Logger, Post, Headers } from '@nestjs/common';
import { AuthenticateService } from './authenticate.service';
import {
  ILoginRequest,
  ILoginResponse,
  IRefreshRequest,
  IRegisterRequest,
} from '@ebizbase/iam-interfaces';
import { Dict } from '@ebizbase/common-types';

@Controller('authenticate')
export class AuthenticateController {
  private logger = new Logger(AuthenticateController.name);

  constructor(private authenticateService: AuthenticateService) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() userInfo: IRegisterRequest): Promise<void> {
    this.logger.debug({ msg: 'Registering request', userInfo });
    await this.authenticateService.register(userInfo);
  }

  @Post('sign-in')
  @HttpCode(200)
  async signIn(
    @Body() credential: ILoginRequest,
    @Headers() headers: Dict<string>
  ): Promise<ILoginResponse> {
    this.logger.debug({ msg: 'Signing in', credential });
    return this.authenticateService.signIn(credential, headers);
  }

  @Post('refresh')
  @HttpCode(200)
  async refreshToken(
    @Body() refreshTokenData: IRefreshRequest,
    @Headers() headers: Dict<string>
  ): Promise<ILoginResponse> {
    this.logger.debug({ msg: 'Refresing access token', refreshTokenData });
    return await this.authenticateService.refresh(refreshTokenData, headers);
  }
}
