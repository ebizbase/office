import { ITransactionalMail } from '@ebizbase/mail-interfaces';
import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ICredential, ILoginResponse, IOnBoardRequest } from '@ebizbase/iam-interfaces';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { IAccessTokenPayload } from './access-token-payload.interface';
import { IRefreshTokenPayload } from './refresh-token-payload.interface copy';
import { Dict } from '@ebizbase/common-types';
import { User } from '../user/user.schema';
import speakeasy from 'speakeasy';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class AuthenticateService {
  private readonly logger = new Logger(AuthenticateService.name);

  constructor(
    private readonly userService: UserService,
    private readonly amqpConnection: AmqpConnection,
    private jwtService: JwtService
  ) {}

  async register(email: string) {
    let user = await this.userService.findByEmail(email);
    if (user && user.onboardedAt) {
      throw new BadRequestException({
        message: 'Account already exist',
        details: { email: 'Email already exist' },
      });
    } else if (user && !user.onboardedAt) {
      user = await this.userService.update(user.id, { hotpCounter: user.hotpCounter + 1 });
    } else if (!user) {
      user = await this.userService.create({ email });
    }

    const otp = this.generateHOTP(user);
    console.log('OTP:', otp);
    const transactionalMail: ITransactionalMail = {
      event: 'account-otp',
      to: user.email,
      data: { otp },
    };
    await this.amqpConnection.publish(
      'transactional_mail_exchange',
      'send',
      Buffer.from(JSON.stringify(transactionalMail))
    );
  }

  async login({ email, otp }: ICredential): Promise<ILoginResponse> {
    let user = await this.userService.findByEmail(email);
    if (!user) {
      this.logger.debug(`User with email ${email} not found`);
      throw new UnauthorizedException({
        message: 'Incorrect login information',
        details: { email: 'Email does not exist' },
      });
    }
    if (!this.verifyHTOP(user, otp)) {
      this.logger.debug(`Invalid OTP for user with email ${email}`);
      throw new UnauthorizedException({
        message: 'Incorrect login information',
        details: { otp: 'Invalid OTP or expired' },
      });
    }

    user = await this.userService.update(user.id, { hotpCounter: user.hotpCounter + 1 });

    const tokenExpiresIn = process.env['ACCESS_TOKEN_EXPIRES'] || '1h';
    const refressTokenExpiresIn = process.env['REFRESH_TOKEN_EXPIRES'] || '7d';

    const accessToken = await this.jwtService.signAsync(
      { userId: user.id } as IAccessTokenPayload,
      { expiresIn: tokenExpiresIn }
    );

    const refreshToken = await this.jwtService.signAsync(
      { userId: user.id } as IRefreshTokenPayload,
      { expiresIn: refressTokenExpiresIn }
    );

    return {
      userId: user.id,
      email: user.email,
      accessTokenExpiresAt: Date.now() + ms(tokenExpiresIn),
      accessToken,
      refreshToken,
    };
  }

  async onboard(data: IOnBoardRequest, headers: Dict<string>): Promise<User> {
    const accesssToken = this.getTokenFromHeader(headers);

    let payload: IAccessTokenPayload;
    try {
      payload = this.verifyAccessToken(accesssToken);
    } catch {
      throw new UnauthorizedException();
    }

    let user = await this.userService.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    user = await this.userService.update(user.id, { ...data, onboardedAt: new Date() });
    return user;
  }

  async getCurrentUser(headers: Dict<string>): Promise<User> {
    const accesssToken = this.getTokenFromHeader(headers);
    let payload: IAccessTokenPayload;
    try {
      payload = this.verifyAccessToken(accesssToken);
    } catch {
      throw new UnauthorizedException();
    }
    return this.userService.findById(payload.userId);
  }

  async refresh(headers: Dict<string>): Promise<ILoginResponse> {
    const accesssToken = this.getTokenFromHeader(headers);
    let payload: IRefreshTokenPayload;
    try {
      payload = this.verifyRefreshToken(accesssToken);
    } catch {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findById(payload.userId);
    const tokenExpiresIn = process.env['ACCESS_TOKEN_EXPIRES'] || '1h';
    const refressTokenExpiresIn = process.env['REFRESH_TOKEN_EXPIRES'] || '7d';

    const accessToken = await this.jwtService.signAsync(
      { userId: user.id } as IAccessTokenPayload,
      { expiresIn: tokenExpiresIn }
    );

    const refreshToken = await this.jwtService.signAsync(
      { userId: user.id } as IRefreshTokenPayload,
      { expiresIn: refressTokenExpiresIn }
    );

    return {
      userId: user.id,
      email: user.email,
      accessTokenExpiresAt: Date.now() + ms(tokenExpiresIn),
      accessToken,
      refreshToken,
    };
  }

  private verifyAccessToken(token: string): IAccessTokenPayload {
    return this.jwtService.verify<IAccessTokenPayload>(token);
  }

  private verifyRefreshToken(token: string): IRefreshTokenPayload {
    return this.jwtService.verify<IRefreshTokenPayload>(token);
  }

  private getTokenFromHeader(headers: Dict<string>): string {
    const authorization = headers['authorization'];
    if (!authorization) {
      throw new UnauthorizedException();
    }
    const parts = authorization.split(' ');
    if (parts.length !== 2) {
      throw new UnauthorizedException();
    }
    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
      throw new UnauthorizedException();
    }
    return token;
  }

  private generateHOTP(user: User): string {
    return speakeasy.hotp({
      secret: user.secret.base32,
      counter: user.hotpCounter,
    });
  }

  private verifyHTOP(user: User, token: string): boolean {
    return speakeasy.hotp.verify({
      secret: user.secret.base32,
      counter: user.hotpCounter,
      token,
    });
  }
}
