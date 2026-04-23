import { IsString, IsNumber, IsOptional, IsUrl, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateFabricDto {
  @IsString()
  @IsOptional()
  name?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsOptional() @IsString() @IsUrl()
  imageUrl?: string;

  @IsOptional() @IsString()
  imagePublicId?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}