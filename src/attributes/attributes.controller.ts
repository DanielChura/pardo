import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { AttributesService } from './attributes.service.js';
import { Prisma } from '../generated/prisma/client.js';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Get()
  findAll() {
    return this.attributesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attributesService.findOne(id);
  }

  @Post()
  create(@Body() body: Prisma.AttributeCreateInput) {
    return this.attributesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Prisma.AttributeUpdateInput) {
    return this.attributesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attributesService.remove(id);
  }

  @Post(':id/values')
  createValue(
    @Param('id') id: string,
    @Body() body: Prisma.AttributeValueCreateInput,
  ) {
    return this.attributesService.createValue({
      ...body,
      attribute: { connect: { id } },
    });
  }

  @Delete('values/:id')
  removeValue(@Param('id') id: string) {
    return this.attributesService.removeValue(id);
  }

  @Patch('values/:id')
  updateValue(
    @Param('id') id: string,
    @Body() body: Prisma.AttributeValueUpdateInput,
  ) {
    return this.attributesService.updateValue(id, body);
  }
}
