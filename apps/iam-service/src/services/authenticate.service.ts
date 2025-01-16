import { Dict, IRestfulResponse } from '@ebizbase/common-types';
import { ILoginRequest, ILoginResponseData } from '@ebizbase/iam-interfaces';
import { ITransactionalMail } from '@ebizbase/mail-interfaces';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import speakeasy from 'speakeasy';
import { HOTP } from '../schemas/hotp';
import { InjectSessionModel, SessionModel } from '../schemas/session.schema';
import { InjectUserModel, UserModel } from '../schemas/user.schema';

@Injectable()
export class AuthenticateService {
  private readonly logger = new Logger(AuthenticateService.name);
  private readonly ACCESS_TOKEN_EXPIRES_IN = process.env['ACCESS_TOKEN_EXPIRES_IN'] || '15m';
  private readonly REFRESH_TOKEN_EXPIRES_IN = process.env['REFRESH_TOKEN_EXPIRES_IN'] || '7d';
  private readonly OTP_EXPIRES_IN = parseInt(process.env['OTP_EXPIRES_IN']) || 10 * 60 * 1000;

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly jwtService: JwtService,
    @InjectSessionModel() private sessionModel: SessionModel,
    @InjectUserModel() private userModel: UserModel
  ) { }

  async identify(email: string): Promise<IRestfulResponse> {
    this.logger.debug({ msg: 'Identify', email });
    let user = await this.userModel.findOne({ email });
    if (!user) {
      user = await this.userModel.create({ email });
    } else {
      user = await this.userModel.findOneAndUpdate(
        { _id: user._id },
        {
          $inc: { 'hotp.counter': 1 },
          $set: { 'hotp.used': false },
          $currentDate: { 'hotp.lastIssueAt': true },
        },
        {
          new: true,
        }
      );
    }
    const { secret, counter } = user.hotp;
    const otp = speakeasy.hotp({ secret, counter });
    await this.sendOtpEmail(user.email, otp);
    return {
      data: { firstName: user.firstName, lastName: user.lastName },
    };
  }

  async verify(
    { email, otp }: ILoginRequest,
    headers: Dict<string>
  ): Promise<IRestfulResponse<ILoginResponseData>> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      this.logger.debug(`User with email ${email} not found`);
      throw new BadRequestException({
        message: 'Incorrect email',
      });
    }
    if (!(await this.verifyHOTP(user.hotp, otp))) {
      this.logger.debug(`Invalid OTP for user with email ${email}`);
      throw new BadRequestException({
        message: 'Invalid OTP or expired',
      });
    }
    return { data: await this.issueNewToken(user.id, headers) };
  }

  async verifyHOTP({ secret, counter, issueAt }: HOTP, token: string): Promise<boolean> {
    this.logger.debug({ msg: 'Verifying HOTP', secret, counter, token, issueAt });

    if (!speakeasy.hotp.verify({ secret, counter, token })) {
      this.logger.debug('otp is invalid');
      return false;
    }

    if (new Date().getTime() - issueAt.getTime() > this.OTP_EXPIRES_IN) {
      this.logger.debug('otp expired');
      return false;
    }

    return true;
  }

  private async issueNewToken(userId: string, headers: Dict<string>) {
    const userAgent = headers['user-agent'];
    const ipAddress = headers['x-forwarded-for'] || headers['cf-connecting-ip'];

    if (!userAgent) {
      throw new UnauthorizedException('User-Agent header is missing');
    } else if (!ipAddress) {
      this.logger.error({ msg: 'Can not extract user remote ip from headers', headers });
      throw new InternalServerErrorException('Can not get user remote ip');
    }

    const now = Date.now();
    const accessTokenExpiresAt = now + ms(this.ACCESS_TOKEN_EXPIRES_IN);
    const refreshTokenExpiresAt = now + ms(this.REFRESH_TOKEN_EXPIRES_IN);

    const session = await this.sessionModel.create({
      userId,
      userAgent,
      ipAddress,
      expiredAt: new Date(refreshTokenExpiresAt),
    });
    const accessToken = await this.jwtService.signAsync(
      { userId },
      { expiresIn: this.ACCESS_TOKEN_EXPIRES_IN }
    );
    const refreshToken = await this.jwtService.signAsync(
      { sessionId: session.id },
      { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN }
    );

    return {
      accessToken,
      accessTokenExpiresAt,
      refreshToken,
      refreshTokenExpiresAt,
    };
  }

  async sendOtpEmail(email: string, otp: string) {
    const transactionalMail: ITransactionalMail = {
      event: 'account-otp',
      to: email,
      data: { otp },
    };
    await this.amqpConnection.publish(
      'transactional_mail_exchange',
      'send',
      Buffer.from(JSON.stringify(transactionalMail))
    );
  }
}
