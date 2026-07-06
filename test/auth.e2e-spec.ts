import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { jest } from '@jest/globals';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { StripeService } from '../src/stripe/stripe.service.js';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const mockStripe = {
    createCheckoutSession: jest.fn(),
    handleWebhook: jest.fn(),
  };

  const testUser = { email: 'daniel@gmail.com', password: 'daniel123456' };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(StripeService)
      .useValue(mockStripe)
      .compile();
    app = moduleFixture.createNestApplication();
    app.use(cookieParser('FirmaSuperSecreta123'));
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE "RefreshToken", "Order", "Payment", "Product", "Category", "User" CASCADE',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register -> should create a user and return data', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).not.toHaveProperty('password');
    expect(res.body.email).toEqual(testUser.email);
  });

  it('POST /auth/login -> should return token and set refresh cookie', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser)
      .expect(201);

    expect(res.body).toHaveProperty('token');

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const refreshCookie = cookies.find((c: string) =>
      c.startsWith('refresh_token='),
    );
    expect(refreshCookie).toBeDefined();
  });

  it('POST /auth/refresh -> should return new token using cookie', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser)
      .expect(201);

    const cookies = loginRes.headers['set-cookie'];
    const refreshCookie = cookies
      ?.find((c: string) => c.startsWith('refresh_token='))
      ?.split(';')[0];

    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', refreshCookie)
      .expect(201);

    expect(res.body).toHaveProperty('token');
  });
});
