import { IsString, IsOptional, IsUrl, IsBoolean } from 'class-validator';

export class UpdateWoodDto {
  @IsString()
  @IsOptional()
  name?: string;

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
