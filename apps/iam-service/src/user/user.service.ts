import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { HydratedDocument, Model } from 'mongoose';
import speakeasy from 'speakeasy';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async exist(email: string) {
    return this.userModel.findOne({ email }) === undefined;
  }

  async findByEmail(email: string): Promise<HydratedDocument<User>> {
    return this.userModel.findOne({ email });
  }

  async findById(userId: string): Promise<HydratedDocument<User>> {
    return this.userModel.findById(userId);
  }

  create(
    user: Partial<Omit<User, 'secret' | 'email'>> & Pick<User, 'email'>
  ): Promise<HydratedDocument<User>> {
    try {
      const secret = speakeasy.generateSecret({ length: 32 });
      const newUser: User = { ...user, secret, registedAt: new Date(), hotpCounter: 1 };
      this.logger.debug({ msg: 'Creating user', user: newUser });
      return this.userModel.create(newUser);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  update(userId: string, user: Partial<User>): Promise<HydratedDocument<User>> {
    this.logger.debug({ msg: 'Updating user', userId, data: user });
    return this.userModel.findByIdAndUpdate(userId, user, { new: true });
  }
}
