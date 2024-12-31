import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GeneratedSecret } from 'speakeasy';

@Schema()
export class UserSecret implements GeneratedSecret {
  @Prop()
  ascii: string;

  @Prop()
  hex: string;

  @Prop()
  base32: string;

  @Prop()
  google_auth_qr: string;

  @Prop()
  otpauth_url?: string;
}
export const UserSecretSchema = SchemaFactory.createForClass(UserSecret);

@Schema({ versionKey: false })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: UserSecretSchema })
  secret: UserSecret;

  @Prop({ type: String })
  firstName?: string;

  @Prop({ type: String })
  midleName?: string;

  @Prop({ type: String })
  lastName?: string;

  @Prop({ type: Date })
  registedAt: Date;

  @Prop({ type: Date })
  onboardedAt?: Date;

  @Prop({ type: Number, default: 1 })
  hotpCounter: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
