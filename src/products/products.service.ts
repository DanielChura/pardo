import { Injectable } from '@nestjs/common';
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
    return this.prisma.product.findMany();
  }

  findOne(id: string) {
    return this.prisma.product.findUniqueOrThrow({ where: { id } });
  }

  async create(data: Prisma.ProductCreateInput) {
    return await this.prisma.product.create({ data });
  }

  update(id: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUniqueOrThrow({
      where: { id },
    });
    if (product.imagePublicId) {
      await this.cloudinaryService.deleteFile(product.imagePublicId);
    }
    return this.prisma.product.delete({ where: { id } });
  }
}
