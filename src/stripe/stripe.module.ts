import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service.js';
import { StripeController } from './stripe.controller.js';
import { OrdersModule } from '../orders/orders.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PaymentModule } from '../payment/payment.module.js';

@Module({
  controllers: [StripeController],
  imports: [OrdersModule, PrismaModule, PaymentModule],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
