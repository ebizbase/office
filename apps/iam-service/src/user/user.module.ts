import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
