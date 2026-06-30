import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.MaterialCreateInput) {
    return this.prisma.material.create({ data });
  }

  findAll() {
    return this.prisma.material.findMany({ orderBy: { name: 'asc' } });
  }

  findActive() {
    return this.prisma.material.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const material = await this.prisma.material.findUnique({ where: { id } });
    if (!material) throw new NotFoundException(`Material with ID ${id} not found`);
    return material;
  }

  async update(id: string, data: Prisma.MaterialUpdateInput) {
    await this.findOne(id);
    return this.prisma.material.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.material.update({ where: { id }, data: { isActive: false } });
  }
}
