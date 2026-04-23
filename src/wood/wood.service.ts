import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateWoodDto } from './dto/create-wood.dto.js';
import { UpdateWoodDto } from './dto/update-wood.dto.js';

@Injectable()
export class WoodService {
  constructor(private prisma: PrismaService) {}

  async create(createWoodDto: CreateWoodDto) {
    return this.prisma.wood.create({
      data: createWoodDto,
    });
  }

  async findAll() {
    // Traemos todas las maderas (activas y no activas para el admin)
    return this.prisma.wood.findMany();
  }

  async findActive() {
    // Para que el cliente elija en el frontend
    return this.prisma.wood.findMany({ where: { isActive: true } });
  }

  async findOne(id: string) {
    const wood = await this.prisma.wood.findUnique({ where: { id } });
    if (!wood) throw new NotFoundException(`Wood with ID ${id} not found`);
    return wood;
  }

  async update(id: string, updateWoodDto: UpdateWoodDto) {
    await this.findOne(id);
    return this.prisma.wood.update({
      where: { id },
      data: updateWoodDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    // Soft delete
    return this.prisma.wood.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
