import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service.js';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('uploads')
export class CloudinaryController {
  constructor(private cloudinaryService: CloudinaryService) {}
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: any) {
    return await this.cloudinaryService.uploadFile(file);
  }
}
