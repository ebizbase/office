import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { HOTP } from './hotp';
import { TOTP } from './totp';

@Schema({ versionKey: false })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop()
  middleName?: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop()
  activedAt?: Date;

  @Prop({ type: HOTP })
  hotp: HOTP;

  @Prop({ type: TOTP })
  totp?: TOTP;
}

export const InjectUserModel = () => InjectModel(User.name);
export type UserModel = Model<User>;
export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
