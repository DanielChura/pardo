import { Module } from '@nestjs/common';
import { FavoritesController } from './favorites.controller.js';
import { FavoritesService } from './favorites.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  controllers: [FavoritesController],
  providers: [FavoritesService],
  imports: [PrismaModule],
})
export class FavoritesModule {}
