import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UAParser } from 'ua-parser-js';
import { AccessTokenService } from './access-token.service';
import { UserSessionService } from '../user-session/user-session.service';
import { UserSessionDocument } from '../user-session/user-session.schema';
import { Request } from 'express';

jest.mock('ua-parser-js');

describe('AccessTokenService', () => {
  let service: AccessTokenService;
  let jwtService: JwtService;
  let sessionService: UserSessionService;

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  const mockSessionService = {
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessTokenService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserSessionService, useValue: mockSessionService },
      ],
    }).compile();

    service = module.get<AccessTokenService>(AccessTokenService);
    jwtService = module.get<JwtService>(JwtService);
    sessionService = module.get<UserSessionService>(UserSessionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should throw UnauthorizedException if user-agent is missing', async () => {
      await expect(service.generateToken('user-id', {} as any)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should generate tokens and create a new session if session does not exist', async () => {
      const mockHeaders = { 'user-agent': 'mock-user-agent' };
      const mockDevice = { browser: 'mock-browser' };
      const mockSession = { id: 'session-id' } as UserSessionDocument;
      const mockAccessToken = 'access-token';
      const mockRefreshToken = 'refresh-token';

      (UAParser as unknown as jest.Mock).mockReturnValue(mockDevice);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce(mockAccessToken)
        .mockResolvedValueOnce(mockRefreshToken);
      jest.spyOn(sessionService, 'create').mockResolvedValue(mockSession);

      const result = await service.generateToken('user-id', mockHeaders);

      expect(UAParser).toHaveBeenCalledWith(mockHeaders['user-agent']);
      expect(sessionService.create).toHaveBeenCalledWith('user-id', mockDevice, '127.0.0.1');
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: mockAccessToken,
        accessTokenExpiresAt: expect.any(Number),
        refreshToken: mockRefreshToken,
      });
    });
  });

  describe('verifyRefreshToken', () => {
    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error();
      });

      await expect(service.verifyRefreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException if sessionId is missing in token payload', async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({} as any);

      await expect(service.verifyRefreshToken('valid-token')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should return payload if token is valid', async () => {
      const payload = { sessionId: 'session-id' };
      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);

      const result = await service.verifyRefreshToken('valid-token');

      expect(result).toEqual(payload);
    });
  });

  describe('verifyAccessToken', () => {
    it('should throw UnauthorizedException if access token is invalid', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error();
      });

      await expect(service.verifyAccessToken('invalid-token')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException if userId is missing in token payload', async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({} as any);

      await expect(service.verifyAccessToken('valid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should return payload if token is valid', async () => {
      const payload = { userId: 'user-id' };
      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);

      const result = await service.verifyAccessToken('valid-token');

      expect(result).toEqual(payload);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should return undefined if authorization header is not present', () => {
      const mockRequest = { headers: {} } as Request;
      const result = service.extractTokenFromHeader(mockRequest);
      expect(result).toBeUndefined();
    });

    it('should return undefined if authorization header does not contain a Bearer token', () => {
      const mockRequest = {
        headers: { authorization: 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=' },
      } as Request;
      const result = service.extractTokenFromHeader(mockRequest);
      expect(result).toBeUndefined();
    });

    it('should return the token if authorization header contains a Bearer token', () => {
      const mockToken = 'mock-token';
      const mockRequest = { headers: { authorization: `Bearer ${mockToken}` } } as Request;
      const result = service.extractTokenFromHeader(mockRequest);
      expect(result).toBe(mockToken);
    });

    it('should return undefined if authorization header is empty', () => {
      const mockRequest = { headers: { authorization: '' } } as Request;
      const result = service.extractTokenFromHeader(mockRequest);
      expect(result).toBeUndefined();
    });

    it('should handle malformed authorization header gracefully', () => {
      const mockRequest = { headers: { authorization: 'MalformedHeader' } } as Request;
      const result = service.extractTokenFromHeader(mockRequest);
      expect(result).toBeUndefined();
    });
  });
});
