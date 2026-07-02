import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

export class CreateFavoriteDto {
  @IsString()
  productId!: string;
}

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyFavorites(@CurrentUser('id') userId: string) {
    return await this.favoritesService.findMyFavorites(userId);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  async addFavorite(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateFavoriteDto,
  ) {
    return await this.favoritesService.createFavorite(userId, dto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteFavorite(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateFavoriteDto,
  ) {
    return await this.favoritesService.deleteFavorite(userId, dto);
  }
}
