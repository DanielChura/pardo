import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module.js';
import { StripeService } from '../../src/stripe/stripe.service.js';
import { jest } from '@jest/globals';
import { PrismaService } from '../../src/prisma/prisma.service.js';
import { createUser } from 'test/factories/user.factory.js';
import { createCategory } from 'test/factories/category.factory.js';
import { createProduct } from 'test/factories/product.factory.js';
import { createColor } from 'test/factories/color.factory.js';
import { createProductVariant } from 'test/factories/product-variant.factory.js';

export async function createE2ETestApp(
  stripeMock: any = {
    createCheckoutSession: jest.fn(),
    handleWebhook: jest.fn(),
  },
) {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(StripeService)
    .useValue(stripeMock)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.use(cookieParser('FirmaSuperSecreta123'));
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  await app.init();
  const prisma = app.get(PrismaService);
  return { app, prisma };
}

export async function seedData(prisma: PrismaService) {
  const user = await createUser(prisma, {
    email: 'buyer@e2e.com',
    password: 'admin123',
  });
  const category = await createCategory(prisma, {
    name: 'cat-e2e',
    slug: 'cat-e2e',
  });
  const product = await createProduct(prisma, category.id, {
    name: 'pro-e2e',
    slug: 'pro-2e2',
  });
  const color = await createColor(prisma, { id: 'color-e2e' });
  const variantId = '550e8400-e29b-41d4-a716-446655440000';
  await createProductVariant(prisma, product.id, color.id, {
    id: variantId,
    stock: 10,
  });

  return { user, category, product, color, variantId };
}
