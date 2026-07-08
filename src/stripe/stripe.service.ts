import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { OrdersService } from '../orders/orders.service.js';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentService } from '../payment/payment.service.js';
import { PaymentStatus } from '../payment/dto/CreatePaymentDTO.js';
import { OrderStatus } from '../generated/prisma/client.js';
import { PaymentProvider } from '../payments/providers/payment-provider.interface.js';

@Injectable()
export class StripeService implements PaymentProvider {
  private stripe: Stripe;
  constructor(
    private prisma: PrismaService,
    private orderService: OrdersService,
    private configService: ConfigService,
    private paymentService: PaymentService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_API_KEY')!;
    const apiVersion = this.configService.get<string>('STRIPE_API_VERSION');
    this.stripe = new Stripe(secretKey, {
      apiVersion: apiVersion as '2026-06-24.dahlia',
    });
  }

  async createCheckoutSession(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId, userId },
      include: { items: true },
    });
    if (!order) throw new BadRequestException('Order not found');

    const lines = order.items.map((item) => ({
      price_data: {
        currency: 'pen',
        product_data: { name: item.productName },
        unit_amount: item.unitPrice,
      },
      quantity: item.quantity,
    }));

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lines,
      mode: 'payment',
      success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/checkout/cancel`,
      metadata: { userId, orderId },
    });

    const payment = await this.prisma.payment.findFirst({
      where: { orderId, status: PaymentStatus.PENDING },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          stripeCheckoutSessionId: session.id,
          stripeClientSecret: session.client_secret as string,
        },
      });
    } else {
      await this.paymentService.createPayment({
        orderId,
        stripeCheckoutSessionId: session.id,
        stripeClientSecret: session.client_secret as string,
        amount: order.total,
        status: PaymentStatus.PENDING,
      });
    }

    return { sessionUrl: session.url! };
  }

  async handleWebhook(rawBody: any, signature: string) {
    const webhook = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhook!);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    switch (event?.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session.metadata?.orderId as string;
        const sessionId = session.id;

        const payment = await this.prisma.payment.findUnique({
          where: {
            stripeCheckoutSessionId: sessionId,
          },
        });

        if (payment && payment.status !== PaymentStatus.PENDING) {
          return { received: true };
        }

        await this.paymentService.updatePaymentBySessionId(
          sessionId,
          PaymentStatus.PAID,
        );
        if (orderId) {
          await this.orderService.updateStatus(orderId, OrderStatus.PAID);
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        const orderId = session.metadata?.orderId as string;
        const sessionId = session.id;

        const payment = await this.prisma.payment.findUnique({
          where: {
            stripeCheckoutSessionId: sessionId,
          },
        });

        if (payment && payment.status !== PaymentStatus.PENDING) {
          return { received: true };
        }

        await this.paymentService.updatePaymentBySessionId(
          sessionId,
          PaymentStatus.FAILED,
        );
        if (orderId) {
          await this.orderService.updateStatus(orderId, OrderStatus.CANCELLED);
        }
        break;
      }
      default: {
        break;
      }
    }
    return { received: true };
  }
}
