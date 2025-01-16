import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { TOTP } from './totp';
import { HOTP } from './hotp';

@Schema({ versionKey: false, timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ type: HOTP, default: () => new HOTP() })
  hotp: HOTP;

  @Prop({ type: TOTP })
  totp?: TOTP;
}

export const InjectUserModel = () => InjectModel(User.name);
export type UserModel = Model<User>;
export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
