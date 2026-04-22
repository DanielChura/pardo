import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service.js';
import { CloudinaryProvider } from './cloudinary.provider.js';
import { CloudinaryController } from './cloudinary.controller.js';

@Module({
  providers: [CloudinaryService, CloudinaryProvider],
  exports: [CloudinaryService, CloudinaryProvider],
  controllers: [CloudinaryController],
})
export class CloudinaryModule {}
