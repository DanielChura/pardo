import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ColorsService } from './colors.service.js';
import { CreateColorDto } from './dto/CreateColorDto.js';
import { UpdateColorDto } from './dto/UpdateColorDto.js';

@Controller('colors')
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) {}

  @Get()
  findAll() {
    return this.colorsService.findAll();
  }

  @Post()
  createColor(@Body() dto: CreateColorDto) {
    return this.colorsService.createColor(dto);
  }

  @Patch(':id')
  updateColor(@Param('id') id: string, @Body() dto: UpdateColorDto) {
    return this.colorsService.updateColor(id, dto);
  }
}
