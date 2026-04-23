import { Module } from '@nestjs/common';
import { FabricService } from './fabrics.service.js';
import { FabricController } from './fabrics.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';

@Module({
  controllers: [FabricController],
  providers: [FabricService],
  imports: [PrismaModule, CloudinaryModule]
})
export class FabricsModule {}
