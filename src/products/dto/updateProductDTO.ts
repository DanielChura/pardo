import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  details?: string;

  @IsString()
  @IsOptional()
  care?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
