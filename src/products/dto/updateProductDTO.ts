import { IsString, IsNumber, IsOptional, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDTO {
  @IsString()
  @IsOptional()
  name!: string;

  @IsString()
  @IsOptional()
  description!: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  basePrice!: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  stock!: number;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imagePublicId?: string;
}
