import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from './users.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { bcryptAdapter } from '../auth/bcrypt.adapter.js';

describe('UserService', () => {
  let prisma: jest.Mocked<PrismaService>;
  let usersService: UsersService;

  const mockPrisma = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeAll(async () => {
    const userModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    usersService = userModule.get(UsersService);
    prisma = userModule.get(PrismaService);
  });
  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const user: Prisma.UserCreateInput = {
      email: 'dan@gmail.com',
      password: 'dan123456',
    };

    const response = {
      id: 'user-123',
      name: 'dani',
      email: 'dan@gmail.com',
      password: 'dan123456',
      role: 'USER',
    };

    it('should create a user', async () => {
      mockPrisma.user.create.mockResolvedValue(response);
      const result = await usersService.create(user);

      expect(result.email).toEqual('dan@gmail.com');
    });

    it('should throw error if email exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(response);

      const result = usersService.create(user);
      expect(result).rejects.toThrow(BadRequestException);
    });

    it('should throw error if user not exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = usersService.findOne('user-123');
      expect(result).rejects.toThrow(NotFoundException);
    });

    it('should return a unique user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(response);

      const result = usersService.findOne('user-123');
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    const response = {
      id: 'user-123',
      name: 'dani',
      email: 'dan@gmail.com',
      password: 'dan123456',
      role: 'USER',
    };

    it('should update user', async () => {
      mockPrisma.user.update.mockResolvedValue(response);
      jest.spyOn(usersService, 'update');
      jest.spyOn(bcryptAdapter, 'hash').mockReturnValue('newPassHashed-123');

      const result = await usersService.update('user-123', {
        name: 'dani',
        password: 'hashdani123456',
      });

      expect(result.id).toBe('user-123');
      expect(result.name).toBe('dani');

      expect(usersService.update).toHaveBeenCalledWith('user-123', {
        name: 'dani',
        password: 'newPassHashed-123',
      });
      expect(bcryptAdapter.hash).toHaveBeenCalledWith('hashdani123456', 10);
    });
  });

  describe('findAll', () => {
    it('should return a response', async () => {
      const response = [
        {
          id: 'user-123',
          name: 'dani',
          email: 'dan@gmail.com',
          password: 'dan123456',
          role: 'USER',
        },
      ];
      mockPrisma.user.findMany.mockResolvedValue(response);
      const result = await usersService.findAll();
      expect(result[0].email).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const deletedUser = {
        id: 'user-123',
        name: 'dani',
        email: 'dan@gmail.com',
        password: 'dan123456',
        role: 'USER',
      };
      mockPrisma.user.delete.mockResolvedValue(deletedUser as any);

      const result = await usersService.remove('user-123');
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toEqual(deletedUser);
    });
  });
});
