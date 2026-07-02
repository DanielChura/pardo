import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateColorDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(7)
  hex?: string;
}
