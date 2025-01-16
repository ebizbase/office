import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ versionKey: false })
export class Session {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: true, default: () => Date.now() })
  createdAt: Date;

  @Prop({ required: true })
  expiredAt: Date;

  @Prop()
  revokedAt?: Date;
}

export const InjectSessionModel = () => InjectModel(Session.name);
export type SessionModel = Model<Session>;
export type SessionDocument = HydratedDocument<Session>;
export const SessionSchema = SchemaFactory.createForClass(Session);
