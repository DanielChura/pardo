import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderStatus } from '../generated/prisma/client.js';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData: any[] = [];

      for (const item of dto.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.productVariantId },
          include: { product: { select: { name: true } } },
        });
        if (!variant) throw new NotFoundException('Variant not found');

        if (variant.stock < item.quantity) {
          throw new BadRequestException('Insufficient stock');
        }

        let materialName: string | null = null;
        if (item.materialId) {
          const material = await tx.material.findUnique({
            where: { id: item.materialId },
          });
          if (!material) throw new NotFoundException('Material not found');
          materialName = material.name;
        }

        const unitPrice = variant.price;
        subtotal += unitPrice * item.quantity;

        orderItemsData.push({
          productVariantId: variant.id,
          materialId: item.materialId ?? null,
          productName: variant.product.name,
          variantDisplayText: variant.displayText,
          variantAttributes: variant.attributes,
          materialName,
          quantity: item.quantity,
          unitPrice,
        });

        await tx.productVariant.update({
          where: { id: variant.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          userId,
          subtotal,
          total: subtotal,
          items: { create: orderItemsData },
        },
        include: { items: true },
      });
    });
  }

  findOne(userId: string, id: string) {
    return this.prisma.order.findUniqueOrThrow({
      where: { id: id, userId: userId },
      include: { items: true },
    });
  }

  findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    return await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}
