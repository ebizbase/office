import { Global, Module } from '@nestjs/common';
import { AccessTokenService } from './access-token.service';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: () => {
        const secret = process.env['TOKEN_SECRET'];
        if (!secret) {
          throw new Error('Missing TOKEN_SECRET environment variable');
        }
        return {
          secret: process.env['TOKEN_SECRET'],
        };
      },
    }),
  ],
  providers: [AccessTokenService],
  exports: [AccessTokenService],
})
export class AccessTokenModule {}
