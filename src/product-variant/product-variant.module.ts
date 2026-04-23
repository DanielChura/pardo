import { Module } from '@nestjs/common';
import { ProductVariantService } from './product-variant.service.js';
import { ProductVariantController } from './product-variant.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  controllers: [ProductVariantController],
  providers: [ProductVariantService],
  imports: [PrismaModule]
})
export class ProductVariantModule {}
