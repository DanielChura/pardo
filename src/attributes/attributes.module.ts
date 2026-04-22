import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service.js';
import { AttributesController } from './attributes.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [AttributesController],
  providers: [AttributesService],
  exports: [AttributesService],
})
export class AttributesModule {}
