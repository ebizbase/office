import { Injectable } from '@nestjs/common';
import { IResult } from 'ua-parser-js';
import {
  InjectUserSessionModel,
  SessionModel,
  UserSession,
  UserSessionDocument,
} from './user-session.schema';

@Injectable()
export class UserSessionService {
  constructor(@InjectUserSessionModel() private sessionModel: SessionModel) {}

  async create(userId: string, device: IResult, ip: string): Promise<UserSessionDocument> {
    return this.sessionModel.create({ userId, device, ip, createdAt: new Date() });
  }

  async findById(sessionId: string): Promise<UserSessionDocument> {
    return this.sessionModel.findById(sessionId);
  }

  async update(sessionId: string, session: Partial<UserSession>): Promise<UserSessionDocument> {
    return this.sessionModel.findByIdAndUpdate(sessionId, session, { new: true });
  }
}
