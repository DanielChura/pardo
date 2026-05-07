import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { CreateProductDto } from './dto/createProductDTO.js';
import { UpdateProductDto } from './dto/updateProductDTO.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../generated/prisma/client.js';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: CreateProductDto) {
    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;

    if (file) {
      const upload = await this.cloudinaryService.uploadFile(file);
      imageUrl = upload.secure_url;
      imagePublicId = upload.public_id;
    }

    return this.productsService.create({ ...body, imageUrl, imagePublicId });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateProductDto,
  ) {
    const existingProduct = await this.productsService.findOne(id);

    let imageUrl = existingProduct.imageUrl;
    let imagePublicId = existingProduct.imagePublicId;

    if (file) {
      if (existingProduct.imagePublicId) {
        await this.cloudinaryService.deleteFile(existingProduct.imagePublicId);
      }
      const upload = await this.cloudinaryService.uploadFile(file);
      imageUrl = upload.secure_url;
      imagePublicId = upload.public_id;
    }

    return this.productsService.update(id, { ...body, imageUrl, imagePublicId });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
