import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';
import { Test } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { UsersModule } from '../users/users.module.js';
import { bcryptAdapter } from './bcrypt.adapter.js';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockJwt = {
    sign: jest.fn(),
  };

  const mockPrisma = {
    user: { findUnique: jest.fn() },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [UsersModule],
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: JwtService,
          useValue: mockJwt,
        },
      ],
    }).compile();
    authService = module.get(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('login', () => {
    const loginDto = { email: 'asd@asd', password: 'asd123' };

    it('should return tokens for valid credentials', async () => {
      const hashedPassword = await bcryptAdapter.hash('asd123', 10);
      const userId = crypto.randomUUID();
      const user = {
        userId,
        email: 'asd@asd',
        password: hashedPassword,
        role: 'USER',
      };

      mockPrisma.user.findUnique.mockReturnValue(user);
      mockJwt.sign.mockReturnValue('acc-token');
      jest.spyOn(crypto, 'randomUUID').mockReturnValue('ref-uuid' as any);
      jest.spyOn(bcryptAdapter, 'compare').mockReturnValue(true as any);
      mockPrisma.refreshToken.create.mockReturnValue({});

      const result = await authService.login(loginDto);
      expect(result.accessToken).toEqual('acc-token');
      expect(result.refreshToken).toEqual('ref-uuid');
    });

    it('shold throw on password invalid', () => {
      const badDto = { email: 'asd@asd', password: 'badpass123' };
      const user = {
        userId: 'id123',
        email: 'asd@asd',
        password: 'asd123',
        role: 'USER',
      };

      mockPrisma.user.findUnique.mockReturnValue(user);
      jest.spyOn(bcryptAdapter, 'compare').mockReturnValue(false as any);

      expect(authService.login(badDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw on expired refresh token', async () => {
      const expiredDate = new Date();
      expiredDate.setFullYear(expiredDate.getFullYear() - 1);

      mockPrisma.refreshToken.findUnique.mockReturnValue({
        id: '123',
        userId: '321',
        token: 'old-token',
        expiresAt: expiredDate,
      });

      await expect(authService.refresh('old-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw on token invalid', async () => {
      mockPrisma.refreshToken.findUnique.mockReturnValue(null);
      const result = authService.refresh('false-token');

      await expect(result).rejects.toThrow(UnauthorizedException);
    });
  });
});
