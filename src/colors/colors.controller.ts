import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ColorsService } from './colors.service.js';
import { CreateColorDto } from './dto/CreateColorDto.js';
import { UpdateColorDto } from './dto/UpdateColorDto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../generated/prisma/client.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';

@Controller('colors')
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) {}

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.colorsService.findAll(paginationDto);
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  createColor(@Body() dto: CreateColorDto) {
    return this.colorsService.createColor(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateColor(@Param('id') id: string, @Body() dto: UpdateColorDto) {
    return this.colorsService.updateColor(id, dto);
  }
}
