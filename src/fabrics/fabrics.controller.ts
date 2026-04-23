import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FabricService } from './fabrics.service.js';
import { CreateFabricDto } from './dto/create-fabric.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { UpdateFabricDto } from './dto/update-fabric.dto.js';

@Controller('fabric')
export class FabricController {
  constructor(
    private readonly fabricService: FabricService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createFabricDto: CreateFabricDto,
  ) {
    let { imageUrl, imagePublicId, ...rest } = createFabricDto;

    if (file) {
      const upload = await this.cloudinaryService.uploadFile(file);
      imageUrl = upload.secure_url;
      imagePublicId = upload.public_id;
    }

    // Pasamos un objeto limpio que cumple con Prisma.FabricCreateInput
    return this.fabricService.create({
      ...rest,
      imageUrl,
      imagePublicId,
    });
  }

  @Get()
  findAll() {
    return this.fabricService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.fabricService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateFabricDto: UpdateFabricDto,
  ) {
    const existing = await this.fabricService.findOne(id);
    let { imageUrl, imagePublicId, ...rest } = updateFabricDto;

    if (file) {
      if (existing.imagePublicId) {
        await this.cloudinaryService.deleteFile(existing.imagePublicId);
      }
      const upload = await this.cloudinaryService.uploadFile(file);
      imageUrl = upload.secure_url;
      imagePublicId = upload.public_id;
    }

    return this.fabricService.update(id, {
      ...rest,
      imageUrl,
      imagePublicId,
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.fabricService.remove(id);
  }
}
