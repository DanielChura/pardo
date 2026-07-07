import { PrismaService } from '../../src/prisma/prisma.service.js';

export async function cleanupDatabase(prisma: PrismaService) {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT LIKE '_prisma_migrations';`;

  const order = [
    'RefreshToken',
    'OrderItem',
    'Order',
    'Payment',
    'ProductVariant',
    'Product',
    'Category',
    'User',
    'Color',
  ];

  for (const table of order) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "public"."${table}" CASCADE;`,
    );
  }

  for (const { tablename } of tablenames) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "public"."${tablename}" CASCADE;`,
    );
  }
}
