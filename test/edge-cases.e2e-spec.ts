import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createE2ETestApp } from './utils/e2e-setup.js';
import { cleanupDatabase } from './utils/db-cleanup.js';

describe('Auth Validation (400)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const setup = await createE2ETestApp();
    app = setup.app;
    prisma = setup.prisma;
  });

  beforeEach(async () => {
    await cleanupDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register -> 400 when email is not an email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'daniel123456' })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('POST /auth/register -> 400 when password is too short', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@test.com', password: '1234567' })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('POST /auth/register -> 400 when email is missing', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ password: 'daniel123456' })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('POST /auth/register -> 400 when password is missing', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@test.com' })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('POST /auth/register -> 400 when body is empty', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({})
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('POST /auth/login -> 400 when email is invalid', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'bad-email', password: 'daniel123456' })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('POST /auth/login -> 400 when password is too short', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: '123' })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });
});

describe('Auth Authorization (401)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const setup = await createE2ETestApp();
    app = setup.app;
    prisma = setup.prisma;
  });

  beforeEach(async () => {
    await cleanupDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /orders -> 401 without token', async () => {
    const res = await request(app.getHttpServer()).get('/orders').expect(401);

    expect(res.body.message).toBeDefined();
  });

  it('POST /orders -> 401 without token', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .send({ items: [] })
      .expect(401);

    expect(res.body.message).toBeDefined();
  });

  it('GET /orders/:id -> 401 without token', async () => {
    const res = await request(app.getHttpServer())
      .get('/orders/550e8400-e29b-41d4-a716-446655440000')
      .expect(401);

    expect(res.body.message).toBeDefined();
  });

  it('GET /orders -> 401 with malformed token', async () => {
    const res = await request(app.getHttpServer())
      .get('/orders')
      .auth('invalid-token', { type: 'bearer' })
      .expect(401);

    expect(res.body.message).toBeDefined();
  });

  it('POST /auth/refresh -> 401 without refresh cookie', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .expect(401);

    expect(res.body.message).toBeDefined();
  });
});

describe('Orders Validation (400)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let token: string;

  beforeAll(async () => {
    const setup = await createE2ETestApp();
    app = setup.app;
    prisma = setup.prisma;
  });

  beforeEach(async () => {
    await cleanupDatabase(prisma);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'buyer@e2e.com', password: 'daniel123456' })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'buyer@e2e.com', password: 'daniel123456' })
      .expect(201);

    token = loginRes.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /orders -> 400 when items is empty array', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .auth(token, { type: 'bearer' })
      .send({ items: [] })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('POST /orders -> 400 when items is missing', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .auth(token, { type: 'bearer' })
      .send({})
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('POST /orders -> 400 when productVariantId is not a UUID', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .auth(token, { type: 'bearer' })
      .send({ items: [{ productVariantId: 'not-a-uuid', quantity: 1 }] })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('POST /orders -> 400 when quantity is 0', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .auth(token, { type: 'bearer' })
      .send({
        items: [
          {
            productVariantId: '550e8400-e29b-41d4-a716-446655440000',
            quantity: 0,
          },
        ],
      })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('POST /orders -> 400 when quantity is negative', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .auth(token, { type: 'bearer' })
      .send({
        items: [
          {
            productVariantId: '550e8400-e29b-41d4-a716-446655440000',
            quantity: -1,
          },
        ],
      })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('POST /orders -> 400 when quantity is missing', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .auth(token, { type: 'bearer' })
      .send({
        items: [{ productVariantId: '550e8400-e29b-41d4-a716-446655440000' }],
      })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('POST /orders -> 400 when productVariantId is missing', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .auth(token, { type: 'bearer' })
      .send({ items: [{ quantity: 1 }] })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });
});

describe('Forbidden (403)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let userToken: string;

  beforeAll(async () => {
    const setup = await createE2ETestApp();
    app = setup.app;
    prisma = setup.prisma;
  });

  beforeEach(async () => {
    await cleanupDatabase(prisma);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'regular@user.com', password: 'daniel123456' })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'regular@user.com', password: 'daniel123456' })
      .expect(201);

    userToken = loginRes.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /categories -> 403 for regular user', async () => {
    const res = await request(app.getHttpServer())
      .post('/categories')
      .auth(userToken, { type: 'bearer' })
      .send({ name: 'test', slug: 'test' })
      .expect(403);

    expect(res.body.message).toBeDefined();
  });

  it('POST /products -> 403 for regular user', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .auth(userToken, { type: 'bearer' })
      .send({
        name: 'test',
        slug: 'test',
        categoryId: '00000000-0000-0000-0000-000000000000',
      })
      .expect(403);

    expect(res.body.message).toBeDefined();
  });

  it('POST /colors -> 403 for regular user', async () => {
    const res = await request(app.getHttpServer())
      .post('/colors')
      .auth(userToken, { type: 'bearer' })
      .send({ name: 'test', hex: '#000000' })
      .expect(403);

    expect(res.body.message).toBeDefined();
  });
});
