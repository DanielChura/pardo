import { Injectable } from '@nestjs/common';
import { CreateFavoriteDto } from './favorites.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteFavorite(userId: string, dto: CreateFavoriteDto) {
    return this.prisma.favorite.delete({
      where: { userId_productId: { userId, productId: dto.productId } },
    });
  }
  async createFavorite(userId: string, dto: CreateFavoriteDto) {
    return this.prisma.favorite.create({
      data: { userId, productId: dto.productId },
    });
  }
  async findMyFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: { product: true },
    });
  }
}
