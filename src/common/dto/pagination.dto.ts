import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginationDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit: number = 10;
}

export class PaginationResponse<T> {
  data: T[];
  nextPage?: number | null;
  prevPage?: number | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export function toPagination<T>(
  data: T[],
  totalItems: number,
  limit: number,
  page: number,
): PaginationResponse<T> {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    data,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
    currentPage: page,
    totalPages,
    totalItems,
  };
}
