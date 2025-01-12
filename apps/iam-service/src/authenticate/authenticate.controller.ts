import {
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  Headers,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticateService } from './authenticate.service';
import {
  IAccessTokenPayload,
  ILoginRequest,
  ILoginResponse,
  IRefreshRequest,
  IRegisterRequest,
} from '@ebizbase/iam-interfaces';
import { Dict } from '@ebizbase/common-types';
import { AccessTokenGuard } from '../access-token/access-token.guard';

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
  async login(
    @Body() credential: ILoginRequest,
    @Headers() headers: Dict<string>
  ): Promise<ILoginResponse> {
    this.logger.debug({ msg: 'Signing in', credential });
    return this.authenticateService.login(credential, headers);
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

  @Get('otp')
  @HttpCode(200)
  @UseGuards(AccessTokenGuard)
  async sendNewOtp(
    @Req() { accessTokenPayload }: { accessTokenPayload: IAccessTokenPayload }
  ): Promise<void> {
    this.logger.debug({ msg: 'Refresing access token', accessTokenPayload });
    return this.authenticateService.sendNewOtp(accessTokenPayload);
  }
}
