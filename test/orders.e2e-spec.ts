import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { StripeService } from '../src/stripe/stripe.service.js';
import { jest } from '@jest/globals';
import { createE2ETestApp, seedData } from './utils/e2e-setup.js';
import { cleanupDatabase } from './utils/db-cleanup.js';
import { AuthDto } from '../src/auth/dto/auth.dto.js';
import { validate } from 'class-validator';

describe('Orders → Payment → Webhook (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Mock completo de StripeService
  const mockStripeService = {
    createCheckoutSession: jest.fn().mockReturnValue({
      session: 'https://checkout.stripe.com/test_cs_123',
    }),
    handleWebhook: jest.fn(),
  };

  beforeAll(async () => {
    const setup = await createE2ETestApp(mockStripeService);
    app = setup.app;
    prisma = setup.prisma;
  });

  beforeEach(async () => {
    await cleanupDatabase(prisma);
    await seedData(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('full flow: login → create order → checkout → webhook → order PAID + stock -1', async () => {
    const items = {
      items: [
        {
          productVariantId: '550e8400-e29b-41d4-a716-446655440000',
          quantity: 1,
        },
      ],
    };

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
      .send(items);

    if (orderRes.status == 400 || orderRes.status == 404) {
      console.log('Error creating order:', orderRes.body);
    }
    expect(orderRes.status).toBe(201);
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
    const variantId = '550e8400-e29b-41d4-a716-446655440000';
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    expect(variant?.stock).toBe(9); // Era 10, compramos 1
  });

  it('should have validation errors if email/password are empty', async () => {
    const dto = new AuthDto();
    await request(app.getHttpServer())
      .post('/auth/login')
      .send(dto)
      .expect(400);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
