import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateColorDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name?: string;

  @IsString()
  @MinLength(4)
  @MaxLength(7)
  hex?: string;
}
