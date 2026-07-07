import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createE2ETestApp } from './utils/e2e-setup.js';
import { cleanupDatabase } from './utils/db-cleanup.js';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testUser = { email: 'daniel@gmail.com', password: 'daniel123456' };

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
