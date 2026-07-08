import { IsString, IsOptional, IsObject, IsUUID } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  action: string;

  @IsString()
  entity: string;

  @IsString()
  entityId: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsUUID()
  @IsOptional()
  userId?: string;
}
