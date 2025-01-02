import { Dict } from '@ebizbase/common-types';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { UserSessionDocument } from '../user-session/user-session.schema';
import { UserSessionService } from '../user-session/user-session.service';
import { UAParser } from 'ua-parser-js';
import { IAccessTokenPayload, IRefreshTokenPayload } from '@ebizbase/iam-interfaces';
import { Request } from 'express';

@Injectable()
export class AccessTokenService {
  private readonly accessTokenExpiresIn = process.env['ACCESS_TOKEN_EXPIRES'] || '1h';
  private readonly refreshTokenExpiresIn = process.env['REFRESH_TOKEN_EXPIRES'] || '7d';

  constructor(
    private readonly sessionService: UserSessionService,
    private readonly jwtService: JwtService
  ) {}

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async generateToken(userId: string, headers: Dict<string>, session?: UserSessionDocument) {
    const userAgent = headers['user-agent'];
    if (!userAgent) {
      throw new UnauthorizedException('User-Agent header is missing');
    }

    const device = UAParser(userAgent);
    const now = Date.now();
    const accessTokenExpiresAt = now + ms(this.accessTokenExpiresIn);

    const accessToken = await this.createAccessToken(userId);
    session = await this.ensureSession(userId, session, device);

    const refreshToken = await this.createRefreshToken(session.id);

    return {
      accessToken,
      accessTokenExpiresAt,
      refreshToken,
    };
  }

  private async createAccessToken(userId: string): Promise<string> {
    return this.jwtService.signAsync({ userId } as IAccessTokenPayload, {
      expiresIn: this.accessTokenExpiresIn,
    });
  }

  private async createRefreshToken(sessionId: string): Promise<string> {
    return this.jwtService.signAsync({ sessionId } as IRefreshTokenPayload, {
      expiresIn: this.refreshTokenExpiresIn,
    });
  }

  private async ensureSession(
    userId: string,
    session: UserSessionDocument | undefined,
    device: ReturnType<typeof UAParser>
  ): Promise<UserSessionDocument> {
    // TODO: get client ID
    const ip = '127.0.0.1';
    if (!session) {
      return this.sessionService.create(userId, device, ip);
    }
    return this.sessionService.update(session.id, { device, ip });
  }

  async verifyRefreshToken(token: string): Promise<IRefreshTokenPayload> {
    const payload = this.verifyToken<IRefreshTokenPayload>(token);
    if (!payload.sessionId) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }
    return payload;
  }

  async verifyAccessToken(token: string): Promise<IAccessTokenPayload> {
    const payload = this.verifyToken<IAccessTokenPayload>(token);
    if (!payload.userId) {
      throw new UnauthorizedException('Invalid access token payload');
    }
    return payload;
  }

  private verifyToken<T extends object>(token: string): T {
    try {
      return this.jwtService.verify<T>(token);
    } catch {
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
