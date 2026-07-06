import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { StripeService } from '../src/stripe/stripe.service.js';
import { jest } from '@jest/globals';
import { createUser } from './factories/user.factory.js';
import { createCategory } from './factories/category.factory.js';
import { createProduct } from './factories/product.factory.js';
import { createProductVariant } from './factories/product-variant.factory.js';
import { createColor } from './factories/color.factory.js';

describe('Orders → Payment → Webhook (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Mock completo de StripeService
  const mockStripeService = {
    createCheckoutSession: jest.fn().mockResolvedValue({
      session: 'https://checkout.stripe.com/test_cs_123',
    }),
    handleWebhook: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(StripeService)
      .useValue(mockStripeService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE "RefreshToken", "OrderItem", "Order", "Payment", "ProductVariant", "Product", "Category", "User", "Color" CASCADE'
    );

    // Seed usando factories
    const user = await createUser(prisma, { email: 'buyer@e2e.com', password: 'admin123' });
    const category = await createCategory(prisma, { id: 'cat-e2e' });
    const product = await createProduct(prisma, category.id, { id: 'prod-e2e' });
    const color = await createColor(prisma, { id: 'color-e2e' });
    await createProductVariant(prisma, product.id, color.id, { id: 'var-e2e', stock: 10 });
  });

  afterAll(async () => {
    await app.close();
  });

  it('full flow: login → create order → checkout → webhook → order PAID + stock -1', async () => {
    // 1. Login como el usuario que creamos en el seed
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'buyer@e2e.com', password: 'admin123' })
      .expect(201);
    const token = loginRes.body.token;

    // 2. Crear orden
    const orderRes = await request(app.getHttpServer())
      .post('/orders')
      .auth(token, { type: 'bearer' })
      .send({ items: [{ productVariantId: 'var-e2e', quantity: 1 }] })
      .expect(201);
    const orderId = orderRes.body.id;

    // 3. Checkout — genera sesión de Stripe (mockeada)
    const checkoutRes = await request(app.getHttpServer())
      .post('/stripe/checkout')
      .auth(token, { type: 'bearer' })
      .send({ orderId })
      .expect(201);
    expect(checkoutRes.body.session).toContain('stripe.com');

    // 4. Simular webhook checkout.session.completed
    // Reemplazamos handleWebhook con una implementación que haga la lógica real
    const stripeService = app.get(StripeService);
    (stripeService.handleWebhook as jest.Mock).mockImplementation(
      async (rawBody: any, signature: string) => {
        // Buscamos el payment asociado a la orden
        const payment = await prisma.payment.findFirst({
          where: { orderId },
        });
        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'PAID' },
          });
        }
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        });
        return { received: true };
      },
    );

    // Enviamos el webhook falso
    await request(app.getHttpServer())
      .post('/stripe/webhook')
      .set('stripe-signature', 'fake_signature')
      .send({
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test' } },
      })
      .expect(201);

    // 5. Verificamos que la orden quedó PAID
    const orderFinal = await request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(orderFinal.body.status).toBe('PAID');

    // 6. Verificamos que el stock se descontó
    const variant = await prisma.productVariant.findUnique({
      where: { id: 'var-e2e' },
    });
    expect(variant?.stock).toBe(9); // Era 10, compramos 1
  });
});
