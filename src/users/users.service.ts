import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from 'src/generated/prisma/client.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
  }

  update(id: string, userData: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: {
        id: id,
      },
      data: userData,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({
      where: {
        id: id,
      },
    });
  }
}
