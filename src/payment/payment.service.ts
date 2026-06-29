import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

import { CreatePaymentDTO, PaymentStatus } from './dto/CreatePaymentDTO.js';

@Injectable()
export class PaymentService {
  constructor(private prismaService: PrismaService) {}

  async updatePaymentBySessionId(sessionId: string, status: PaymentStatus) {
    return this.prismaService.payment.update({
      where: { stripeCheckoutSessionId: sessionId },
      data: { status },
    });
  }

  async createPayment(data: CreatePaymentDTO) {
    return this.prismaService.payment.create({
      data,
    });
  }
}
