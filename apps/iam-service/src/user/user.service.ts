import { Injectable, Logger } from '@nestjs/common';
import { InjectUserModel, User, UserDocument, UserModel } from './user.schema';
import speakeasy from 'speakeasy';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(@InjectUserModel() private userModel: UserModel) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async findById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId);
  }

  async create(user: User): Promise<UserDocument> {
    this.logger.debug({ msg: 'Creating user', user });
    try {
      return this.userModel.create(user);
    } catch (err) {
      this.logger.error({ msg: 'Error creating user', err });
      throw err;
    }
  }

  async update(userId: string, user: Partial<User>): Promise<UserDocument> {
    this.logger.debug({ msg: 'Updating user', userId, data: user });
    return this.userModel.findByIdAndUpdate(userId, user, { new: true });
  }

  async verifyHOTP(user: UserDocument, token: string): Promise<boolean> {
    this.logger.debug({ msg: 'Verifying HOTP', user, token });

    const validOtp = speakeasy.hotp.verify({
      secret: user.hotp.secret,
      counter: user.hotp.counter,
      token,
    });

    if (!validOtp) {
      this.logger.debug('otp is invalid');
      return false;
    }

    const expired = new Date().getTime() - user.hotp.lastIssueAt.getTime() > 10 * 60 * 1000; // 10 minutes

    if (expired) {
      this.logger.debug('otp expired');
      return false;
    }

    return true;
  }

  async generateHOTP(user: UserDocument): Promise<string> {
    this.logger.debug({ msg: 'Generating HOTP', user });

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: user._id },
      {
        $inc: { 'hotp.counter': 1 },
        $set: { 'hotp.used': false },
        $currentDate: { 'hotp.lastIssueAt': true },
      },
      { new: true }
    );

    const otp = speakeasy.hotp({
      secret: updatedUser.hotp.secret,
      counter: updatedUser.hotp.counter,
    });
    this.logger.debug({ msg: 'Generated HOTP', updatedUser, otp });
    return otp;
  }
}
