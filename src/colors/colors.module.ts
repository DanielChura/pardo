import { Module } from '@nestjs/common';
import { ColorsService } from './colors.service.js';
import { ColorsController } from './colors.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  controllers: [ColorsController],
  providers: [ColorsService],
  imports: [PrismaModule],
})
export class ColorsModule {}
