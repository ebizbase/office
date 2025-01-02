import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSessionService } from './user-session.service';
import { UserSession, UserSessionSchema } from './user-session.schema';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: UserSession.name, schema: UserSessionSchema }])],
  providers: [UserSessionService],
  exports: [UserSessionService],
})
export class UserSessionModule {}
