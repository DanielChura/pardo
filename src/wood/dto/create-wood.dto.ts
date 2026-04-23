import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  IsBoolean,
} from 'class-validator';

export class CreateWoodDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imagePublicId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
