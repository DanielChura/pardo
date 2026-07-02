import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { ProductsModule } from './products/products.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { CloudinaryModule } from './cloudinary/cloudinary.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { ProductVariantModule } from './product-variant/product-variant.module.js';
import { StripeModule } from './stripe/stripe.module.js';
import { PaymentModule } from './payment/payment.module.js';
import { ColorsModule } from './colors/colors.module.js';
import { FavoritesModule } from './favorites/favorites.module.js';
import { LoggerModule } from 'nestjs-pino';
import { loggerConfig } from './common/config/logger.config.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule.forRoot(loggerConfig),
    PrismaModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    CloudinaryModule,
    CategoriesModule,
    ProductVariantModule,
    StripeModule,
    PaymentModule,
    ColorsModule,
    FavoritesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
