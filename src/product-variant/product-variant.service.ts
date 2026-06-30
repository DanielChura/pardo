import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma, ProductVariant } from '../generated/prisma/client.js';

@Injectable()
export class ProductVariantService {
  constructor(private prisma: PrismaService) {}

  private readonly variantInclude = {
    product: { select: { id: true, name: true, categoryId: true } },
  };

  async create(data: Prisma.ProductVariantCreateInput): Promise<ProductVariant> {
    return this.prisma.productVariant.create({
      data,
      include: this.variantInclude,
    });
  }

  findAll(): Promise<ProductVariant[]> {
    return this.prisma.productVariant.findMany({
      include: this.variantInclude,
    });
  }

  async findOne(id: string): Promise<ProductVariant> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: this.variantInclude,
    });
    if (!variant) throw new NotFoundException(`Variant with ID ${id} not found`);
    return variant;
  }

  async update(id: string, data: Prisma.ProductVariantUpdateInput): Promise<ProductVariant> {
    await this.findOne(id);
    return this.prisma.productVariant.update({
      where: { id },
      data,
      include: this.variantInclude,
    });
  }

  async remove(id: string): Promise<ProductVariant> {
    await this.findOne(id);
    return this.prisma.productVariant.delete({ where: { id } });
  }
}
