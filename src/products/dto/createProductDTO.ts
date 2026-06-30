import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

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

export class UploadProductImageDTO {
  @IsString()
  @IsNotEmpty()
  imageUrl!: string;

  @IsString()
  @IsNotEmpty()
  imagePublicId!: string;

  @IsInt()
  @Min(0)
  @Max(8)
  orderIndex!: number;
}
