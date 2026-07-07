import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import * as bcrypt from 'bcrypt';
import { UpdateUserDTO } from './dto/updateUserDTO.js';
import { bcryptAdapter } from '../auth/bcrypt.adapter.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput) {
    const exists = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (exists) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: { ...data, password: hashedPassword },
    });
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const result = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        favorites: true,
      },
    });

    if (!result) {
      throw new NotFoundException('User not exists');
    }
    return result;
  }

  async update(id: string, userData: UpdateUserDTO) {
    if (userData.password) {
      userData.password = await bcryptAdapter.hash(userData.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: userData,
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        favorites: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
