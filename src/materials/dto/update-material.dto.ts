import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateMaterialDto {
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
