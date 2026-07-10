import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StripeService } from '../stripe/stripe.service.js';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
  ) {}

  async verify() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      await this.stripe.checkHealth();
      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException('Service not ready');
    }
  }
}
