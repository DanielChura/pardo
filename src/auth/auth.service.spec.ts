import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let usersService: UsersService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-access-token'),
  };

  const mockUsersService = {
    create: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'none@x.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@x.com',
        password: '$2b$10$hashed',
        role: 'USER',
      });

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'test@x.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens on valid credentials', async () => {
      const fakeUser = {
        id: '1',
        email: 'test@x.com',
        password: '$2b$10$hashed',
        role: 'USER',
      };

      mockPrisma.user.findUnique.mockResolvedValue(fakeUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockPrisma.refreshToken.create.mockResolvedValue({ token: 'mock-rt' });

      const result = await service.login({
        email: 'test@x.com',
        password: 'correct',
      });

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-rt',
      });
    });
  });

  describe('register', () => {
    it('should delegate to UsersService.create', async () => {
      const dto = { email: 'new@x.com', password: 'pass123' };
      mockUsersService.create.mockResolvedValue({ id: '2', email: 'new@x.com' });

      const result = await service.register(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: '2', email: 'new@x.com' });
    });
  });

  describe('refresh', () => {
    it('should throw if refresh token not found', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refresh('invalid')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw if refresh token expired', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt1',
        token: 'expired-token',
        userId: 'u1',
        expiresAt: new Date('2020-01-01'),
      });

      await expect(service.refresh('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should rotate tokens on valid refresh', async () => {
      const future = new Date(Date.now() + 86400000);
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt1',
        token: 'valid-rt',
        userId: 'u1',
        expiresAt: future,
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'test@x.com',
        role: 'USER',
      });
      mockPrisma.refreshToken.delete.mockResolvedValue({});
      mockPrisma.refreshToken.create.mockResolvedValue({ token: 'new-rt' });

      const result = await service.refresh('valid-rt');

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('new-rt');
    });
  });
});
