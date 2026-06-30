import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async add(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      await this.remove(userId, productId);
      return { success: true, message: 'Product removed from favorites' };
    }

    return this.prisma.favorite.create({
      data: { userId, productId },
      include: {
        product: { include: { variants: { include: { wood: true } } } },
      },
    });
  }

  async remove(userId: string, productId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!existing) {
      throw new NotFoundException('Favorite not found');
    }

    return this.prisma.favorite.delete({
      where: { userId_productId: { userId, productId } },
    });
  }

  findAll(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        product: { include: { variants: { include: { wood: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
