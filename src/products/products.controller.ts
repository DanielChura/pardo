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
} from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { CreateProductDto } from './dto/createProductDTO.js';
import { UpdateProductDto } from './dto/updateProductDTO.js';

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
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateProductDto,
  ) {
    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;

    if (file) {
      const upload = await this.cloudinaryService.uploadFile(file);
      imageUrl = upload.secure_url;
      imagePublicId = upload.public_id;
    }

    return await this.productsService.create({
      ...body,
      imageUrl,
      imagePublicId,
    });
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateProductDto,
  ) {
    // Buscamos el producto actual para saber si tiene una imagen previa que borrar
    const existingProduct = await this.productsService.findOne(id);

    let imageUrl = existingProduct.imageUrl;
    let imagePublicId = existingProduct.imagePublicId;

    if (file) {
      // Si hay una imagen nueva, borramos la anterior de Cloudinary
      if (existingProduct.imagePublicId) {
        await this.cloudinaryService.deleteFile(existingProduct.imagePublicId);
      }

      const upload = await this.cloudinaryService.uploadFile(file);
      imageUrl = upload.secure_url;
      imagePublicId = upload.public_id;
    }

    return this.productsService.update(id, {
      ...body,
      imageUrl,
      imagePublicId,
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
