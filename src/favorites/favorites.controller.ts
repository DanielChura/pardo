import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { FavoritesService } from './favorites.service.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { IsString } from 'class-validator';

export class CreateFavoriteDto {
  @IsString()
  productId!: string;
}

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get('me')
  async getMyFavorites(@CurrentUser('id') userId: string) {
    return await this.favoritesService.findMyFavorites(userId);
  }

  @Post('me')
  async addFavorite(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateFavoriteDto,
  ) {
    return await this.favoritesService.createFavorite(userId, dto);
  }

  @Delete('me')
  async deleteFavorite(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateFavoriteDto,
  ) {
    return await this.favoritesService.deleteFavorite(userId, dto);
  }
}
