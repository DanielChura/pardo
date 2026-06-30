import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto, CreateOrderItemDto } from './dto/create-order.dto.js';
import { Order, OrderStatus } from '../generated/prisma/client.js';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData: CreateOrderItemDto[] = [];

      for (const item of dto.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.productVariantId },
          include: {
            product: { select: { name: true } },
            color: { select: { name: true } },
          },
        });
        if (!variant) throw new NotFoundException('Variant not found');

        if (variant.stock < item.quantity) {
          throw new BadRequestException('Insufficient stock');
        }

        const displayText = `${variant.color.name} | ${variant.size} | ${variant.dimensions}`;

        const unitPrice = variant.price;
        subtotal += unitPrice * item.quantity;

        orderItemsData.push({
          productVariantId: variant.id,
          productName: variant.product.name,
          variantDisplayText: displayText,
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

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) throw new NotFoundException('Order not found');

      if (
        status === OrderStatus.CANCELLED &&
        order.status !== OrderStatus.CANCELLED
      ) {
        const orderItems = await tx.orderItem.findMany({
          where: { orderId },
        });

        for (const item of orderItems) {
          if (!item.productVariantId) continue;

          await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return await tx.order.update({
        where: { id: orderId },
        data: { status },
      });
    });
  }
}
