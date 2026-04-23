import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma, Fabric } from '../generated/prisma/client.js';

@Injectable()
export class FabricService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.FabricCreateInput): Promise<Fabric> {
    return this.prisma.fabric.create({ data });
  }

  async findAll(): Promise<Fabric[]> {
    return this.prisma.fabric.findMany();
  }

  async findActive(): Promise<Fabric[]> {
    return this.prisma.fabric.findMany({ where: { isActive: true } });
  }

  async findOne(id: string): Promise<Fabric> {
    const fabric = await this.prisma.fabric.findUnique({ where: { id } });
    if (!fabric) throw new NotFoundException(`Fabric with ID ${id} not found`);
    return fabric;
  }

  async update(id: string, data: Prisma.FabricUpdateInput): Promise<Fabric> {
    await this.findOne(id);
    return this.prisma.fabric.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Fabric> {
    await this.findOne(id);
    // Soft delete
    return this.prisma.fabric.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
