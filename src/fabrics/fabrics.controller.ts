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
  UseGuards,
} from '@nestjs/common';
import { FabricService } from './fabrics.service.js';
import { CreateFabricDto } from './dto/create-fabric.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { UpdateFabricDto } from './dto/update-fabric.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../generated/prisma/client.js';

@Controller('fabric')
export class FabricController {
  constructor(
    private readonly fabricService: FabricService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  findAll() {
    return this.fabricService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.fabricService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async create(@UploadedFile() file: Express.Multer.File, @Body() createFabricDto: CreateFabricDto) {
    let { imageUrl, imagePublicId, ...rest } = createFabricDto;
    if (file) {
      const upload = await this.cloudinaryService.uploadFile(file);
      imageUrl = upload.secure_url;
      imagePublicId = upload.public_id;
    }
    return this.fabricService.create({ ...rest, imageUrl, imagePublicId });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
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
    return this.fabricService.update(id, { ...rest, imageUrl, imagePublicId });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.fabricService.remove(id);
  }
}
