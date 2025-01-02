import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import {
  IAccessTokenPayload,
  ILoginRequest,
  ILoginResponse,
  IRefreshRequest,
  IRegisterRequest,
} from '@ebizbase/iam-interfaces';
import speakeasy from 'speakeasy';
import { Dict } from '@ebizbase/common-types';
import { UserSessionService } from '../user-session/user-session.service';
import { HOTP } from '../user/hotp';
import { AccessTokenService } from '../access-token/access-token.service';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class AuthenticateService {
  private readonly logger = new Logger(AuthenticateService.name);

  constructor(
    private readonly userService: UserService,
    private readonly accessTokenService: AccessTokenService,
    private readonly sessionService: UserSessionService,
    private readonly mailerService: MailerService
  ) {}

  async register(userInfo: IRegisterRequest) {
    this.logger.debug({ msg: 'Registering user', userInfo });
    let user = await this.userService.findByEmail(userInfo.email);

    if (user && user.activedAt) {
      throw new BadRequestException({
        message: 'Account already exist',
        details: { email: 'Email already exist' },
      });
    }

    let otp: string;
    if (!user) {
      try {
        user = await this.userService.create({
          ...userInfo,
          hotp: new HOTP(),
          createdAt: new Date(),
        });
        otp = speakeasy.hotp(user.hotp);
      } catch (err) {
        this.logger.error({ msg: 'Error creating user', err });
      }
    } else {
      try {
        otp = await this.userService.generateHOTP(user);
      } catch (err) {
        this.logger.error({ msg: 'Error updating user hotp counter', err });
      }
    }

    await this.mailerService.sendOtp(user.email, otp);
  }

  async sendNewOtp({ userId }: IAccessTokenPayload): Promise<void> {
    try {
      const user = await this.userService.findById(userId);
      const otp = await this.userService.generateHOTP(user);
      await this.mailerService.sendOtp(user.email, otp);
    } catch (err) {
      this.logger.error({ msg: 'Error when creating and sending otp', err });
    }
  }

  async login({ email, otp }: ILoginRequest, headers: Dict<string>): Promise<ILoginResponse> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      this.logger.debug(`User with email ${email} not found`);
      throw new UnauthorizedException({
        message: 'Incorrect login information',
        details: { email: 'Email does not exist' },
      });
    }

    if (!(await this.userService.verifyHOTP(user, otp))) {
      this.logger.debug(`Invalid OTP for user with email ${email}`);
      throw new UnauthorizedException({
        message: 'Incorrect login information',
        details: { otp: 'Invalid OTP or expired' },
      });
    }

    const { accessToken, refreshToken, accessTokenExpiresAt } =
      await this.accessTokenService.generateToken(user.id, headers);

    return {
      accessTokenExpiresAt,
      accessToken,
      refreshToken,
    };
  }

  async refresh({ token }: IRefreshRequest, headers: Dict<string>): Promise<ILoginResponse> {
    const { sessionId } = await this.accessTokenService.verifyRefreshToken(token);
    const session = await this.sessionService.findById(sessionId);

    if (!session) {
      throw new UnauthorizedException();
    }

    const { accessToken, refreshToken, accessTokenExpiresAt } =
      await this.accessTokenService.generateToken(session.userId, headers, session);
    return {
      accessTokenExpiresAt,
      accessToken,
      refreshToken,
    };
  }
}
