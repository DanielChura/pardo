import {
  IsUUID,
  IsInt,
  Min,
  Max,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

class ReviewImageDto {
  @IsUrl()
  imageUrl: string;

  @IsString()
  imagePublicId: string;
}

export class CreateReviewDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ReviewImageDto)
  images?: ReviewImageDto[];
}
