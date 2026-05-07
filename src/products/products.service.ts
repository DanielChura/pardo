import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  findAll() {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: { variants: { include: { wood: true } } },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          where: { stock: { gt: 0 } },
          include: { wood: true },
        },
      },
    });

    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  create(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data });
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data: { isActive: false } });
  }
}
