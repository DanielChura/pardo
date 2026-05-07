import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma, ProductVariant } from '../generated/prisma/client.js';

@Injectable()
export class ProductVariantService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ProductVariantCreateInput): Promise<ProductVariant> {
    try {
      return await this.prisma.productVariant.create({
        data,
        include: { product: true, wood: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('This product already has a variant with this wood.');
      }
      throw error;
    }
  }

  findAll(): Promise<ProductVariant[]> {
    return this.prisma.productVariant.findMany({
      include: {
        product: { select: { name: true } },
        wood: { select: { name: true } },
      },
    });
  }

  async findOne(id: string): Promise<ProductVariant> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: { product: true, wood: true },
    });
    if (!variant) throw new NotFoundException(`Variant with ID ${id} not found`);
    return variant;
  }

  async update(id: string, data: Prisma.ProductVariantUpdateInput): Promise<ProductVariant> {
    await this.findOne(id);
    return this.prisma.productVariant.update({ where: { id }, data, include: { product: true, wood: true } });
  }

  async remove(id: string): Promise<ProductVariant> {
    await this.findOne(id);
    return this.prisma.productVariant.delete({ where: { id } });
  }
}
