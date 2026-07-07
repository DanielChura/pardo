import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { jest } from '@jest/globals';

describe('OrderService2', () => {
  let prisma: jest.Mocked<PrismaService>;
  let ordersService: OrdersService;

  const mockPrisma = {
    $transaction: jest.fn(),
    order: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    orderItem: { findMany: jest.fn() },
    productVariant: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OrdersService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    prisma = module.get<PrismaService>(PrismaService);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const productVariantId = 'var-123';
    const variant = {
      id: productVariantId,
      stock: 10,
      price: 5000,
      size: 'M',
      dimensions: '30x40',
      color: { name: 'Navy' },
      product: { name: 'Collar Premium' },
    };
    const items: CreateOrderDto = {
      items: [{ productVariantId, quantity: 20 }],
    };

    it('should throw error if quantity is more than stock', () => {
      mockPrisma.$transaction.mockImplementation(async (cb: Function) =>
        cb(mockPrisma),
      );
      mockPrisma.productVariant.findUnique.mockResolvedValue(variant);

      expect(ordersService.create('user-123', items)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if not found a variant', () => {
      mockPrisma.$transaction.mockImplementation(async (cb: Function) =>
        cb(mockPrisma),
      );
      mockPrisma.productVariant.findUnique.mockResolvedValue(null);

      expect(ordersService.create('user-123', items)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should decrement stock', async () => {
      const productVariantId = 'var-123';
      const variant = {
        id: productVariantId,
        stock: 10,
        price: 5000,
        size: 'M',
        dimensions: '30x40',
        color: { name: 'Navy' },
        product: { name: 'Collar Premium' },
      };
      const items: CreateOrderDto = {
        items: [{ productVariantId, quantity: 2 }],
      };
      mockPrisma.$transaction.mockImplementation(async (cb: Function) =>
        cb(mockPrisma),
      );
      mockPrisma.productVariant.findUnique.mockResolvedValue(variant);
      mockPrisma.order.create.mockResolvedValue({
        orderId: 'ord-123',
        userId: 'user-123',
        subtotal: 10000,
        total: 10000,
        items: [],
      });

      const result = await ordersService.create('user-123', items);

      expect(result.userId).toEqual('user-123');
      expect(mockPrisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: variant.id, stock: { gte: 2 } },
        data: { stock: { decrement: 2 } },
      });
    });
  });
});
