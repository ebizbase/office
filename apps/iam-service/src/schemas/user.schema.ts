import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import speakeasy from 'speakeasy';

@Schema({ versionKey: false, timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ default: () => speakeasy.generateSecret().base32 })
  otpSecret: string;

  @Prop({ default: 0 })
  otpCounter: number;

  @Prop({ default: false })
  otpUsed: boolean;

  @Prop({ default: () => new Date() })
  otpIssuedAt: Date;
}

export const InjectUserModel = () => InjectModel(User.name);
export type UserModel = Model<User>;
export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
