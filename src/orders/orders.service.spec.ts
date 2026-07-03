import { PrismaService } from "../prisma/prisma.service.js"
import { OrdersService } from "./orders.service.js"
import { Test } from "@nestjs/testing";
import { CreateOrderDto, CreateOrderItemDto, OrderItemDto } from "./dto/create-order.dto.js";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { jest } from '@jest/globals';

describe('OrdersService', () => {
    let orderService: OrdersService;
    let prisma: jest.Mocked<PrismaService>;

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
        }
    };

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [OrdersService, { provide: PrismaService, useValue: mockPrisma }]
        }).compile();

        orderService = module.get<OrdersService>(OrdersService)
        prisma = module.get(PrismaService)
    })
    afterEach(() => jest.clearAllMocks())

    describe('create', () => {
        const productVariantId = 'var-123'
        const userId = 'user-123'
        const orderId = 'ord-123'
        const items = [{ productVariantId, quantity: 2 } as OrderItemDto]
        const variant = {
            id: productVariantId,
            stock: 10,
            price: 5000,
            size: 'M',
            dimensions: '30x40',
            color: { name: 'Navy' },
            product: { name: 'Collar Premium' },
        };

        it('should create order and decrement stock', async () => {
            mockPrisma.$transaction.mockImplementation(
                async (cb: Function) => cb(mockPrisma)
            );
            mockPrisma.productVariant.findUnique.mockResolvedValue(variant)
            mockPrisma.order.create.mockResolvedValue({ orderId, userId, subtotal: 10000, total: 10000, items: [] })

            const result = await orderService.create(userId, ({ items }))
            expect(mockPrisma.productVariant.update).toHaveBeenCalledWith({
                where: { id: productVariantId, stock: { gte: 2 } },
                data: { stock: { decrement: 2 } },
            });
            await expect(result.total).toEqual(10000)
        })

        it('should throw on when variant does not exist', async () => {
            mockPrisma.$transaction.mockImplementation(
                async (cb: Function) => cb(mockPrisma)
            );
            mockPrisma.order.findUnique.mockResolvedValue(null)
            expect(orderService.findOne(userId, orderId)).rejects.toThrow(NotFoundException)
        })

        it('should throw on decrement stock', async () => {
            mockPrisma.$transaction.mockImplementation(
                async (cb: Function) => cb(mockPrisma)
            );
            const items = [{ productVariantId, quantity: 200 } as OrderItemDto]
            mockPrisma.productVariant.findUnique.mockResolvedValue(variant)
            await expect(orderService.create(userId, ({ items }))).rejects.toThrow(BadRequestException)
        })
    })
})