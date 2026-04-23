import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { ProductsModule } from './products/products.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { CloudinaryModule } from './cloudinary/cloudinary.module.js';
import { WoodModule } from './wood/wood.module.js';
import { FabricsModule } from './fabrics/fabrics.module.js';
import { ProductVariantModule } from './product-variant/product-variant.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    CloudinaryModule,
    WoodModule,
    FabricsModule,
    ProductVariantModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
