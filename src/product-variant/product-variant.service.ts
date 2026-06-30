import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProductVariant } from '../generated/prisma/client.js';
import { CreateProductVariantDto } from './dto/create-product-variant.dto.js';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto.js';

@Injectable()
export class ProductVariantService {
  constructor(private prisma: PrismaService) {}

  private readonly variantInclude = {
    product: { select: { id: true, name: true, categoryId: true } },
    color: true,
  };

  async create(data: CreateProductVariantDto): Promise<ProductVariant> {
    return this.prisma.productVariant.create({
      data,
    });
  }

  async findAll(): Promise<ProductVariant[]> {
    return this.prisma.productVariant.findMany({
      include: this.variantInclude,
    });
  }

  async update(
    id: string,
    data: UpdateProductVariantDto,
  ): Promise<ProductVariant> {
    await this.findOne(id);
    return this.prisma.productVariant.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<ProductVariant> {
    await this.findOne(id);
    return this.prisma.productVariant.delete({ where: { id } });
  }

  async findOne(id: string): Promise<ProductVariant> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: this.variantInclude,
    });
    if (!variant)
      throw new NotFoundException(`Variant with ID ${id} not found`);
    return variant;
  }
}
