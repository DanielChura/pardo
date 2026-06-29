import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export class CreatePaymentDTO {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsString()
  stripeCheckoutSessionId: string;

  @IsString()
  @IsOptional()
  stripePaymentIntentId?: string;

  @IsString()
  @IsOptional()
  stripeClientSecret?: string;

  @IsString()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsNumber()
  @IsPositive()
  amount: number;
}
