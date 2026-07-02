import {
  Controller,
  Post,
  Body,
  UseGuards,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { StripeService } from './stripe.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('webhook')
  async handleWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Falta la cabecera stripe-signature');
    }
    return this.stripeService.handleWebhook(req.rawBody, signature);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(
    @CurrentUser('id') userId: string,
    @Body() body: { orderId: string },
  ) {
    return this.stripeService.createCheckoutSession(userId, body.orderId);
  }
}
