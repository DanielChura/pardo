import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        order: { userId, status: 'PAID' },
        variant: { productId: dto.productId },
      },
    });

    if (!orderItem) {
      throw new ForbiddenException(
        'Only users with a PAID order containing this product can review.',
      );
    }

    return this.prisma.review.create({
      data: {
        rating: dto.rating,
        comment: dto.comment,
        userId,
        productId: dto.productId,
        images: dto.images
          ? {
              create: dto.images.map((img) => ({
                imageUrl: img.imageUrl,
                imagePublicId: img.imagePublicId,
              })),
            }
          : undefined,
      },
      include: { images: true },
    });
  }

  async getProductReviews(productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      include: { images: true, user: { select: { name: true } } },
    });
  }
}
