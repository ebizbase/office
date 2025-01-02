import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { IResult } from 'ua-parser-js';

@Schema({ versionKey: false, timestamps: true })
export class UserSession {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  ip: string;

  @Prop({ type: Object, required: true })
  device: IResult;

  @Prop({ required: true })
  createdAt: Date;
}

export const InjectUserSessionModel = () => InjectModel(UserSession.name);
export type SessionModel = Model<UserSession>;
export type UserSessionDocument = HydratedDocument<UserSession>;
export const UserSessionSchema = SchemaFactory.createForClass(UserSession);
