import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto, OrderStatus } from './dto/create-order.dto.js';

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
          include: { product: true, wood: true },
        });

        const fabric = await tx.fabric.findUnique({
          where: { id: item.fabricId },
        });
        if (!variant || !fabric) {
          throw new NotFoundException('Variant or Fabric not found');
        }

        if (fabric.stock < item.quantity) {
          throw new BadRequestException('Fabric is out of stock');
        }

        if (variant.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${variant.product.name}`,
          );
        }

        const unitTotalPrice = variant.price + fabric.price;
        subtotal += unitTotalPrice * item.quantity;

        orderItemsData.push({
          productVariantId: variant.id,
          fabricId: fabric.id,
          productName: variant.product.name,
          woodName: variant.wood.name,
          fabricName: fabric.name,
          quantity: item.quantity,
          unitWoodPrice: variant.price,
          unitFabricPrice: fabric.price,
          unitTotalPrice,
        });

        await tx.productVariant.update({
          where: { id: variant.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        await tx.fabric.update({
          where: { id: fabric.id, stock: { gte: item.quantity } },
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
