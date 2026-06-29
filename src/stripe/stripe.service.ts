import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { OrdersService } from '../orders/orders.service.js';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentService } from '../payment/payment.service.js';
import { PaymentStatus } from '../payment/dto/CreatePaymentDTO.js';
import { OrderStatus } from 'src/orders/dto/create-order.dto.js';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(
    private prisma: PrismaService,
    private orderService: OrdersService,
    private configService: ConfigService,
    private paymentService: PaymentService,
  ) {
    const secretKey =
      this.configService.get<string>('STRIPE_API_KEY') ?? 'adasd';
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2026-06-24.dahlia',
    });
  }

  async createCheckoutSession(orderId: string, userId: string) {
    const order = await this.orderService.findOne(orderId, userId);
    if (!order) {
      throw new NotFoundException('Order not exist');
    }

    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        orderId: orderId,
      },
    });

    const lines = orderItems.map((item) => ({
      price_data: {
        currency: 'pen',
        product_data: {
          name: item.productName,
        },
        unit_amount: item.unitTotalPrice * 100,
      },
      quantity: item.quantity,
    }));

    const frontendUrl = this.configService.get<String>('FRONTEND_URL');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lines,
      mode: 'payment',
      success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/checkout/cancel`,
      metadata: {
        userId,
        orderId,
      },
    });

    await this.paymentService.createPayment({
      orderId,
      stripeCheckoutSessionId: session.id,
      stripeClientSecret: session.client_secret as string,
      amount: order.total,
      status: PaymentStatus.PENDING,
    });

    return { session: session.url };
  }

  async handleWebhook(rawBody: Buffer<ArrayBufferLike>, signature: string) {
    const webhook = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhook!);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    switch (event?.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId as string;
        const sessionId = session.id;

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
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId as string;
        const sessionId = session.id;

        await this.paymentService.updatePaymentBySessionId(
          sessionId,
          PaymentStatus.FAILED,
        );
        if (orderId) {
          await this.orderService.updateStatus(
            orderId,
            OrderStatus.CANCELLED,
          );
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
