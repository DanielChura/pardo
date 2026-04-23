import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    const { userId, items } = dto;

    // 1. Iniciamos una transacción para que todo sea atómico
    return await this.prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData: any[] = [];

      for (const item of items) {
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

        // 2. Validar Stock ANTES de procesar
        if (variant.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${variant.product.name}`,
          );
        }

        const unitTotalPrice = variant.price + fabric.price;
        subtotal += unitTotalPrice * item.quantity;

        // 3. Preparar el Snapshot
        orderItemsData.push({
          productVariantId: variant.id,
          fabricId: fabric.id,
          productName: variant.product.name,
          woodName: variant.wood.name,
          fabricName: fabric.name,
          quantity: item.quantity,
          unitWoodPrice: variant.price,
          unitFabricPrice: fabric.price,
          unitTotalPrice: unitTotalPrice,
        });

        // 4. Descontar Stock dentro de la transacción
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: { decrement: item.quantity } },
        });

        // Si el Fabric también tiene stock, descontarlo aquí
        await tx.fabric.update({
          where: { id: fabric.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 5. Crear la orden (Si algo falló antes, nada de lo anterior se guarda)
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

  async findOne(id: string) {
    return this.prisma.order.findUniqueOrThrow({
      where: { id },
      include: { items: true },
    });
  }

  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
