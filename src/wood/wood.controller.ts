import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseInterceptors, UploadedFile, ParseUUIDPipe
} from '@nestjs/common';
import { WoodService } from './wood.service.js';
import { CreateWoodDto } from './dto/create-wood.dto.js';
import { UpdateWoodDto } from './dto/update-wood.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

@Controller('wood')
export class WoodController {
  constructor(
    private readonly woodService: WoodService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createWoodDto: CreateWoodDto,
  ) {
    if (file) {
      const upload = await this.cloudinaryService.uploadFile(file);
      createWoodDto.imageUrl = upload.secure_url;
      createWoodDto.imagePublicId = upload.public_id;
    }
    return this.woodService.create(createWoodDto);
  }

  @Get()
  findAll() {
    return this.woodService.findAll();
  }

  @Get('active')
  findActive() {
    return this.woodService.findActive();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.woodService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateWoodDto: UpdateWoodDto,
  ) {
    const existing = await this.woodService.findOne(id);

    if (file) {
      if (existing.imagePublicId) {
        await this.cloudinaryService.deleteFile(existing.imagePublicId);
      }
      const upload = await this.cloudinaryService.uploadFile(file);
      updateWoodDto.imageUrl = upload.secure_url;
      updateWoodDto.imagePublicId = upload.public_id;
    }

    return this.woodService.update(id, updateWoodDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.woodService.remove(id);
  }
}