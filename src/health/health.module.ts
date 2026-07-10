import { Module } from '@nestjs/common';
import { HealthService } from './health.service.js';
import { HealthController } from './health.controller.js';
import { StripeModule } from '../stripe/stripe.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [StripeModule, PrismaModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
