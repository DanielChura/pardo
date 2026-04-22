import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

interface OrderItemInput {
  productId: string;
  quantity: number;
  attributeValueIds: string[];
}

interface CreateOrderInput {
  userId: string;
  items: OrderItemInput[];
  notes?: string;
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // Obtener todas las órdenes de un usuario
  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { attributes: true, product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Obtener una orden por ID
  async findOne(id: string) {
    return this.prisma.order.findUniqueOrThrow({
      where: { id },
      include: { items: { include: { attributes: true, product: true } } },
    });
  }

  // Crear nueva orden
  async create(data: CreateOrderInput) {
    const { userId, items, notes } = data;

    let subtotal = 0;
    let total = 0;

    // Procesar cada item de la orden
    const orderItemsData = await Promise.all(
      items.map(async (item) => {
        // 1. Buscar producto
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(
            `Producto no encontrado: ${item.productId}`,
          );
        }

        // 2. Validar stock disponible
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, solicitado: ${item.quantity}`,
          );
        }

        // 3. Buscar atributos seleccionados
        const attributeValues = await this.prisma.attributeValue.findMany({
          where: { id: { in: item.attributeValueIds } },
        });

        // 4. Calcular precio con modificadores
        const priceModifier = attributeValues.reduce(
          (sum, av) => sum + av.priceModifier,
          0,
        );

        const unitBasePrice = product.basePrice;
        const unitTotalPrice = product.basePrice + priceModifier;

        // 5. Acumular totales
        subtotal += unitBasePrice * item.quantity;
        total += unitTotalPrice * item.quantity;

        // 6. Descontar stock
        await this.prisma.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity },
        });

        // 7. Retornar datos del item
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitBasePrice,
          unitTotalPrice,
          attributes: {
            connect: item.attributeValueIds.map((id) => ({ id })),
          },
        };
      }),
    );

    // 8. Crear orden con todos los items
    return this.prisma.order.create({
      data: {
        userId,
        subtotal,
        total,
        notes,
        items: { create: orderItemsData },
      },
      include: {
        items: {
          include: { attributes: true, product: true },
        },
      },
    });
  }
}
