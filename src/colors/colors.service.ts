import { Injectable } from '@nestjs/common';
import { CreateColorDto } from './dto/CreateColorDto.js';
import { UpdateColorDto } from './dto/UpdateColorDto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ColorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.color.findMany();
  }

  async createColor(dto: CreateColorDto) {
    return this.prisma.color.create({
      data: dto,
    });
  }

  async updateColor(id: string, dto: UpdateColorDto) {
    return await this.prisma.color.update({
      where: { id },
      data: dto,
    });
  }
}
