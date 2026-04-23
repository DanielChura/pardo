import { Module } from '@nestjs/common';
import { WoodService } from './wood.service.js';
import { WoodController } from './wood.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';

@Module({
  controllers: [WoodController],
  providers: [WoodService],
  imports: [PrismaModule, CloudinaryModule]
})
export class WoodModule {}
