import { PrismaService } from '../../src/prisma/prisma.service.js';

export async function createProduct(
  prisma: PrismaService,
  categoryId: string,
  overrides: { name?: string; slug?: string } = {},
) {
  const defaults = {
    name: 'Product Test',
    slug: `prod-${Date.now()}`,
  };
  const data = { ...defaults, ...overrides, categoryId };
  return prisma.product.create({ data });
}
