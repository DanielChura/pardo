import { Injectable } from '@nestjs/common';
import { CreateColorDto } from './dto/CreateColorDto.js';
import { UpdateColorDto } from './dto/UpdateColorDto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaginationDto, toPagination } from '../common/dto/pagination.dto.js';

@Injectable()
export class ColorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await Promise.all([
      this.prisma.color.findMany({ skip, take: limit }),
      this.prisma.color.count(),
    ]);
    return toPagination(data, totalItems, limit, page);
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
