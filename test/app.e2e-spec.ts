import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2ETestApp } from './utils/e2e-setup.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = (await createE2ETestApp()).app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/products (GET)', () => {
    return request(app.getHttpServer()).get('/products').expect(200);
  });
});
