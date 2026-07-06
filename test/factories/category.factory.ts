import { PrismaService } from '../../src/prisma/prisma.service.js';

export async function createCategory(
  prisma: PrismaService,
  overrides: { name?: string; slug?: string } = {},
) {
  const defaults = {
    name: 'Category Test',
    slug: `cat-${Date.now()}`,
  };
  const data = { ...defaults, ...overrides };
  return prisma.category.create({ data });
}
