import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductVariantService } from './product-variant.service.js';
import { CreateProductVariantDto } from './dto/create-product-variant.dto.js';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto.js';

@Controller('product-variant')
export class ProductVariantController {
  constructor(private readonly variantService: ProductVariantService) {}

  @Post()
  create(@Body() dto: CreateProductVariantDto) {
    // Mapeamos el DTO plano al tipo CreateInput de Prisma que espera relaciones
    return this.variantService.create({
      price: dto.price,
      stock: dto.stock,
      product: { connect: { id: dto.productId } },
      wood: { connect: { id: dto.woodId } },
    });
  }

  @Get()
  findAll() {
    return this.variantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.variantService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    // Aquí el DTO solo trae price y stock, que encajan directo con UpdateInput
    return this.variantService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.variantService.remove(id);
  }
}
