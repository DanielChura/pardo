import { IsUUID, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  productVariantId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
